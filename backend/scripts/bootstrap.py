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


def invalidate_product_cache() -> None:
    """Clear Redis product list cache after catalog seeds."""
    try:
        import redis

        host = os.environ.get("REDIS_HOST", "localhost")
        port = int(os.environ.get("REDIS_PORT", "6379"))
        password = os.environ.get("REDIS_PASSWORD") or None
        db = int(os.environ.get("REDIS_DB", "0"))
        client = redis.Redis(host=host, port=port, password=password, db=db)
        keys = client.keys("productos:*")
        if keys:
            client.delete(*keys)
            print(f"  ✓ Caché Redis productos invalidada ({len(keys)} claves)")
    except Exception as exc:
        print(f"  ⚠ No se pudo invalidar caché Redis: {exc}")
