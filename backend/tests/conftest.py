"""
WingConcept Backend — Fixtures de pytest
"""
import os
import sys
from pathlib import Path

# Asegurar que `import app` funcione en CI y local (pytest puede no añadir el root)
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

import pytest

# Marcar entorno de tests antes de importar la app (NullPool en database.py)
os.environ["TESTING"] = "1"

# En local no usar DATABASE_URL del .env (evita conectar a Supabase/prod accidentalmente).
# En CI, GitHub Actions inyecta DATABASE_URL al servicio postgres del workflow.
if not os.environ.get("GITHUB_ACTIONS"):
    os.environ["DATABASE_URL"] = ""

# Variables mínimas requeridas por Settings antes de importar la app
os.environ.setdefault(
    "SECRET_KEY",
    "test_secret_key_for_pytest_minimum_32_chars",
)
os.environ.setdefault("ENVIRONMENT", "development")
os.environ.setdefault("ALLOWED_HOSTS", "localhost,127.0.0.1,test")
os.environ.setdefault("REDIS_HOST", "localhost")
os.environ.setdefault("REDIS_PORT", "6379")

# Limpiar caché de settings si ya fue importado en otra sesión
try:
    from app.config import get_settings
    get_settings.cache_clear()
except ImportError:
    pass


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"

