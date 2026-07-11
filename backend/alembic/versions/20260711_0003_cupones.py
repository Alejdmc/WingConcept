"""cupones_descuentos

Revision ID: 20260711_0003
Revises: 20260711_0002
Create Date: 2026-07-11

- Tabla cupones (descuentos de un solo uso por usuario)
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "20260711_0003"
down_revision: Union[str, None] = "20260711_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "cupones",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("codigo", sa.String(30), nullable=False),
        sa.Column("usuario_id", UUID(as_uuid=True), sa.ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False),
        sa.Column("creado_por_id", UUID(as_uuid=True), sa.ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True),
        sa.Column("tipo", sa.String(20), nullable=False),
        sa.Column("valor", sa.Numeric(12, 2), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=True),
        sa.Column("usado", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("usado_en", sa.DateTime(timezone=True), nullable=True),
        sa.Column("orden_id", UUID(as_uuid=True), sa.ForeignKey("ordenes.id", ondelete="SET NULL"), nullable=True),
        sa.Column("expira_en", sa.DateTime(timezone=True), nullable=True),
        sa.Column("email_enviado", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_cupones_codigo", "cupones", ["codigo"], unique=True)
    op.create_index("ix_cupones_usuario_id", "cupones", ["usuario_id"])


def downgrade() -> None:
    op.drop_index("ix_cupones_usuario_id", table_name="cupones")
    op.drop_index("ix_cupones_codigo", table_name="cupones")
    op.drop_table("cupones")
