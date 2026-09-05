"""
WingConcept Backend — Cliente Redis
Usado para: caché, rate limiting, carrito anónimo, sesiones
Conexión configurada via REDIS_HOST, REDIS_PORT, REDIS_PASSWORD en .env
"""
import json
import logging
import time
from typing import Any, Callable, Optional, TypeVar

import redis.asyncio as aioredis

from app.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T")

# ── Pool de conexiones Redis ──────────────────────────────────────────────────
_redis_pool: Optional[aioredis.Redis] = None
_redis_backoff_until: float = 0
_redis_error_logged: bool = False
REDIS_BACKOFF_SECONDS = 30


def _reset_redis_pool() -> None:
    global _redis_pool
    _redis_pool = None


def _redis_in_backoff() -> bool:
    return time.monotonic() < _redis_backoff_until


def _mark_redis_ok() -> None:
    global _redis_error_logged
    if _redis_error_logged:
        logger.info("Redis reconectado")
    _redis_error_logged = False


def _mark_redis_unavailable(err: Exception, context: str) -> None:
    global _redis_backoff_until, _redis_error_logged
    _reset_redis_pool()
    _redis_backoff_until = time.monotonic() + REDIS_BACKOFF_SECONDS
    if not _redis_error_logged:
        logger.warning(
            "Redis no disponible (%s) — %s; operando sin caché ~%ss",
            err,
            context,
            REDIS_BACKOFF_SECONDS,
        )
        _redis_error_logged = True


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
            socket_connect_timeout=2,
            socket_timeout=2,
            retry_on_timeout=True,
        )
    return _redis_pool


async def close_redis() -> None:
    """Cierra la conexión Redis al apagar la app."""
    global _redis_pool, _redis_backoff_until, _redis_error_logged
    if _redis_pool:
        await _redis_pool.aclose()
        _redis_pool = None
        logger.info("Conexión Redis cerrada")
    _redis_backoff_until = 0
    _redis_error_logged = False


async def _run_redis(context: str, operation: Callable[[aioredis.Redis], Any], fallback: T) -> T:
    if _redis_in_backoff():
        return fallback
    try:
        client = await get_redis()
        result = await operation(client)
        _mark_redis_ok()
        return result
    except Exception as err:
        _mark_redis_unavailable(err, context)
        return fallback


# ── Helpers de caché ──────────────────────────────────────────────────────────

async def cache_set(key: str, value: Any, ttl: int = None) -> None:
    """Guarda un valor en Redis como JSON con TTL opcional."""

    async def _set(client: aioredis.Redis) -> None:
        serialized = json.dumps(value, default=str)
        if ttl:
            await client.set(key, serialized, ex=ttl)
        else:
            await client.set(key, serialized)

    await _run_redis(f"cache_set [{key}]", _set, None)


async def cache_get(key: str) -> Optional[Any]:
    """Obtiene un valor de Redis y lo deserializa."""

    async def _get(client: aioredis.Redis) -> Optional[Any]:
        data = await client.get(key)
        if data:
            return json.loads(data)
        return None

    return await _run_redis(f"cache_get [{key}]", _get, None)


async def cache_delete(key: str) -> None:
    """Elimina una clave de Redis."""

    async def _delete(client: aioredis.Redis) -> None:
        await client.delete(key)

    await _run_redis(f"cache_delete [{key}]", _delete, None)


async def cache_delete_pattern(pattern: str) -> None:
    """Elimina claves que coincidan con un patrón (ej: 'productos:*')."""

    async def _delete_pattern(client: aioredis.Redis) -> None:
        keys = [key async for key in client.scan_iter(match=pattern, count=200)]
        if keys:
            await client.delete(*keys)

    await _run_redis(f"cache_delete_pattern [{pattern}]", _delete_pattern, None)


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
    """
    if _redis_in_backoff():
        return True, limit

    try:
        client = await get_redis()
        key = f"{prefix}:{identifier}"
        count = await client.incr(key)
        if count == 1:
            await client.expire(key, window_seconds)
        _mark_redis_ok()
        remaining = max(0, limit - count)
        return count <= limit, remaining
    except Exception as err:
        _mark_redis_unavailable(err, f"rate_limit [{identifier}]")
        # Fail-open: mejor servir tráfico sin rate limit que bloquear todo el sitio
        return True, limit


# ── Refresh Token Blacklist (rotation) ────────────────────────────────────────

REFRESH_TOKEN_PREFIX = "rt:used"


async def marcar_refresh_token_usado(jti: str, ttl_seconds: int) -> None:
    """Marca un refresh token como consumido en Redis."""

    async def _mark(client: aioredis.Redis) -> None:
        await client.set(f"{REFRESH_TOKEN_PREFIX}:{jti}", "used", ex=ttl_seconds)

    await _run_redis(f"marcar_refresh_token [{jti}]", _mark, None)


async def refresh_token_fue_usado(jti: str) -> bool:
    """Verifica si un refresh token ya fue consumido (detecta reuso/robo)."""

    async def _exists(client: aioredis.Redis) -> bool:
        return await client.exists(f"{REFRESH_TOKEN_PREFIX}:{jti}") > 0

    result = await _run_redis(f"refresh_token_fue_usado [{jti}]", _exists, None)
    if result is None:
        if settings.is_production:
            return True  # Fail-closed: rechazar refresh si no se puede verificar blacklist
        return False
    return result


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
