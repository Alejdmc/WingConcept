"""webhook_events_idempotencia

Revision ID: 20260713_0005
Revises: 20260713_0004
Create Date: 2026-07-13

- Tabla webhook_events para idempotencia y auditoría de webhooks Stripe
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID

revision: str = "20260713_0005"
down_revision: Union[str, None] = "20260713_0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "webhook_events",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("proveedor", sa.String(20), nullable=False),
        sa.Column("event_id", sa.String(200), nullable=False),
        sa.Column("event_type", sa.String(100), nullable=False),
        sa.Column("payload", JSONB, nullable=False),
        sa.Column("procesado", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("intentos", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("ultimo_error", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("procesado_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("event_id", name="uq_webhook_events_event_id"),
    )
    op.create_index("ix_webhook_events_proveedor", "webhook_events", ["proveedor"])
    op.create_index("ix_webhook_events_procesado", "webhook_events", ["procesado"])

    op.execute("ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE webhook_events FORCE ROW LEVEL SECURITY")


def downgrade() -> None:
    op.execute("ALTER TABLE webhook_events NO FORCE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE webhook_events DISABLE ROW LEVEL SECURITY")
    op.drop_index("ix_webhook_events_procesado", table_name="webhook_events")
    op.drop_index("ix_webhook_events_proveedor", table_name="webhook_events")
    op.drop_table("webhook_events")
