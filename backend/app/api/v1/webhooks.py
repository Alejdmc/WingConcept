"""
WingConcept Backend — Webhooks Stripe
POST /api/v1/webhooks/stripe
"""
import logging

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.services.pago_service import pago_service
from app.services.webhook_service import webhook_service

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])
logger = logging.getLogger(__name__)


@router.post("/stripe", status_code=status.HTTP_200_OK)
async def webhook_stripe(
    request: Request,
    db: AsyncSession = Depends(get_db),
    stripe_signature: str = Header(None, alias="stripe-signature"),
):
    """
    Recibe eventos de Stripe. Valida firma, persiste en webhook_events y procesa
    con idempotencia (reintentos seguros si Stripe reenvía el evento).
    """
    if settings.is_production and not settings.STRIPE_WEBHOOK_SECRET:
        logger.critical(
            "STRIPE_WEBHOOK_SECRET no configurado en producción. "
            "Webhook deshabilitado por seguridad."
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Servicio de pagos no configurado correctamente.",
        )

    payload_bytes = await request.body()

    if not stripe_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stripe-Signature header requerido",
        )

    try:
        event = pago_service.validar_webhook_stripe(payload_bytes, stripe_signature)
    except ValueError as e:
        logger.warning(
            f"Webhook Stripe: firma inválida desde "
            f"{request.client.host if request.client else 'unknown'} — {e}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firma Stripe inválida",
        )

    event_dict = webhook_service.stripe_event_a_dict(event)
    event_id = event_dict.get("id", "")
    event_type = event_dict.get("type", "")

    if not event_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Evento Stripe sin ID",
        )

    logger.info(f"Webhook Stripe: evento={event_type} id={event_id}")

    evento_db, _es_nuevo = await webhook_service.registrar_o_obtener(
        db,
        proveedor="stripe",
        event_id=event_id,
        event_type=event_type,
        payload=event_dict,
    )

    if evento_db.procesado:
        return {"status": "duplicate", "event_id": event_id}

    try:
        await webhook_service.procesar_evento_stripe(db, evento_db)
    except HTTPException:
        raise
    except Exception:
        # 500 → Stripe reintenta; el evento queda persistido con ultimo_error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error procesando webhook — se reintentará",
        )

    return {"status": "received", "event_id": event_id}
