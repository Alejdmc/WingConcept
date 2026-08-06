"""
WingConcept Backend — Admin Dashboard Stats
Consultas con caché Redis de corta duración (una sesión DB por request).
"""
import logging
from typing import Any, Dict, List

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import AsyncSessionLocal
from app.models.orden import ItemOrden, Orden
from app.models.producto import Producto
from app.models.usuario import Usuario
from app.services.stock_service import stock_service
from app.utils.redis_client import cache_get, cache_set

logger = logging.getLogger(__name__)

CACHE_KEY = "admin:stats"
CACHE_TTL = 45

_ESTADOS_INGRESOS = ("pagado", "procesando", "enviado", "entregado")
_ESTADOS_KG = ("enviado", "entregado")


async def _fetch_all_stats(db: AsyncSession) -> tuple:
    """Todas las métricas en una sola sesión (evita agotar el pool de Supabase)."""
    total_usuarios = (await db.execute(select(func.count(Usuario.id)))).scalar() or 0
    total_productos = (
        await db.execute(
            select(func.count(Producto.id)).where(Producto.activo == True)
        )
    ).scalar() or 0
    total_ordenes = (await db.execute(select(func.count(Orden.id)))).scalar() or 0
    ordenes_pendientes = (
        await db.execute(
            select(func.count(Orden.id)).where(Orden.estado == "pendiente")
        )
    ).scalar() or 0
    ingresos_totales = float(
        (
            await db.execute(
                select(func.sum(Orden.total)).where(Orden.estado.in_(_ESTADOS_INGRESOS))
            )
        ).scalar()
        or 0
    )
    kg_vendidos = float(
        (
            await db.execute(
                select(func.coalesce(func.sum(ItemOrden.cantidad), 0))
                .join(Orden, Orden.id == ItemOrden.orden_id)
                .where(Orden.estado.in_(_ESTADOS_KG))
            )
        ).scalar()
        or 0
    )
    alertas_stock = await stock_service.listar_alertas_stock(db)
    return (
        total_usuarios,
        total_productos,
        total_ordenes,
        ordenes_pendientes,
        ingresos_totales,
        kg_vendidos,
        alertas_stock,
    )


def _build_response(
    total_usuarios: int,
    total_productos: int,
    total_ordenes: int,
    ordenes_pendientes: int,
    ingresos_totales: float,
    kg_vendidos: float,
    alertas_stock: List[dict],
) -> Dict[str, Any]:
    return {
        "total_usuarios": total_usuarios,
        "total_productos_activos": total_productos,
        "total_ordenes": total_ordenes,
        "ordenes_pendientes": ordenes_pendientes,
        "ingresos_totales": ingresos_totales,
        "kg_vendidos": kg_vendidos,
        "stock_bajo_total": len(alertas_stock),
        "stock_bajo_umbral": settings.LOW_STOCK_THRESHOLD,
        "alertas_stock": alertas_stock[:20],
    }


async def get_dashboard_stats(*, use_cache: bool = True) -> Dict[str, Any]:
    """Estadísticas del dashboard admin con caché Redis."""
    if use_cache:
        cached = await cache_get(CACHE_KEY)
        if cached is not None:
            return cached

    try:
        async with AsyncSessionLocal() as db:
            stats = await _fetch_all_stats(db)
    except Exception as exc:
        logger.error("Error fetching admin dashboard stats: %s", exc)
        raise

    result = _build_response(*stats)
    await cache_set(CACHE_KEY, result, ttl=CACHE_TTL)
    return result
