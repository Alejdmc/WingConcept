"""
WingConcept Backend — Fixtures de pytest
"""
import os

import pytest

# Variables mínimas requeridas por Settings antes de importar la app
os.environ.setdefault(
    "SECRET_KEY",
    "test_secret_key_for_pytest_minimum_32_chars",
)
os.environ.setdefault("ENVIRONMENT", "development")
os.environ.setdefault("ALLOWED_HOSTS", "localhost,127.0.0.1,test")

# Limpiar caché de settings si ya fue importado en otra sesión
try:
    from app.config import get_settings
    get_settings.cache_clear()
except ImportError:
    pass


@pytest.fixture
def anyio_backend():
    return "asyncio"
