"""
WingConcept Backend — Admin Dashboard Stats
Consultas en paralelo (asyncio.gather) con caché Redis de corta duración.
"""
import asyncio
import logging
from typing import Any, Callable, Dict, List

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


async def _run_with_session(fn: Callable[[AsyncSession], Any]) -> Any:
    """Ejecuta una consulta en su propia sesión (AsyncSession no es concurrent-safe)."""
    async with AsyncSessionLocal() as db:
        return await fn(db)


async def _count_usuarios(db: AsyncSession) -> int:
    return (await db.execute(select(func.count(Usuario.id)))).scalar() or 0


async def _count_productos_activos(db: AsyncSession) -> int:
    return (
        await db.execute(
            select(func.count(Producto.id)).where(Producto.activo == True)
        )
    ).scalar() or 0


async def _count_ordenes(db: AsyncSession) -> int:
    return (await db.execute(select(func.count(Orden.id)))).scalar() or 0


async def _count_ordenes_pendientes(db: AsyncSession) -> int:
    return (
        await db.execute(
            select(func.count(Orden.id)).where(Orden.estado == "pendiente")
        )
    ).scalar() or 0


async def _sum_ingresos(db: AsyncSession) -> float:
    result = await db.execute(
        select(func.sum(Orden.total)).where(Orden.estado.in_(_ESTADOS_INGRESOS))
    )
    return float(result.scalar() or 0)


async def _sum_kg_vendidos(db: AsyncSession) -> float:
    result = await db.execute(
        select(func.coalesce(func.sum(ItemOrden.cantidad), 0))
        .join(Orden, Orden.id == ItemOrden.orden_id)
        .where(Orden.estado.in_(_ESTADOS_KG))
    )
    return float(result.scalar() or 0)


async def _fetch_alertas_stock(db: AsyncSession) -> List[dict]:
    return await stock_service.listar_alertas_stock(db)


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
    """Estadísticas del dashboard admin con caché Redis y queries en paralelo."""
    if use_cache:
        cached = await cache_get(CACHE_KEY)
        if cached is not None:
            return cached

    try:
        (
            total_usuarios,
            total_productos,
            total_ordenes,
            ordenes_pendientes,
            ingresos_totales,
            kg_vendidos,
            alertas_stock,
        ) = await asyncio.gather(
            _run_with_session(_count_usuarios),
            _run_with_session(_count_productos_activos),
            _run_with_session(_count_ordenes),
            _run_with_session(_count_ordenes_pendientes),
            _run_with_session(_sum_ingresos),
            _run_with_session(_sum_kg_vendidos),
            _run_with_session(_fetch_alertas_stock),
        )
    except Exception as exc:
        logger.error("Error fetching admin dashboard stats: %s", exc)
        raise

    result = _build_response(
        total_usuarios,
        total_productos,
        total_ordenes,
        ordenes_pendientes,
        ingresos_totales,
        kg_vendidos,
        alertas_stock,
    )
    await cache_set(CACHE_KEY, result, ttl=CACHE_TTL)
    return result
