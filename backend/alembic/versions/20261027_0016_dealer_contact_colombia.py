"""dealer_contact_colombia

Revision ID: 20261027_0016
Revises: 20261027_0015
Create Date: 2026-10-27

- Teléfono y email opcionales en dealers.
- Dealer en Colombia pedido por el cliente (doc "Arregloswing" §1.6):
  Daniel Ramírez — Hacienda La Cabaña.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20261027_0016"
down_revision: Union[str, None] = "20261027_0015"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

NOMBRE = "Daniel Ramírez"


def upgrade() -> None:
    op.add_column("dealers", sa.Column("telefono", sa.String(50), nullable=True))
    op.add_column("dealers", sa.Column("email", sa.String(254), nullable=True))
    op.execute(sa.text("""
        INSERT INTO dealers (id, nombre, equipo, ubicacion, descripcion, instagram, telefono, email, orden, activo, created_at, updated_at)
        SELECT gen_random_uuid(), :nombre, 'Hacienda La Cabaña', 'Colombia',
               'Authorized Wing Concept dealer in Colombia. Contact for trike demos, sales, and pilot support.',
               'https://www.instagram.com/danramirezart/', '+57 3123829289', 'chelelo001@gmail.com', 30, true, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM dealers WHERE lower(nombre) IN (lower(:nombre), 'daniel ramirez'))
    """).bindparams(nombre=NOMBRE))


def downgrade() -> None:
    op.execute(sa.text("DELETE FROM dealers WHERE nombre = :nombre AND equipo = 'Hacienda La Cabaña'").bindparams(nombre=NOMBRE))
    op.drop_column("dealers", "email")
    op.drop_column("dealers", "telefono")
