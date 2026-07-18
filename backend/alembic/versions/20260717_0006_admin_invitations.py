"""admin_invitations

Revision ID: 20260717_0006
Revises: 20260713_0005
Create Date: 2026-07-17

- Tabla admin_invitations para invitar administradores por email
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "20260717_0006"
down_revision: Union[str, None] = "20260713_0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "admin_invitations",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False),
        sa.Column("invited_by_id", UUID(as_uuid=True), sa.ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False),
        sa.Column("used_by_id", UUID(as_uuid=True), sa.ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.UniqueConstraint("token_hash", name="uq_admin_invitations_token_hash"),
    )
    op.create_index("ix_admin_invitations_email", "admin_invitations", ["email"])
    op.create_index("ix_admin_invitations_token_hash", "admin_invitations", ["token_hash"])

    op.execute("ALTER TABLE admin_invitations ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE admin_invitations FORCE ROW LEVEL SECURITY")


def downgrade() -> None:
    op.execute("ALTER TABLE admin_invitations NO FORCE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE admin_invitations DISABLE ROW LEVEL SECURITY")
    op.drop_index("ix_admin_invitations_token_hash", table_name="admin_invitations")
    op.drop_index("ix_admin_invitations_email", table_name="admin_invitations")
    op.drop_table("admin_invitations")
