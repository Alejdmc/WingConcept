"""Shared setup for backend scripts (Docker + local direct execution)."""
from __future__ import annotations

import os
import sys


def ensure_app_importable() -> str:
    """Put backend root on sys.path so `import app...` works when run as a file."""
    backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    if backend_root not in sys.path:
        sys.path.insert(0, backend_root)
    return backend_root


def load_backend_env() -> str:
    """Load backend/.env when present (no-op in Docker if env vars are injected)."""
    from dotenv import load_dotenv

    backend_root = ensure_app_importable()
    env_path = os.path.join(backend_root, ".env")
    if os.path.isfile(env_path):
        load_dotenv(env_path)
    return backend_root


def _skip_redis_cache() -> bool:
    return os.environ.get("SKIP_REDIS_CACHE", "").strip().lower() in ("1", "true", "yes")


def invalidate_product_cache(*, quiet: bool = False, required: bool = False) -> bool:
    """
    Clear Redis product cache (productos:*).
    Returns True on success or when skipped; False only if required=True and Redis fails.
    """
    if _skip_redis_cache():
        return True

    host = os.environ.get("REDIS_HOST", "localhost")
    port = int(os.environ.get("REDIS_PORT", "6379"))
    password = os.environ.get("REDIS_PASSWORD") or None
    db = int(os.environ.get("REDIS_DB", "0"))

    try:
        import redis

        client = redis.Redis(
            host=host,
            port=port,
            password=password,
            db=db,
            decode_responses=True,
            socket_connect_timeout=2,
            socket_timeout=2,
        )
        client.ping()
        deleted = 0
        for key in client.scan_iter("productos:*", count=200):
            client.delete(key)
            deleted += 1
        if deleted and not quiet:
            print(f"  ✓ Caché Redis productos invalidada ({deleted} claves)")
        return True
    except Exception as exc:
        if required:
            print(f"ERROR: Redis requerido pero no disponible ({host}:{port}): {exc}", file=sys.stderr)
            return False
        if not quiet:
            print(f"  ℹ Caché Redis omitida ({host}:{port} no disponible)")
        return True
