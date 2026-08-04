"""CMS: configurador opciones, site blocks, contenido_extra en productos

Revision ID: 20260804_0011
Revises: 20260731_0010
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260804_0011"
down_revision: Union[str, None] = "20260731_0010"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "productos",
        sa.Column("contenido_extra", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )

    op.create_table(
        "configurador_opciones",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("producto_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("productos.id", ondelete="CASCADE"), nullable=False),
        sa.Column("grupo", sa.String(50), nullable=False),
        sa.Column("slug", sa.String(100), nullable=False),
        sa.Column("nombre", sa.String(255), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=True),
        sa.Column("precio", sa.Float(), nullable=False, server_default="0"),
        sa.Column("imagen", sa.String(500), nullable=True),
        sa.Column("extra", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("orden", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("activo", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("producto_id", "grupo", "slug", name="uq_config_opcion_producto_grupo_slug"),
    )
    op.create_index("ix_configurador_opciones_producto_id", "configurador_opciones", ["producto_id"])
    op.create_index("ix_configurador_opciones_grupo", "configurador_opciones", ["grupo"])
    op.create_index("ix_configurador_opciones_activo", "configurador_opciones", ["activo"])

    op.create_table(
        "site_blocks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("clave", sa.String(150), nullable=False, unique=True),
        sa.Column("seccion", sa.String(80), nullable=False),
        sa.Column("etiqueta", sa.String(255), nullable=False),
        sa.Column("tipo", sa.String(30), nullable=False, server_default="text"),
        sa.Column("valor", sa.Text(), nullable=True),
        sa.Column("orden", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("activo", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_site_blocks_clave", "site_blocks", ["clave"])
    op.create_index("ix_site_blocks_seccion", "site_blocks", ["seccion"])
    op.create_index("ix_site_blocks_activo", "site_blocks", ["activo"])


def downgrade() -> None:
    op.drop_table("site_blocks")
    op.drop_table("configurador_opciones")
    op.drop_column("productos", "contenido_extra")
