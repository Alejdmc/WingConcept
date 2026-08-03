"""orden eventos timeline

Revision ID: 20260731_0010
Revises: 20260724_0009
Create Date: 2026-07-31
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260731_0010"
down_revision: Union[str, None] = "20260724_0009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

EVENT_TITLES = {
    "pendiente": "Order placed",
    "pagado": "Payment confirmed",
    "procesando": "Preparing your order",
    "enviado": "Shipped",
    "entregado": "Delivered",
    "cancelado": "Order cancelled",
    "reembolsado": "Order refunded",
    "error_stock": "Stock issue — we're resolving it",
}

MAIN_FLOW = ["pendiente", "pagado", "procesando", "enviado", "entregado"]


def upgrade() -> None:
    op.create_table(
        "orden_eventos",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("orden_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("ordenes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("estado", sa.String(30), nullable=False),
        sa.Column("titulo", sa.String(120), nullable=False),
        sa.Column("mensaje", sa.Text(), nullable=True),
        sa.Column("actor", sa.String(20), nullable=False, server_default="system"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_orden_eventos_orden_id", "orden_eventos", ["orden_id"])
    op.create_index("ix_orden_eventos_created_at", "orden_eventos", ["created_at"])

    conn = op.get_bind()
    ordenes = conn.execute(
        sa.text("SELECT id, estado, created_at, updated_at, numero_guia, transportadora FROM ordenes")
    ).fetchall()

    for orden in ordenes:
        orden_id, estado, created_at, updated_at, guia, transportadora = orden
        eventos = []

        if estado in MAIN_FLOW:
            idx = MAIN_FLOW.index(estado)
            for i, est in enumerate(MAIN_FLOW[: idx + 1]):
                ts = created_at if i == 0 else updated_at
                mensaje = None
                if est == "enviado" and guia:
                    mensaje = f"Tracking: {guia}"
                    if transportadora:
                        mensaje += f" ({transportadora})"
                eventos.append((est, EVENT_TITLES[est], mensaje, ts))
        else:
            eventos.append(("pendiente", EVENT_TITLES["pendiente"], None, created_at))
            if estado in EVENT_TITLES:
                eventos.append((estado, EVENT_TITLES[estado], None, updated_at))

        for est, titulo, mensaje, ts in eventos:
            conn.execute(
                sa.text(
                    """
                    INSERT INTO orden_eventos (id, orden_id, estado, titulo, mensaje, actor, created_at)
                    VALUES (gen_random_uuid(), :orden_id, :estado, :titulo, :mensaje, 'system', :created_at)
                    """
                ),
                {
                    "orden_id": orden_id,
                    "estado": est,
                    "titulo": titulo,
                    "mensaje": mensaje,
                    "created_at": ts,
                },
            )


def downgrade() -> None:
    op.drop_index("ix_orden_eventos_created_at", table_name="orden_eventos")
    op.drop_index("ix_orden_eventos_orden_id", table_name="orden_eventos")
    op.drop_table("orden_eventos")
