"""clearance_listings

Revision ID: 20261111_0018
Revises: 20261027_0017
Create Date: 2026-11-11

Sección Clearance: equipo de segunda mano publicado por usuarios registrados.
WingConcept solo es intermediario (no procesa pagos de estas publicaciones).
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20261111_0018"
down_revision: Union[str, None] = "20261027_0017"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "clearance_listings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("usuario_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False),
        sa.Column("titulo", sa.String(150), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=False),
        sa.Column("precio", sa.Float(), nullable=False),
        sa.Column("moneda", sa.String(3), nullable=False, server_default="USD"),
        sa.Column("categoria", sa.String(30), nullable=False, server_default="trike"),
        sa.Column("ubicacion", sa.String(150), nullable=True),
        sa.Column("imagenes", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("contacto_nombre", sa.String(120), nullable=False),
        sa.Column("contacto_email", sa.String(254), nullable=False),
        sa.Column("contacto_telefono", sa.String(40), nullable=True),
        sa.Column("estado", sa.String(20), nullable=False, server_default="activo"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.CheckConstraint("precio >= 0", name="ck_clearance_precio_no_negativo"),
        sa.CheckConstraint("estado IN ('activo', 'vendido', 'oculto')", name="ck_clearance_estado"),
    )
    op.create_index("ix_clearance_listings_usuario_id", "clearance_listings", ["usuario_id"])
    op.create_index("ix_clearance_listings_estado", "clearance_listings", ["estado"])
    op.create_index("ix_clearance_listings_categoria", "clearance_listings", ["categoria"])


def downgrade() -> None:
    op.drop_index("ix_clearance_listings_categoria", table_name="clearance_listings")
    op.drop_index("ix_clearance_listings_estado", table_name="clearance_listings")
    op.drop_index("ix_clearance_listings_usuario_id", table_name="clearance_listings")
    op.drop_table("clearance_listings")
