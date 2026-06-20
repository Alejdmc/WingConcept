"""inicial_esquema_completo

Revision ID: 20260620_0001
Revises:
Create Date: 2026-06-20

Esquema inicial WingConcept — 10 tablas:
  usuarios, productos, variantes, carritos, items_carrito,
  direcciones_envio, ordenes, items_orden, pagos, configuraciones
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260620_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── usuarios ──────────────────────────────────────────────────────────────
    op.create_table(
        "usuarios",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("nombre", sa.String(100), nullable=False),
        sa.Column("apellido", sa.String(100), nullable=False),
        sa.Column("telefono", sa.String(20), nullable=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("rol", sa.String(20), nullable=False, server_default="client"),
        sa.Column("activo", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("email_verificado", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("reset_token", sa.String(255), nullable=True),
        sa.Column("reset_token_expires", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_usuarios_email", "usuarios", ["email"])
    op.create_index("ix_usuarios_rol", "usuarios", ["rol"])

    # ── productos ───────────────────────────────────────────────────────────────
    op.create_table(
        "productos",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("nombre", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(300), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=True),
        sa.Column("descripcion_corta", sa.String(500), nullable=True),
        sa.Column("categoria", sa.String(100), nullable=False),
        sa.Column("subcategoria", sa.String(100), nullable=True),
        sa.Column("imagenes", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("modelo_3d_url", sa.String(500), nullable=True),
        sa.Column("meta_titulo", sa.String(70), nullable=True),
        sa.Column("meta_descripcion", sa.String(160), nullable=True),
        sa.Column("activo", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("destacado", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("orden_display", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_productos_nombre", "productos", ["nombre"])
    op.create_index("ix_productos_slug", "productos", ["slug"])
    op.create_index("ix_productos_categoria", "productos", ["categoria"])
    op.create_index("ix_productos_activo", "productos", ["activo"])

    # ── variantes ───────────────────────────────────────────────────────────────
    op.create_table(
        "variantes",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("producto_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("nombre", sa.String(255), nullable=False),
        sa.Column("sku", sa.String(100), nullable=True),
        sa.Column("precio", sa.Numeric(12, 2), nullable=False),
        sa.Column("precio_anterior", sa.Numeric(12, 2), nullable=True),
        sa.Column("stock", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("stock_minimo", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("atributos", postgresql.JSONB(), nullable=True),
        sa.Column("activo", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("es_principal", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("peso_kg", sa.Numeric(8, 3), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["producto_id"], ["productos.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("sku"),
    )
    op.create_index("ix_variantes_producto_id", "variantes", ["producto_id"])
    op.create_index("ix_variantes_sku", "variantes", ["sku"])

    # ── carritos ────────────────────────────────────────────────────────────────
    op.create_table(
        "carritos",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("usuario_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("usuario_id"),
    )
    op.create_index("ix_carritos_usuario_id", "carritos", ["usuario_id"])

    # ── items_carrito ───────────────────────────────────────────────────────────
    op.create_table(
        "items_carrito",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("carrito_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("variante_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("cantidad", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("precio_unitario", sa.Numeric(12, 2), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["carrito_id"], ["carritos.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["variante_id"], ["variantes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_items_carrito_carrito_id", "items_carrito", ["carrito_id"])

    # ── direcciones_envio ───────────────────────────────────────────────────────
    op.create_table(
        "direcciones_envio",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("usuario_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("nombre_destinatario", sa.String(200), nullable=False),
        sa.Column("telefono", sa.String(20), nullable=True),
        sa.Column("linea1", sa.String(300), nullable=False),
        sa.Column("linea2", sa.String(300), nullable=True),
        sa.Column("ciudad", sa.String(100), nullable=False),
        sa.Column("departamento_estado", sa.String(100), nullable=False),
        sa.Column("codigo_postal", sa.String(20), nullable=True),
        sa.Column("pais", sa.String(2), nullable=False, server_default="CO"),
        sa.Column("es_principal", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_direcciones_envio_usuario_id", "direcciones_envio", ["usuario_id"])

    # ── ordenes ─────────────────────────────────────────────────────────────────
    op.create_table(
        "ordenes",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("numero_orden", sa.String(50), nullable=False),
        sa.Column("usuario_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("direccion_envio_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("estado", sa.String(30), nullable=False, server_default="pendiente"),
        sa.Column("subtotal", sa.Numeric(12, 2), nullable=False),
        sa.Column("descuento", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("costo_envio", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("impuestos", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("total", sa.Numeric(12, 2), nullable=False),
        sa.Column("moneda", sa.String(3), nullable=False, server_default="COP"),
        sa.Column("notas_cliente", sa.Text(), nullable=True),
        sa.Column("notas_admin", sa.Text(), nullable=True),
        sa.Column("numero_guia", sa.String(100), nullable=True),
        sa.Column("transportadora", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["direccion_envio_id"], ["direcciones_envio.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("numero_orden"),
    )
    op.create_index("ix_ordenes_numero_orden", "ordenes", ["numero_orden"])
    op.create_index("ix_ordenes_usuario_id", "ordenes", ["usuario_id"])
    op.create_index("ix_ordenes_estado", "ordenes", ["estado"])

    # ── items_orden ─────────────────────────────────────────────────────────────
    op.create_table(
        "items_orden",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("orden_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("variante_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("cantidad", sa.Integer(), nullable=False),
        sa.Column("precio_unitario", sa.Numeric(12, 2), nullable=False),
        sa.Column("snapshot", postgresql.JSONB(), nullable=True),
        sa.ForeignKeyConstraint(["orden_id"], ["ordenes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["variante_id"], ["variantes.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_items_orden_orden_id", "items_orden", ["orden_id"])

    # ── pagos ───────────────────────────────────────────────────────────────────
    op.create_table(
        "pagos",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("orden_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("proveedor", sa.String(20), nullable=False),
        sa.Column("referencia", sa.String(100), nullable=False),
        sa.Column("transaction_id", sa.String(200), nullable=True),
        sa.Column("estado", sa.String(30), nullable=False, server_default="pending"),
        sa.Column("monto", sa.Numeric(12, 2), nullable=False),
        sa.Column("moneda", sa.String(3), nullable=False, server_default="COP"),
        sa.Column("respuesta_proveedor", postgresql.JSONB(), nullable=True),
        sa.Column("redirect_url", sa.String(500), nullable=True),
        sa.Column("stripe_session_id", sa.String(200), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["orden_id"], ["ordenes.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("orden_id"),
        sa.UniqueConstraint("referencia"),
    )
    op.create_index("ix_pagos_orden_id", "pagos", ["orden_id"])
    op.create_index("ix_pagos_proveedor", "pagos", ["proveedor"])
    op.create_index("ix_pagos_referencia", "pagos", ["referencia"])
    op.create_index("ix_pagos_transaction_id", "pagos", ["transaction_id"])
    op.create_index("ix_pagos_estado", "pagos", ["estado"])

    # ── configuraciones ─────────────────────────────────────────────────────────
    op.create_table(
        "configuraciones",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("usuario_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("producto_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("nombre", sa.String(255), nullable=True),
        sa.Column("opciones", postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("notas", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["producto_id"], ["productos.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_configuraciones_usuario_id", "configuraciones", ["usuario_id"])
    op.create_index("ix_configuraciones_producto_id", "configuraciones", ["producto_id"])


def downgrade() -> None:
    op.drop_table("configuraciones")
    op.drop_table("pagos")
    op.drop_table("items_orden")
    op.drop_table("ordenes")
    op.drop_table("direcciones_envio")
    op.drop_table("items_carrito")
    op.drop_table("carritos")
    op.drop_table("variantes")
    op.drop_table("productos")
    op.drop_table("usuarios")
