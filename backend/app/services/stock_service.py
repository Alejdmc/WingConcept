"""
WingConcept Backend — Stock Service
Descuenta/restaura inventario en pagos y expone alertas de stock bajo.
"""
import logging
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.core.exceptions import StockInsuficienteError
from app.models.orden import ItemOrden, Orden
from app.models.producto import Producto
from app.models.variante import Variante
from app.utils.redis_client import cache_delete_pattern

logger = logging.getLogger(__name__)

CATALOG_CATEGORIES = frozenset({"repuestos", "accesorios"})
CACHE_PREFIX = "productos"


class StockService:
    """Gestión de inventario para partes/accesorios del carrito."""

    @property
    def low_stock_threshold(self) -> int:
        return settings.LOW_STOCK_THRESHOLD

    def _tracks_inventory(self, variante: Variante) -> bool:
        """stock > 0 = inventario limitado; stock <= 0 = ilimitado (configuradores)."""
        return int(variante.stock) > 0

    async def _invalidate_product_cache(self) -> None:
        await cache_delete_pattern(f"{CACHE_PREFIX}:*")

    async def validar_items_orden(
        self,
        db: AsyncSession,
        items: List[ItemOrden],
    ) -> None:
        """Verifica stock disponible antes de crear la orden."""
        for item in items:
            result = await db.execute(
                select(Variante)
                .options(selectinload(Variante.producto))
                .where(Variante.id == item.variante_id, Variante.activo == True)
            )
            variante = result.scalar_one_or_none()
            if not variante:
                raise StockInsuficienteError("Product variant unavailable")

            if not self._tracks_inventory(variante):
                continue

            if variante.stock < item.cantidad:
                nombre = variante.producto.nombre if variante.producto else variante.nombre
                raise StockInsuficienteError(nombre)

    async def descontar_por_orden(self, db: AsyncSession, orden: Orden) -> bool:
        """
        Descuenta stock tras pago aprobado.
        Retorna False si no hay stock suficiente (orden → error_stock).
        """
        if not orden.items:
            return True

        variantes_map: dict[UUID, Variante] = {}
        for item in orden.items:
            if item.variante_id in variantes_map:
                continue
            result = await db.execute(
                select(Variante)
                .options(selectinload(Variante.producto))
                .where(Variante.id == item.variante_id)
                .with_for_update()
            )
            variante = result.scalar_one_or_none()
            if not variante:
                logger.error("Variante %s no encontrada al descontar stock", item.variante_id)
                return False
            variantes_map[item.variante_id] = variante

        cantidades: dict[UUID, int] = {}
        for item in orden.items:
            cantidades[item.variante_id] = cantidades.get(item.variante_id, 0) + item.cantidad

        for variante_id, qty in cantidades.items():
            variante = variantes_map[variante_id]
            if not self._tracks_inventory(variante):
                continue
            if variante.stock < qty:
                nombre = variante.producto.nombre if variante.producto else variante.nombre
                logger.error(
                    "Stock insuficiente post-pago: %s (need %s, have %s) orden %s",
                    nombre, qty, variante.stock, orden.numero_orden,
                )
                return False
            variante.stock -= qty

        await db.flush()
        await self._invalidate_product_cache()
        logger.info("Stock descontado para orden %s", orden.numero_orden)
        return True

    async def restaurar_por_orden(self, db: AsyncSession, orden: Orden) -> None:
        """Devuelve stock al inventario (reembolso)."""
        if not orden.items:
            return

        for item in orden.items:
            result = await db.execute(
                select(Variante).where(Variante.id == item.variante_id).with_for_update()
            )
            variante = result.scalar_one_or_none()
            if not variante or not self._tracks_inventory(variante):
                continue
            variante.stock += item.cantidad

        await db.flush()
        await self._invalidate_product_cache()
        logger.info("Stock restaurado para orden %s", orden.numero_orden)

    async def listar_alertas_stock(
        self,
        db: AsyncSession,
        *,
        categorias: Optional[frozenset] = None,
    ) -> List[dict]:
        """
        Productos con inventario limitado y stock <= umbral (default 2).
        Solo repuestos/accesorios por defecto.
        """
        cats = categorias or CATALOG_CATEGORIES
        threshold = self.low_stock_threshold

        result = await db.execute(
            select(Variante, Producto)
            .join(Producto, Producto.id == Variante.producto_id)
            .where(
                Producto.activo == True,
                Variante.activo == True,
                Producto.categoria.in_(list(cats)),
                Variante.stock > 0,
                Variante.stock <= threshold,
            )
            .order_by(Variante.stock, Producto.nombre)
        )

        alerts = []
        for variante, producto in result.all():
            alerts.append({
                "producto_id": str(producto.id),
                "variante_id": str(variante.id),
                "nombre": producto.nombre,
                "categoria": producto.categoria,
                "stock": variante.stock,
                "stock_minimo": variante.stock_minimo,
                "sku": variante.sku,
                "nivel": "agotado" if variante.stock == 0 else "bajo",
            })
        return alerts


stock_service = StockService()
