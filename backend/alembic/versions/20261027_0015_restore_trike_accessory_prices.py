"""restore_trike_accessory_prices

Revision ID: 20261027_0015
Revises: 20261026_0014
Create Date: 2026-10-27

La primera versión de 0014 actualizaba precios de accesorios de Vanguard/Nomadic
desde el doc del cliente. Los precios no se cambian sin pedido explícito: se
restauran los precios que había antes de 0014 (tabla de respaldo de 0014).
Si 0014 ya corrió con la versión nueva, no cambia nada.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20261027_0015"
down_revision: Union[str, None] = "20261026_0014"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

BACKUP = "configurador_opciones_bak_20261026"


def upgrade() -> None:
    conn = op.get_bind()
    exists = conn.execute(sa.text("SELECT to_regclass(:t)"), {"t": BACKUP}).scalar()
    if not exists:
        return
    conn.execute(sa.text(f"""
        UPDATE configurador_opciones c
        SET precio = b.precio, updated_at = NOW()
        FROM {BACKUP} b
        WHERE b.id = c.id AND c.precio IS DISTINCT FROM b.precio
    """))


def downgrade() -> None:
    # Restaurar precios es idempotente; no hay nada que deshacer.
    pass
