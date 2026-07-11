"""stripe_usd_rls_seguridad

Revision ID: 20260704_0001
Revises: 20260620_0001
Create Date: 2026-07-04

- Moneda por defecto USD en ordenes y pagos
- Habilita RLS en todas las tablas (bloquea acceso directo vía Supabase REST/anon)
"""
from typing import Sequence, Union

from alembic import op

revision: str = "20260704_0001"
down_revision: Union[str, None] = "20260620_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

TABLAS = [
    "usuarios",
    "productos",
    "variantes",
    "carritos",
    "items_carrito",
    "direcciones_envio",
    "ordenes",
    "items_orden",
    "pagos",
    "configuraciones",
]


def upgrade() -> None:
    # ── Moneda USD ────────────────────────────────────────────────────────────
    op.alter_column("ordenes", "moneda", server_default="USD")
    op.alter_column("pagos", "moneda", server_default="USD")
    op.execute("UPDATE ordenes SET moneda = 'USD' WHERE moneda = 'COP'")
    op.execute("UPDATE pagos SET moneda = 'USD' WHERE moneda = 'COP'")

    # ── Row Level Security (Supabase) ─────────────────────────────────────────
    # Sin políticas = acceso denegado para roles anon/authenticated vía PostgREST.
    # El backend FastAPI usa conexión directa (postgres/service_role) y no se ve afectado.
    for tabla in TABLAS:
        op.execute(f"ALTER TABLE {tabla} ENABLE ROW LEVEL SECURITY")
        op.execute(f"ALTER TABLE {tabla} FORCE ROW LEVEL SECURITY")


def downgrade() -> None:
    for tabla in TABLAS:
        op.execute(f"ALTER TABLE {tabla} NO FORCE ROW LEVEL SECURITY")
        op.execute(f"ALTER TABLE {tabla} DISABLE ROW LEVEL SECURITY")

    op.alter_column("ordenes", "moneda", server_default="COP")
    op.alter_column("pagos", "moneda", server_default="COP")
