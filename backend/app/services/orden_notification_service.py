"""
WingConcept — Notificaciones por email de cambios de estado de órdenes.
Nunca lanza excepciones: un fallo de email no debe revertir la operación de negocio.
"""
import logging
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select

from app.models.orden import Orden
from app.services.email_service import email_service

logger = logging.getLogger(__name__)

# Estados que disparan email al cliente (solo cuando cambia el estado)
ESTADOS_CON_EMAIL = frozenset({
    "pendiente",
    "pagado",
    "procesando",
    "enviado",
    "entregado",
    "cancelado",
    "reembolsado",
    "error_stock",
})


class OrdenNotificationService:

    async def _cargar_orden_con_usuario(self, db: AsyncSession, orden: Orden) -> Optional[Orden]:
        if orden.usuario:
            return orden
        result = await db.execute(
            select(Orden)
            .options(selectinload(Orden.usuario))
            .where(Orden.id == orden.id)
        )
        return result.scalar_one_or_none()

    async def notificar_estado(
        self,
        db: AsyncSession,
        orden: Orden,
        estado_anterior: Optional[str] = None,
        *,
        proveedor_pago: str = "stripe",
        forzar: bool = False,
    ) -> bool:
        """
        Envía el email correspondiente al estado actual de la orden.
        Retorna True si se envió (o se simuló en dev), False si no aplica o falló.
        """
        if orden.estado not in ESTADOS_CON_EMAIL:
            return False

        if not forzar and estado_anterior is not None and orden.estado == estado_anterior:
            return False

        try:
            orden = await self._cargar_orden_con_usuario(db, orden)
            if not orden or not orden.usuario or not orden.usuario.email:
                ref = getattr(orden, "numero_orden", None) or str(getattr(orden, "id", "?"))
                logger.warning(
                    "Email de orden omitido: sin usuario/email (orden %s)",
                    ref,
                )
                return False

            email = orden.usuario.email
            nombre = orden.usuario.nombre or "Customer"
            numero = orden.numero_orden
            orden_id = str(orden.id)

            handlers = {
                "pendiente": lambda: email_service.enviar_confirmacion_orden(
                    email, nombre, numero, float(orden.total), orden.moneda, orden_id=orden_id,
                ),
                "pagado": lambda: email_service.enviar_pago_confirmado(
                    email, nombre, numero, proveedor_pago, orden_id=orden_id,
                ),
                "procesando": lambda: email_service.enviar_orden_procesando(
                    email, nombre, numero, orden_id=orden_id,
                ),
                "enviado": lambda: email_service.enviar_orden_enviada(
                    email,
                    nombre,
                    numero,
                    orden.numero_guia or "—",
                    orden.transportadora or "Carrier",
                    orden_id=orden_id,
                ),
                "entregado": lambda: email_service.enviar_orden_entregada(
                    email, nombre, numero, orden_id=orden_id,
                ),
                "cancelado": lambda: email_service.enviar_orden_cancelada(
                    email, nombre, numero, orden_id=orden_id,
                ),
                "reembolsado": lambda: email_service.enviar_orden_reembolsada(
                    email, nombre, numero, orden_id=orden_id,
                ),
                "error_stock": lambda: email_service.enviar_orden_error_stock(
                    email, nombre, numero, orden_id=orden_id,
                ),
            }

            handler = handlers.get(orden.estado)
            if not handler:
                return False

            sent = await handler()
            if not sent and estado_anterior is not None:
                logger.info(
                    "Email orden %s → %s no enviado (dev/sin Resend o error silenciado)",
                    numero, orden.estado,
                )
            return sent

        except Exception as exc:
            logger.error(
                "Error enviando email de orden %s (estado %s): %s",
                getattr(orden, "numero_orden", "?"),
                orden.estado,
                exc,
                exc_info=True,
            )
            return False


orden_notification_service = OrdenNotificationService()
