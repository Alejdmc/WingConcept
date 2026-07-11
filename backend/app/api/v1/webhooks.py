"""
WingConcept Backend — Webhooks Stripe
POST /api/v1/webhooks/stripe

Configurar en: https://dashboard.stripe.com → Developers → Webhooks
URL: https://tudominio.com/api/v1/webhooks/stripe
Eventos: checkout.session.completed, checkout.session.expired,
         payment_intent.payment_failed, charge.refunded
"""
import logging

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.services.email_service import email_service
from app.services.pago_service import pago_service

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])
logger = logging.getLogger(__name__)


@router.post("/stripe", status_code=status.HTTP_200_OK)
async def webhook_stripe(
    request: Request,
    db: AsyncSession = Depends(get_db),
    stripe_signature: str = Header(None, alias="stripe-signature"),
):
    """
    Recibe eventos de Stripe. Valida firma con STRIPE_WEBHOOK_SECRET.
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

    evento_tipo = event["type"]
    logger.info(f"Webhook Stripe: evento={evento_tipo}")

    try:
        if evento_tipo == "checkout.session.completed":
            session = event["data"]["object"]
            referencia = session.get("client_reference_id", "")
            payment_intent = session.get("payment_intent", "")

            if referencia and payment_intent:
                pago = await pago_service.procesar_pago_aprobado(
                    db,
                    referencia=referencia,
                    transaction_id=payment_intent,
                    respuesta_proveedor=dict(session),
                )
                if pago.orden and pago.orden.usuario and pago.orden.estado == "pagado":
                    await email_service.enviar_pago_confirmado(
                        email=pago.orden.usuario.email,
                        nombre=pago.orden.usuario.nombre,
                        numero_orden=pago.orden.numero_orden,
                        proveedor="stripe",
                    )

        elif evento_tipo == "checkout.session.expired":
            session = event["data"]["object"]
            await pago_service.procesar_pago_rechazado(
                db,
                stripe_session_id=session.get("id"),
                respuesta_proveedor=dict(session),
            )

        elif evento_tipo == "payment_intent.payment_failed":
            payment_intent = event["data"]["object"]
            referencia = (payment_intent.get("metadata") or {}).get("referencia")
            if referencia:
                await pago_service.procesar_pago_rechazado(
                    db,
                    referencia=referencia,
                    respuesta_proveedor=dict(payment_intent),
                )
            else:
                logger.warning(
                    f"Pago fallido sin referencia en metadata: "
                    f"{payment_intent.get('id')}"
                )

        elif evento_tipo == "charge.refunded":
            charge = event["data"]["object"]
            payment_intent = charge.get("payment_intent")
            if payment_intent:
                pago = await pago_service.procesar_pago_reembolsado(
                    db,
                    transaction_id=payment_intent,
                    respuesta_proveedor=dict(charge),
                )
                if pago.orden and pago.orden.usuario:
                    logger.info(
                        f"Reembolso procesado orden:{pago.orden.numero_orden} "
                        f"cliente:{pago.orden.usuario.email}"
                    )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error procesando webhook Stripe: {e}", exc_info=True)

    return {"status": "received"}
