"""
WingConcept Backend — Webhook Service
Persistencia idempotente de eventos Stripe antes de procesarlos.
"""
import json
import logging
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.webhook_event import WebhookEvent
from app.services.email_service import email_service
from app.services.pago_service import pago_service

logger = logging.getLogger(__name__)


class WebhookService:

    async def registrar_o_obtener(
        self,
        db: AsyncSession,
        *,
        proveedor: str,
        event_id: str,
        event_type: str,
        payload: dict,
    ) -> tuple[WebhookEvent, bool]:
        """
        Persiste el evento. Retorna (evento, es_nuevo).
        Si event_id ya existe, retorna el registro existente.
        """
        existente = await db.execute(
            select(WebhookEvent).where(WebhookEvent.event_id == event_id)
        )
        row = existente.scalar_one_or_none()
        if row:
            return row, False

        evento = WebhookEvent(
            proveedor=proveedor,
            event_id=event_id,
            event_type=event_type,
            payload=payload,
            procesado=False,
            intentos=0,
        )
        db.add(evento)
        try:
            await db.flush()
            return evento, True
        except IntegrityError:
            await db.rollback()
            result = await db.execute(
                select(WebhookEvent).where(WebhookEvent.event_id == event_id)
            )
            row = result.scalar_one()
            return row, False

    async def procesar_evento_stripe(
        self, db: AsyncSession, evento: WebhookEvent
    ) -> None:
        """Procesa un evento Stripe ya persistido."""
        if evento.procesado:
            logger.info(f"Webhook duplicado ya procesado: {evento.event_id}")
            return

        evento.intentos += 1
        event_type = evento.event_type
        data_object = evento.payload.get("data", {}).get("object", {})

        try:
            if event_type == "checkout.session.completed":
                referencia = data_object.get("client_reference_id", "")
                payment_intent = data_object.get("payment_intent", "")
                if referencia and payment_intent:
                    pago = await pago_service.procesar_pago_aprobado(
                        db,
                        referencia=referencia,
                        transaction_id=payment_intent,
                        respuesta_proveedor=data_object,
                    )
                    if (
                        pago.orden
                        and pago.orden.usuario
                        and pago.orden.estado == "pagado"
                    ):
                        await email_service.enviar_pago_confirmado(
                            email=pago.orden.usuario.email,
                            nombre=pago.orden.usuario.nombre,
                            numero_orden=pago.orden.numero_orden,
                            proveedor="stripe",
                        )

            elif event_type == "checkout.session.expired":
                await pago_service.procesar_pago_rechazado(
                    db,
                    stripe_session_id=data_object.get("id"),
                    respuesta_proveedor=data_object,
                )

            elif event_type == "payment_intent.payment_failed":
                referencia = (data_object.get("metadata") or {}).get("referencia")
                if referencia:
                    await pago_service.procesar_pago_rechazado(
                        db,
                        referencia=referencia,
                        respuesta_proveedor=data_object,
                    )
                else:
                    logger.warning(
                        f"Pago fallido sin referencia en metadata: "
                        f"{data_object.get('id')}"
                    )

            elif event_type == "charge.refunded":
                payment_intent = data_object.get("payment_intent")
                if payment_intent:
                    pago = await pago_service.procesar_pago_reembolsado(
                        db,
                        transaction_id=payment_intent,
                        respuesta_proveedor=data_object,
                    )
                    if pago.orden and pago.orden.usuario:
                        logger.info(
                            f"Reembolso procesado orden:{pago.orden.numero_orden} "
                            f"cliente:{pago.orden.usuario.email}"
                        )

            evento.procesado = True
            evento.procesado_at = datetime.now(timezone.utc)
            evento.ultimo_error = None
            await db.flush()

        except Exception as exc:
            evento.ultimo_error = str(exc)[:2000]
            await db.flush()
            logger.error(
                f"Error procesando webhook {evento.event_id} "
                f"(intento {evento.intentos}): {exc}",
                exc_info=True,
            )
            raise

    @staticmethod
    def stripe_event_a_dict(event: Any) -> dict:
        """Convierte evento Stripe a dict JSON-serializable."""
        if hasattr(event, "to_dict"):
            return event.to_dict()
        if isinstance(event, dict):
            return event
        return json.loads(json.dumps(event, default=str))


webhook_service = WebhookService()
