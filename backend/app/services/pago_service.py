"""
WingConcept Backend — Pago Service
Integración con Wompi (Colombia) y Stripe (Global)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WOMPI
  Panel:      https://comercios.wompi.co
  Docs API:   https://docs.wompi.co
  Sandbox:    https://sandbox.wompi.co/v1
  Producción: https://production.wompi.co/v1
  Variables:  WOMPI_PUBLIC_KEY, WOMPI_PRIVATE_KEY, WOMPI_EVENTS_SECRET

STRIPE
  Panel:      https://dashboard.stripe.com
  Docs API:   https://stripe.com/docs/api
  Webhooks:   https://dashboard.stripe.com → Developers → Webhooks
  Variables:  STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
import hashlib
import hmac
import logging
import uuid
from typing import Optional

import httpx
import stripe
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.exceptions import PagoFallidoError, RecursoNoEncontradoError, ServicioExternoError
from app.models.orden import Orden
from app.models.pago import Pago
from app.schemas.pago import CheckoutResponse

logger = logging.getLogger(__name__)

# ── Configurar Stripe SDK ─────────────────────────────────────────────────────
# Docs: https://stripe.com/docs/api/authentication
# La clave se obtiene en: https://dashboard.stripe.com → API keys
stripe.api_key = settings.STRIPE_SECRET_KEY


def _generar_referencia(orden_id: uuid.UUID) -> str:
    """Genera referencia única para el proveedor de pagos."""
    return f"WC-{str(orden_id)[:8].upper()}-{uuid.uuid4().hex[:6].upper()}"


class PagoService:

    # ── WOMPI ─────────────────────────────────────────────────────────────────

    async def crear_pago_wompi(
        self, db: AsyncSession, orden: Orden
    ) -> CheckoutResponse:
        """
        Inicia un pago con Wompi.
        Docs: https://docs.wompi.co/docs/en/widget-checkout-web
        El frontend usa WOMPI_PUBLIC_KEY para renderizar el widget.
        Wompi redirige a WOMPI_REDIRECT_URL tras el pago.
        """
        referencia = _generar_referencia(orden.id)

        # Generar firma de integridad (HMAC-SHA256)
        # Docs: https://docs.wompi.co/docs/en/integrity
        # Requiere: WOMPI_EVENTS_SECRET (obtener en panel Wompi)
        monto_centavos = int(float(orden.total) * 100)
        cadena = f"{referencia}{monto_centavos}{orden.moneda}{settings.WOMPI_EVENTS_SECRET}"
        firma = hashlib.sha256(cadena.encode()).hexdigest()

        # Crear registro de pago
        pago = Pago(
            orden_id=orden.id,
            proveedor="wompi",
            referencia=referencia,
            estado="pending",
            monto=float(orden.total),
            moneda=orden.moneda,
            redirect_url=settings.WOMPI_REDIRECT_URL,
            respuesta_proveedor={
                "firma": firma,
                "monto_centavos": monto_centavos,
            },
        )
        db.add(pago)
        await db.flush()

        logger.info(f"Pago Wompi creado: {referencia} orden:{orden.numero_orden}")

        return CheckoutResponse(
            pago_id=pago.id,
            referencia=referencia,
            proveedor="wompi",
            estado="pending",
            # Datos para el widget de Wompi en el frontend
            # Docs: https://docs.wompi.co/docs/en/widget-checkout-web
            wompi_data={
                "public_key": settings.WOMPI_PUBLIC_KEY,
                "currency": orden.moneda,
                "amount_in_cents": monto_centavos,
                "reference": referencia,
                "signature:integrity": firma,
                "redirect_url": settings.WOMPI_REDIRECT_URL,
            },
        )

    async def verificar_transaccion_wompi(self, transaction_id: str) -> Optional[dict]:
        """
        Consulta el estado de una transacción en Wompi.
        Docs: https://docs.wompi.co/docs/en/transactions
        """
        url = f"{settings.WOMPI_BASE_URL}/transactions/{transaction_id}"
        headers = {"Authorization": f"Bearer {settings.WOMPI_PRIVATE_KEY}"}

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                return response.json().get("data", {})
        except httpx.HTTPStatusError as e:
            logger.error(f"Error HTTP Wompi [{e.response.status_code}]: {e}")
            raise ServicioExternoError("Wompi", str(e))
        except httpx.RequestError as e:
            logger.error(f"Error de conexión con Wompi: {e}")
            raise ServicioExternoError("Wompi", "Error de conexión")

    def validar_firma_wompi(self, payload: str, firma_recibida: str) -> bool:
        """
        Valida la firma HMAC de un webhook de Wompi.
        Docs: https://docs.wompi.co/docs/en/events
        Requiere: WOMPI_EVENTS_SECRET en .env
        """
        firma_esperada = hmac.new(
            settings.WOMPI_EVENTS_SECRET.encode(),
            payload.encode(),
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(firma_esperada, firma_recibida)

    # ── STRIPE ────────────────────────────────────────────────────────────────

    async def crear_pago_stripe(
        self, db: AsyncSession, orden: Orden
    ) -> CheckoutResponse:
        """
        Crea una Stripe Checkout Session para pago internacional.
        Docs: https://stripe.com/docs/api/checkout/sessions/create
        Panel: https://dashboard.stripe.com → Payments → All payments
        """
        referencia = _generar_referencia(orden.id)

        try:
            # Obtener items de la orden para la sesión
            items_linea = []
            for item in orden.items:
                nombre_producto = "Producto WingConcept"
                if item.snapshot and "nombre" in item.snapshot:
                    nombre_producto = item.snapshot["nombre"]

                items_linea.append({
                    "price_data": {
                        "currency": settings.STRIPE_CURRENCY,
                        "unit_amount": int(float(item.precio_unitario) * 100),
                        "product_data": {
                            "name": nombre_producto,
                            "description": item.snapshot.get("variante", "") if item.snapshot else "",
                        },
                    },
                    "quantity": item.cantidad,
                })

            # Crear sesión de checkout en Stripe
            # Docs: https://stripe.com/docs/checkout/quickstart
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
            )

        except stripe.StripeError as e:
            logger.error(f"Error creando sesión Stripe: {e.user_message}")
            raise PagoFallidoError(f"Error procesando el pago: {e.user_message}")

        # Crear registro de pago
        pago = Pago(
            orden_id=orden.id,
            proveedor="stripe",
            referencia=referencia,
            estado="pending",
            monto=float(orden.total),
            moneda=settings.STRIPE_CURRENCY.upper(),
            stripe_session_id=session.id,
            respuesta_proveedor={"session_id": session.id, "session_url": session.url},
        )
        db.add(pago)
        await db.flush()

        logger.info(f"Pago Stripe creado: {referencia} orden:{orden.numero_orden}")

        return CheckoutResponse(
            pago_id=pago.id,
            referencia=referencia,
            proveedor="stripe",
            checkout_url=session.url,
            estado="pending",
        )

    def validar_webhook_stripe(self, payload: bytes, sig_header: str) -> object:
        """
        Valida y procesa un webhook de Stripe.
        Docs: https://stripe.com/docs/webhooks/signatures
        Requiere: STRIPE_WEBHOOK_SECRET en .env
        Obtener con: stripe listen --print-secret (CLI) o en Dashboard → Webhooks
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
            return event
        except stripe.SignatureVerificationError as e:
            logger.warning(f"Firma Stripe inválida: {e}")
            raise ValueError("Firma de webhook Stripe inválida")

    # ── Procesamiento de pagos aprobados ─────────────────────────────────────

    async def procesar_pago_aprobado(
        self,
        db: AsyncSession,
        referencia: str,
        transaction_id: str,
        respuesta_proveedor: Optional[dict] = None,
    ) -> Pago:
        """
        Marca el pago como aprobado y actualiza el estado de la orden.
        Llamado desde los webhooks de Wompi o Stripe.
        """
        from sqlalchemy.orm import selectinload

        result = await db.execute(
            select(Pago)
            .where(Pago.referencia == referencia)
            .options(selectinload(Pago.orden))
        )
        pago = result.scalar_one_or_none()

        if not pago:
            raise RecursoNoEncontradoError("Pago")

        pago.estado = "approved"
        pago.transaction_id = transaction_id
        if respuesta_proveedor:
            pago.respuesta_proveedor = respuesta_proveedor

        # Actualizar orden a "pagado"
        pago.orden.estado = "pagado"

        # Descontar stock de las variantes
        await self._descontar_stock(db, pago.orden)

        logger.info(
            f"Pago aprobado: {referencia} tx:{transaction_id} "
            f"orden:{pago.orden.numero_orden}"
        )
        return pago

    async def procesar_pago_rechazado(
        self,
        db: AsyncSession,
        referencia: str,
        respuesta_proveedor: Optional[dict] = None,
    ) -> Pago:
        """Marca el pago como rechazado (voided o declined)."""
        result = await db.execute(select(Pago).where(Pago.referencia == referencia))
        pago = result.scalar_one_or_none()
        if not pago:
            raise RecursoNoEncontradoError("Pago")

        pago.estado = "declined"
        if respuesta_proveedor:
            pago.respuesta_proveedor = respuesta_proveedor

        logger.warning(f"Pago rechazado: {referencia}")
        return pago

    async def _descontar_stock(self, db: AsyncSession, orden: Orden) -> None:
        """Reduce el stock de las variantes al confirmar el pago."""
        from app.models.variante import Variante
        from app.core.exceptions import StockInsuficienteError

        for item in orden.items:
            result = await db.execute(
                select(Variante).where(Variante.id == item.variante_id)
            )
            variante = result.scalar_one_or_none()
            if variante:
                if variante.stock < item.cantidad:
                    logger.error(
                        f"Stock insuficiente para variante {variante.id} "
                        f"al confirmar orden {orden.numero_orden}"
                    )
                variante.stock = max(0, variante.stock - item.cantidad)


pago_service = PagoService()

