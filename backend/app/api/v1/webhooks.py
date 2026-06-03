"""
WingConcept Backend — Webhooks Endpoints
POST /api/v1/webhooks/wompi
POST /api/v1/webhooks/stripe

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WOMPI WEBHOOKS
  Configurar en: https://comercios.wompi.co → Configuración → Webhooks
  URL a registrar: https://tudominio.com/api/v1/webhooks/wompi
  Secret: WOMPI_EVENTS_SECRET en .env
  Docs: https://docs.wompi.co/docs/en/events

STRIPE WEBHOOKS
  Configurar en: https://dashboard.stripe.com → Developers → Webhooks
  URL a registrar: https://tudominio.com/api/v1/webhooks/stripe
  Secret: STRIPE_WEBHOOK_SECRET en .env (whsec_xxx)
  Obtener con CLI: stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe
  Docs: https://stripe.com/docs/webhooks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
import hashlib
import hmac
import logging

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.services.email_service import email_service
from app.services.pago_service import pago_service

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])
logger = logging.getLogger(__name__)


# ── WOMPI Webhook ─────────────────────────────────────────────────────────────

@router.post("/wompi", status_code=status.HTTP_200_OK)
async def webhook_wompi(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Recibe eventos de Wompi. Valida firma HMAC con WOMPI_EVENTS_SECRET.
    Docs: https://docs.wompi.co/docs/en/events

    SEGURIDAD: En producción, WOMPI_EVENTS_SECRET es obligatorio.
    Sin él, cualquiera puede enviar eventos falsos para marcar órdenes como pagadas.
    """
    # En producción la validación HMAC es obligatoria sin excepción.
    if settings.is_production and not settings.WOMPI_EVENTS_SECRET:
        logger.critical(
            "WOMPI_EVENTS_SECRET no configurado en producción. "
            "Webhook deshabilitado por seguridad."
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Servicio de pagos no configurado correctamente.",
        )

    payload_bytes = await request.body()

    # Validar firma HMAC
    firma_header = request.headers.get("X-Event-Checksum", "")
    if settings.WOMPI_EVENTS_SECRET:
        firma_esperada = hmac.new(
            settings.WOMPI_EVENTS_SECRET.encode(),
            payload_bytes,
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(firma_esperada, firma_header):
            logger.warning(
                f"Webhook Wompi: firma HMAC inválida desde "
                f"{request.client.host if request.client else 'unknown'}"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Firma inválida",
            )
    else:
        logger.warning(
            "Webhook Wompi sin validación HMAC "
            "(WOMPI_EVENTS_SECRET no configurado — solo en desarrollo)"
        )

    try:
        import json
        data = json.loads(payload_bytes.decode("utf-8"))
        evento = data.get("event", "")
        transaction = data.get("data", {}).get("transaction", {})

        referencia = transaction.get("reference", "")
        estado_wompi = transaction.get("status", "")
        transaction_id = transaction.get("id", "")

        logger.info(f"Webhook Wompi: evento={evento} ref={referencia} estado={estado_wompi}")

        if evento == "transaction.updated":
            if estado_wompi == "APPROVED":
                pago = await pago_service.procesar_pago_aprobado(
                    db,
                    referencia=referencia,
                    transaction_id=transaction_id,
                    respuesta_proveedor=transaction,
                )
                # Email solo si la orden fue pagada (no si ya lo estaba o tiene error de stock)
                if pago.orden and pago.orden.usuario and pago.orden.estado == "pagado":
                    await email_service.enviar_pago_confirmado(
                        email=pago.orden.usuario.email,
                        nombre=pago.orden.usuario.nombre,
                        numero_orden=pago.orden.numero_orden,
                        proveedor="wompi",
                    )
                elif pago.orden and pago.orden.estado == "error_stock":
                    logger.critical(
                        f"[ACCIÓN REQUERIDA] Orden {pago.orden.numero_orden} "
                        f"cobrada por Wompi pero con error de stock — reembolso manual requerido."
                    )

            elif estado_wompi in ("DECLINED", "VOIDED", "ERROR"):
                await pago_service.procesar_pago_rechazado(
                    db,
                    referencia=referencia,
                    respuesta_proveedor=transaction,
                )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error procesando webhook Wompi: {e}", exc_info=True)
        # Retornar 200 para que Wompi no reintente indefinidamente

    return {"status": "received"}


# ── STRIPE Webhook ────────────────────────────────────────────────────────────

@router.post("/stripe", status_code=status.HTTP_200_OK)
async def webhook_stripe(
    request: Request,
    db: AsyncSession = Depends(get_db),
    stripe_signature: str = Header(None, alias="stripe-signature"),
):
    """
    Recibe eventos de Stripe. Valida firma con STRIPE_WEBHOOK_SECRET.
    Docs: https://stripe.com/docs/webhooks

    SEGURIDAD: En producción, STRIPE_WEBHOOK_SECRET es obligatorio.
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
                elif pago.orden and pago.orden.estado == "error_stock":
                    logger.critical(
                        f"[ACCIÓN REQUERIDA] Orden {pago.orden.numero_orden} "
                        f"cobrada por Stripe pero con error de stock — reembolso manual requerido."
                    )

        elif evento_tipo == "payment_intent.payment_failed":
            payment_intent = event["data"]["object"]
            logger.warning(f"Pago Stripe fallido: {payment_intent.get('id')}")

        elif evento_tipo == "charge.refunded":
            charge = event["data"]["object"]
            logger.info(f"Reembolso Stripe: charge={charge.get('id')}")

    except Exception as e:
        logger.error(f"Error procesando webhook Stripe: {e}", exc_info=True)

    return {"status": "received"}
