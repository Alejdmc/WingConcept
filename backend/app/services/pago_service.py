"""
WingConcept Backend — Pago Service (Stripe / USD)

Panel:      https://dashboard.stripe.com
Docs API:   https://stripe.com/docs/api
Webhooks:   https://dashboard.stripe.com → Developers → Webhooks
Variables:  STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_SUCCESS_URL, STRIPE_CANCEL_URL
"""
import logging
import uuid
from typing import Optional

import stripe
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.core.exceptions import PagoFallidoError, RecursoNoEncontradoError
from app.models.orden import Orden
from app.models.pago import Pago
from app.schemas.pago import CheckoutResponse

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY

MONEDA_DEFAULT = "usd"


def _generar_referencia(orden_id: uuid.UUID) -> str:
    """Genera referencia única para Stripe."""
    return f"WC-{str(orden_id)[:8].upper()}-{uuid.uuid4().hex[:6].upper()}"


class PagoService:

    async def crear_checkout_stripe(
        self, db: AsyncSession, orden: Orden
    ) -> CheckoutResponse:
        """
        Crea una Stripe Checkout Session en USD.
        Docs: https://stripe.com/docs/api/checkout/sessions/create
        """
        if not settings.STRIPE_SECRET_KEY:
            raise PagoFallidoError("Stripe no está configurado")

        referencia = _generar_referencia(orden.id)
        moneda = (orden.moneda or MONEDA_DEFAULT).lower()

        try:
            items_linea = []
            for item in orden.items:
                nombre_producto = "Producto WingConcept"
                if item.snapshot and "nombre" in item.snapshot:
                    nombre_producto = item.snapshot["nombre"]

                items_linea.append({
                    "price_data": {
                        "currency": moneda,
                        "unit_amount": int(float(item.precio_unitario) * 100),
                        "product_data": {
                            "name": nombre_producto,
                            "description": (
                                item.snapshot.get("variante", "") if item.snapshot else ""
                            ),
                        },
                    },
                    "quantity": item.cantidad,
                })

            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=items_linea,
                mode="payment",
                success_url=f"{settings.STRIPE_SUCCESS_URL}?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=settings.STRIPE_CANCEL_URL,
                metadata={
                    "orden_id": str(orden.id),
                    "numero_orden": orden.numero_orden,
                    "referencia": referencia,
                },
                client_reference_id=referencia,
                payment_intent_data={
                    "metadata": {
                        "orden_id": str(orden.id),
                        "referencia": referencia,
                    }
                },
            )

        except stripe.StripeError as e:
            logger.error(f"Error creando sesión Stripe: {e.user_message}")
            raise PagoFallidoError(f"Error procesando el pago: {e.user_message}")

        pago = Pago(
            orden_id=orden.id,
            proveedor="stripe",
            referencia=referencia,
            estado="pending",
            monto=float(orden.total),
            moneda=moneda.upper(),
            stripe_session_id=session.id,
            respuesta_proveedor={"session_id": session.id, "session_url": session.url},
        )
        db.add(pago)
        await db.flush()

        logger.info(f"Checkout Stripe creado: {referencia} orden:{orden.numero_orden}")

        return CheckoutResponse(
            pago_id=pago.id,
            referencia=referencia,
            proveedor="stripe",
            checkout_url=session.url,
            estado="pending",
        )

    def validar_webhook_stripe(self, payload: bytes, sig_header: str) -> object:
        """Valida firma HMAC del webhook Stripe."""
        try:
            return stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except stripe.SignatureVerificationError as e:
            logger.warning(f"Firma Stripe inválida: {e}")
            raise ValueError("Firma de webhook Stripe inválida")

    async def _obtener_pago(
        self,
        db: AsyncSession,
        *,
        referencia: Optional[str] = None,
        stripe_session_id: Optional[str] = None,
        transaction_id: Optional[str] = None,
    ) -> Pago:
        """Busca un pago por referencia, session_id o transaction_id."""
        query = select(Pago).options(
            selectinload(Pago.orden).selectinload(Orden.items),
            selectinload(Pago.orden).selectinload(Orden.usuario),
        )

        if referencia:
            query = query.where(Pago.referencia == referencia)
        elif stripe_session_id:
            query = query.where(Pago.stripe_session_id == stripe_session_id)
        elif transaction_id:
            query = query.where(Pago.transaction_id == transaction_id)
        else:
            raise RecursoNoEncontradoError("Pago")

        result = await db.execute(query)
        pago = result.scalar_one_or_none()
        if not pago:
            raise RecursoNoEncontradoError("Pago")
        return pago

    async def procesar_pago_aprobado(
        self,
        db: AsyncSession,
        referencia: str,
        transaction_id: str,
        respuesta_proveedor: Optional[dict] = None,
    ) -> Pago:
        """
        Marca el pago como aprobado y la orden como pagada.
        El stock lo gestiona el admin desde el panel — no se descuenta aquí.
        """
        pago = await self._obtener_pago(db, referencia=referencia)

        if pago.estado == "approved":
            logger.warning(
                f"[IDEMPOTENCIA] Pago {referencia} ya aprobado. "
                f"Ignorando webhook duplicado. tx:{transaction_id}"
            )
            return pago

        pago.estado = "approved"
        pago.transaction_id = transaction_id
        if respuesta_proveedor:
            pago.respuesta_proveedor = respuesta_proveedor

        if pago.orden and pago.orden.estado == "pendiente":
            pago.orden.estado = "pagado"

        logger.info(
            f"Pago aprobado: {referencia} tx:{transaction_id} "
            f"orden:{pago.orden.numero_orden if pago.orden else 'N/A'}"
        )
        return pago

    async def procesar_pago_rechazado(
        self,
        db: AsyncSession,
        *,
        referencia: Optional[str] = None,
        stripe_session_id: Optional[str] = None,
        respuesta_proveedor: Optional[dict] = None,
    ) -> Pago:
        """Marca el pago como rechazado. La orden permanece pendiente para reintentar."""
        pago = await self._obtener_pago(
            db,
            referencia=referencia,
            stripe_session_id=stripe_session_id,
        )

        if pago.estado == "approved":
            logger.warning(
                f"[IDEMPOTENCIA] Pago {referencia or stripe_session_id} ya aprobado — "
                f"ignorando evento de rechazo tardío."
            )
            return pago

        if pago.estado not in ("declined", "refunded"):
            pago.estado = "declined"
            if respuesta_proveedor:
                pago.respuesta_proveedor = respuesta_proveedor
            logger.warning(f"Pago rechazado: {pago.referencia}")

        return pago

    async def procesar_pago_reembolsado(
        self,
        db: AsyncSession,
        *,
        referencia: Optional[str] = None,
        transaction_id: Optional[str] = None,
        respuesta_proveedor: Optional[dict] = None,
    ) -> Pago:
        """Marca pago y orden como reembolsados."""
        pago = await self._obtener_pago(
            db,
            referencia=referencia,
            transaction_id=transaction_id,
        )

        if pago.estado == "refunded":
            logger.warning(f"[IDEMPOTENCIA] Pago {pago.referencia} ya reembolsado.")
            return pago

        pago.estado = "refunded"
        if respuesta_proveedor:
            pago.respuesta_proveedor = respuesta_proveedor

        if pago.orden:
            pago.orden.estado = "reembolsado"

        logger.info(f"Pago reembolsado: {pago.referencia}")
        return pago


pago_service = PagoService()
