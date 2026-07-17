"""
WingConcept Backend — Alembic env.py
Configurado para SQLAlchemy async + carga de DATABASE_URL desde .env
"""
import asyncio
import os
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# ── Cargar .env ───────────────────────────────────────────────────────────────
from dotenv import load_dotenv
if not os.environ.get("DATABASE_URL"):
    load_dotenv()

# ── Importar todos los modelos para autogenerate ──────────────────────────────
from app.database import Base
from app.models import (  # noqa: F401
    usuario, producto, variante, configuracion, carrito, orden, pago,
    direccion_envio, admin_invitation,
)

# ── Config Alembic ────────────────────────────────────────────────────────────
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)


def _normalize_database_url(url: str, *, for_async: bool) -> str:
    """
    Normaliza DATABASE_URL según el modo de migración.

    - Online (async): requiere driver asyncpg (postgresql+asyncpg://)
    - Offline (sync): usa psycopg2 (postgresql://)
    """
    if not url:
        return url
    if for_async:
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url
    if url.startswith("postgresql+asyncpg://"):
        return url.replace("postgresql+asyncpg://", "postgresql://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


database_url = os.getenv("DATABASE_URL", "")
config.set_main_option("sqlalchemy.url", _normalize_database_url(database_url, for_async=True))

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = _normalize_database_url(config.get_main_option("sqlalchemy.url"), for_async=False)
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

