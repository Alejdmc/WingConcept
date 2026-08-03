"""
WingConcept Backend — Timeline de órdenes
Registra y consulta eventos visibles para el cliente.
"""
import logging
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.orden import Orden
from app.models.orden_evento import OrdenEvento
from app.schemas.orden import OrdenEventoResponse

logger = logging.getLogger(__name__)

EVENT_TITLES = {
    "pendiente": "Order placed",
    "pagado": "Payment confirmed",
    "procesando": "Preparing your order",
    "enviado": "Shipped",
    "entregado": "Delivered",
    "cancelado": "Order cancelled",
    "reembolsado": "Order refunded",
    "error_stock": "Stock issue — we're resolving it",
}

MAIN_FLOW = ["pendiente", "pagado", "procesando", "enviado", "entregado"]
TERMINAL_STATES = frozenset({"cancelado", "reembolsado", "error_stock"})


class OrdenTimelineService:

    def titulo_para_estado(self, estado: str) -> str:
        return EVENT_TITLES.get(estado, estado.replace("_", " ").title())

    async def registrar_evento(
        self,
        db: AsyncSession,
        orden: Orden,
        estado: str,
        *,
        mensaje: Optional[str] = None,
        actor: str = "system",
        created_at: Optional[datetime] = None,
    ) -> OrdenEvento:
        evento = OrdenEvento(
            orden_id=orden.id,
            estado=estado,
            titulo=self.titulo_para_estado(estado),
            mensaje=mensaje,
            actor=actor,
            created_at=created_at or datetime.now(timezone.utc),
        )
        db.add(evento)
        await db.flush()
        logger.info("Timeline orden %s → %s (%s)", orden.numero_orden, estado, actor)
        return evento

    async def registrar_cambio_estado(
        self,
        db: AsyncSession,
        orden: Orden,
        estado_anterior: str,
        *,
        actor: str = "admin",
    ) -> None:
        if orden.estado == estado_anterior:
            return

        mensaje = None
        if orden.estado == "enviado" and orden.numero_guia:
            mensaje = f"Tracking: {orden.numero_guia}"
            if orden.transportadora:
                mensaje += f" via {orden.transportadora}"

        await self.registrar_evento(
            db, orden, orden.estado, mensaje=mensaje, actor=actor,
        )

    async def listar_eventos(self, db: AsyncSession, orden_id: UUID) -> List[OrdenEventoResponse]:
        result = await db.execute(
            select(OrdenEvento)
            .where(OrdenEvento.orden_id == orden_id)
            .order_by(OrdenEvento.created_at, OrdenEvento.id)
        )
        return [OrdenEventoResponse.model_validate(e) for e in result.scalars().all()]

    async def ensure_timeline(self, db: AsyncSession, orden: Orden) -> None:
        """Backfill para órdenes antiguas sin eventos."""
        count = await db.scalar(
            select(func.count()).select_from(OrdenEvento).where(OrdenEvento.orden_id == orden.id)
        )
        if count and count > 0:
            return

        if orden.estado in MAIN_FLOW:
            idx = MAIN_FLOW.index(orden.estado)
            for i, est in enumerate(MAIN_FLOW[: idx + 1]):
                ts = orden.created_at if i == 0 else orden.updated_at
                mensaje = None
                if est == "enviado" and orden.numero_guia:
                    mensaje = f"Tracking: {orden.numero_guia}"
                    if orden.transportadora:
                        mensaje += f" via {orden.transportadora}"
                await self.registrar_evento(
                    db, orden, est, mensaje=mensaje, actor="system", created_at=ts,
                )
        else:
            await self.registrar_evento(
                db, orden, "pendiente", actor="system", created_at=orden.created_at,
            )
            if orden.estado in EVENT_TITLES:
                await self.registrar_evento(
                    db, orden, orden.estado, actor="system", created_at=orden.updated_at,
                )


orden_timeline_service = OrdenTimelineService()
