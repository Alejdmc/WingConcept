"""cupones_rls

Revision ID: 20260713_0004
Revises: 20260711_0003
Create Date: 2026-07-13

- Habilita RLS en cupones (consistente con el resto de tablas)
"""
from typing import Sequence, Union

from alembic import op

revision: str = "20260713_0004"
down_revision: Union[str, None] = "20260711_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE cupones ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE cupones FORCE ROW LEVEL SECURITY")


def downgrade() -> None:
    op.execute("ALTER TABLE cupones NO FORCE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE cupones DISABLE ROW LEVEL SECURITY")
