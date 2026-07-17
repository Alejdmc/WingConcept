"""
WingConcept Backend — Conexión a base de datos
PostgreSQL via Supabase usando SQLAlchemy 2.0 async
"""
import logging
import os
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.config import settings
from app.core.exceptions import ServicioNoDisponibleError

logger = logging.getLogger(__name__)

# ── Convertir URL de sync a async (asyncpg) ──────────────────────────────────
# psycopg2 → asyncpg para operaciones asíncronas
def _build_async_url(url: str) -> str:
    """Convierte postgresql:// a postgresql+asyncpg:// para SQLAlchemy async."""
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+asyncpg://", 1)
    return url


ASYNC_DATABASE_URL = _build_async_url(settings.DATABASE_URL) if settings.DATABASE_URL else ""

# En pytest evitar pool persistente — previene "Future attached to a different loop"
_engine_kwargs = {
    "echo": settings.DEBUG,
    "pool_pre_ping": True,
}
if os.environ.get("TESTING") == "1":
    _engine_kwargs["poolclass"] = NullPool
else:
    _engine_kwargs.update(pool_size=10, max_overflow=20, pool_recycle=3600)

# ── Engine ────────────────────────────────────────────────────────────────────
engine = create_async_engine(
    ASYNC_DATABASE_URL,
    **_engine_kwargs,
) if ASYNC_DATABASE_URL else None

# ── Session Factory ───────────────────────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
) if engine else None


# ── Base declarativa para todos los modelos ───────────────────────────────────
class Base(DeclarativeBase):
    pass


# ── Dependency para FastAPI ───────────────────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency de FastAPI que provee una sesión de DB por request.
    Maneja commit/rollback automáticamente.
    """
    if AsyncSessionLocal is None:
        raise ServicioNoDisponibleError(
            "Base de datos no configurada. Configura DATABASE_URL en .env cuando esté disponible."
        )

    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as exc:
            await session.rollback()
            logger.error(f"Error en sesión DB, rollback ejecutado: {exc}")
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """
    Crea todas las tablas en la DB.
    Usar solo en desarrollo — en producción usar Alembic migrations.
    """
    if engine is None:
        logger.warning("DATABASE_URL no configurado, omitiendo init_db")
        return

    # Importar todos los modelos para que SQLAlchemy los registre
    from app.models import (  # noqa: F401
        usuario, producto, variante, configuracion,
        carrito, orden, pago, direccion_envio, admin_invitation,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Base de datos inicializada correctamente")
