"""merge_dealers_unfeature_heads

Revision ID: 20260722_0008
Revises: 20260718_0007, 20260721_0007
Create Date: 2026-07-22

Une las ramas dealers e unfeature_ipro.
"""
from typing import Sequence, Union

revision: str = "20260722_0008"
down_revision: Union[str, tuple[str, ...], None] = ("20260718_0007", "20260721_0007")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
