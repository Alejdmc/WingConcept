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
from app.services.stock_service import stock_service
from app.services.orden_timeline_service import orden_timeline_service
from app.services.orden_notification_service import orden_notification_service

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY

MONEDA_DEFAULT = "usd"
STRIPE_MIN_USD_CENTS = 50


def _generar_referencia(orden_id: uuid.UUID) -> str:
    """Genera referencia única para Stripe."""
    return f"WC-{str(orden_id)[:8].upper()}-{uuid.uuid4().hex[:6].upper()}"


def _stripe_text(value: str, max_len: int = 500) -> str:
    return (value or "")[:max_len]


def _build_stripe_line_items(orden: Orden, moneda: str) -> list[dict]:
    """Construye line_items de Stripe respetando descuento e impuestos de la orden."""
    items_linea: list[dict] = []
    subtotal = sum(float(item.precio_unitario) * item.cantidad for item in orden.items)
    descuento = float(orden.descuento or 0)

    for item in orden.items:
        nombre_producto = "Producto WingConcept"
        if item.snapshot and "nombre" in item.snapshot:
            nombre_producto = item.snapshot["nombre"]

        line_subtotal = float(item.precio_unitario) * item.cantidad
        if subtotal > 0 and descuento > 0:
            line_net = line_subtotal - (descuento * line_subtotal / subtotal)
            unit_amount = int(round((line_net / item.cantidad) * 100))
        else:
            unit_amount = int(round(float(item.precio_unitario) * 100))

        if unit_amount < 1:
            raise PagoFallidoError(
                "El total de la orden es demasiado bajo para procesar el pago."
            )

        items_linea.append({
            "price_data": {
                "currency": moneda,
                "unit_amount": unit_amount,
                "product_data": {
                    "name": _stripe_text(nombre_producto, 250),
                    "description": _stripe_text(
                        item.snapshot.get("variante", "") if item.snapshot else ""
                    ),
                },
            },
            "quantity": item.cantidad,
        })

    impuestos_cents = int(round(float(orden.impuestos or 0) * 100))
    if impuestos_cents > 0:
        items_linea.append({
            "price_data": {
                "currency": moneda,
                "unit_amount": impuestos_cents,
                "product_data": {"name": "Sales Tax"},
            },
            "quantity": 1,
        })

    if not items_linea:
        raise PagoFallidoError("La orden no tiene productos para cobrar.")

    total_cents = sum(
        entry["price_data"]["unit_amount"] * entry["quantity"]
        for entry in items_linea
    )
    if moneda == "usd" and total_cents < STRIPE_MIN_USD_CENTS:
        raise PagoFallidoError(
            "El total de la orden debe ser al menos $0.50 USD para pagar con tarjeta."
        )

    return items_linea


def _checkout_response(pago: Pago, checkout_url: str) -> CheckoutResponse:
    return CheckoutResponse(
        pago_id=pago.id,
        referencia=pago.referencia,
        proveedor="stripe",
        checkout_url=checkout_url,
        estado=pago.estado,
    )


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
        if not settings.STRIPE_SUCCESS_URL or not settings.STRIPE_CANCEL_URL:
            raise PagoFallidoError(
                "Stripe checkout URLs no están configuradas (STRIPE_SUCCESS_URL / STRIPE_CANCEL_URL)."
            )

        moneda = (orden.moneda or MONEDA_DEFAULT).lower()
        pago_result = await db.execute(select(Pago).where(Pago.orden_id == orden.id))
        pago_existente = pago_result.scalar_one_or_none()

        if pago_existente and pago_existente.estado == "approved":
            raise PagoFallidoError("Esta orden ya fue pagada exitosamente.")

        if (
            pago_existente
            and pago_existente.estado == "pending"
            and pago_existente.stripe_session_id
        ):
            try:
                session = stripe.checkout.Session.retrieve(pago_existente.stripe_session_id)
                if session.status == "open" and session.url:
                    logger.info(
                        "Reutilizando sesión Stripe abierta: %s orden:%s",
                        pago_existente.referencia,
                        orden.numero_orden,
                    )
                    return _checkout_response(pago_existente, session.url)
            except stripe.StripeError as e:
                logger.warning(
                    "No se pudo reutilizar sesión Stripe %s: %s",
                    pago_existente.stripe_session_id,
                    getattr(e, "user_message", str(e)),
                )

        referencia = (
            pago_existente.referencia
            if pago_existente
            else _generar_referencia(orden.id)
        )

        try:
            items_linea = _build_stripe_line_items(orden, moneda)
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
            logger.error(
                "Error creando sesión Stripe para orden %s: %s",
                orden.numero_orden,
                getattr(e, "user_message", str(e)),
            )
            raise PagoFallidoError(
                f"Error procesando el pago: {getattr(e, 'user_message', None) or str(e)}"
            )
        except PagoFallidoError:
            raise
        except Exception as e:
            logger.exception(
                "Error inesperado creando checkout Stripe para orden %s",
                orden.numero_orden,
            )
            raise PagoFallidoError(f"Error procesando el pago: {e}") from e

        if pago_existente:
            pago_existente.referencia = referencia
            pago_existente.estado = "pending"
            pago_existente.monto = float(orden.total)
            pago_existente.moneda = moneda.upper()
            pago_existente.stripe_session_id = session.id
            pago_existente.respuesta_proveedor = {
                "session_id": session.id,
                "session_url": session.url,
            }
            pago = pago_existente
        else:
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

        return _checkout_response(pago, session.url)

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
        Marca el pago como aprobado, descuenta stock y actualiza la orden.
        Si no hay stock suficiente tras el pago, la orden queda en error_stock.
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
            estado_prev = pago.orden.estado
            stock_ok = await stock_service.descontar_por_orden(db, pago.orden)
            pago.orden.estado = "pagado" if stock_ok else "error_stock"
            await orden_timeline_service.registrar_evento(
                db,
                pago.orden,
                pago.orden.estado,
                actor="payment",
                mensaje=(
                    "Payment received. We're checking inventory."
                    if not stock_ok
                    else "Payment received successfully."
                ),
            )
            await orden_notification_service.notificar_estado(
                db, pago.orden, estado_prev, proveedor_pago="stripe",
            )
            if not stock_ok:
                logger.error(
                    "Orden %s pagada pero sin stock — marcada error_stock",
                    pago.orden.numero_orden,
                )

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

        was_approved = pago.estado == "approved"
        pago.estado = "refunded"
        if respuesta_proveedor:
            pago.respuesta_proveedor = respuesta_proveedor

        if pago.orden:
            estado_prev = pago.orden.estado
            if was_approved:
                await stock_service.restaurar_por_orden(db, pago.orden)
            pago.orden.estado = "reembolsado"
            await orden_timeline_service.registrar_evento(
                db, pago.orden, "reembolsado", actor="payment",
            )
            await orden_notification_service.notificar_estado(
                db, pago.orden, estado_prev,
            )

        logger.info(f"Pago reembolsado: {pago.referencia}")
        return pago


pago_service = PagoService()
