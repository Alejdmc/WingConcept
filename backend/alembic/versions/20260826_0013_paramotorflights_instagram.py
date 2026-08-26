"""paramotorflights_instagram

Revision ID: 20260826_0013
Revises: 20260821_0012
Create Date: 2026-08-26

- Instagram URL for Paramotor Flights LLC (@paramotorflights)
"""
from typing import Sequence, Union

from alembic import op

revision: str = "20260826_0013"
down_revision: Union[str, None] = "20260821_0012"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        UPDATE dealers
        SET instagram = 'https://www.instagram.com/paramotorflights',
            updated_at = NOW()
        WHERE nombre = 'Paramotor Flights LLC'
          AND (instagram IS NULL OR instagram = '')
    """)


def downgrade() -> None:
    op.execute("""
        UPDATE dealers
        SET instagram = NULL,
            updated_at = NOW()
        WHERE nombre = 'Paramotor Flights LLC'
          AND instagram = 'https://www.instagram.com/paramotorflights'
    """)
