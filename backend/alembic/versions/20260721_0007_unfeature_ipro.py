"""unfeature_ipro

Revision ID: 20260721_0007
Revises: 20260717_0006
Create Date: 2026-07-21

Quita I-Pro de productos destacados en homepage (commit 352170a).
"""
from typing import Sequence, Union

from alembic import op

revision: str = "20260721_0007"
down_revision: Union[str, None] = "20260717_0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "UPDATE productos SET destacado = false WHERE slug = 'i-pro'"
    )


def downgrade() -> None:
    op.execute(
        "UPDATE productos SET destacado = true WHERE slug = 'i-pro'"
    )
