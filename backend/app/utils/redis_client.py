"""
WingConcept Backend — Cliente Redis
Usado para: caché, rate limiting, carrito anónimo, sesiones
Conexión configurada via REDIS_HOST, REDIS_PORT, REDIS_PASSWORD en .env
"""
import json
import logging
from typing import Any, Optional

import redis.asyncio as aioredis

from app.config import settings

logger = logging.getLogger(__name__)

# ── Pool de conexiones Redis ──────────────────────────────────────────────────
_redis_pool: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    """Retorna el cliente Redis (singleton con pool de conexiones)."""
    global _redis_pool
    if _redis_pool is None:
        _redis_pool = aioredis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD or None,
            db=settings.REDIS_DB,
            decode_responses=True,
            encoding="utf-8",
        )
    return _redis_pool


async def close_redis() -> None:
    """Cierra la conexión Redis al apagar la app."""
    global _redis_pool
    if _redis_pool:
        await _redis_pool.aclose()
        _redis_pool = None
        logger.info("Conexión Redis cerrada")


# ── Helpers de caché ──────────────────────────────────────────────────────────

async def cache_set(key: str, value: Any, ttl: int = None) -> None:
    """Guarda un valor en Redis como JSON con TTL opcional."""
    try:
        r = await get_redis()
        serialized = json.dumps(value, default=str)
        if ttl:
            await r.setex(key, ttl, serialized)
        else:
            await r.set(key, serialized)
    except Exception as e:
        logger.warning(f"Redis cache_set error [{key}]: {e}")


async def cache_get(key: str) -> Optional[Any]:
    """Obtiene un valor de Redis y lo deserializa."""
    try:
        r = await get_redis()
        data = await r.get(key)
        if data:
            return json.loads(data)
    except Exception as e:
        logger.warning(f"Redis cache_get error [{key}]: {e}")
    return None


async def cache_delete(key: str) -> None:
    """Elimina una clave de Redis."""
    try:
        r = await get_redis()
        await r.delete(key)
    except Exception as e:
        logger.warning(f"Redis cache_delete error [{key}]: {e}")


async def cache_delete_pattern(pattern: str) -> None:
    """Elimina todas las claves que coincidan con un patrón (ej: 'productos:*')."""
    try:
        r = await get_redis()
        keys = await r.keys(pattern)
        if keys:
            await r.delete(*keys)
    except Exception as e:
        logger.warning(f"Redis cache_delete_pattern error [{pattern}]: {e}")


# ── Rate Limiting ─────────────────────────────────────────────────────────────

async def check_rate_limit(
    identifier: str,
    limit: int,
    window_seconds: int,
    prefix: str = "rl",
) -> tuple[bool, int]:
    """
    Verifica rate limit usando sliding window en Redis.
    Retorna (permitido: bool, intentos_restantes: int)

    Args:
        identifier: IP, user_id o email
        limit: máximo de requests permitidos
        window_seconds: ventana de tiempo en segundos
        prefix: prefijo de clave Redis
    """
    try:
        r = await get_redis()
        key = f"{prefix}:{identifier}"
        count = await r.incr(key)
        if count == 1:
            await r.expire(key, window_seconds)
        remaining = max(0, limit - count)
        return count <= limit, remaining
    except Exception as e:
        logger.warning(f"Redis rate_limit error [{identifier}]: {e}")
        return True, limit  # En caso de error Redis, permitir la request


# ── Carrito temporal (usuarios anónimos) ──────────────────────────────────────

CARRITO_PREFIX = "cart"


async def carrito_get(session_id: str) -> dict:
    """Obtiene el carrito de un usuario anónimo desde Redis."""
    key = f"{CARRITO_PREFIX}:{session_id}"
    data = await cache_get(key)
    return data if data else {"items": []}


async def carrito_set(session_id: str, carrito_data: dict) -> None:
    """Guarda el carrito anónimo en Redis con TTL de settings.REDIS_CART_TTL."""
    key = f"{CARRITO_PREFIX}:{session_id}"
    await cache_set(key, carrito_data, ttl=settings.REDIS_CART_TTL)


async def carrito_delete(session_id: str) -> None:
    """Elimina el carrito anónimo de Redis (tras login o checkout)."""
    key = f"{CARRITO_PREFIX}:{session_id}"
    await cache_delete(key)

