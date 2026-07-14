"""
WingConcept Backend — Eventos de webhook (Stripe, etc.)
Persistencia para idempotencia y reintentos ante fallos transitorios.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    proveedor: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    event_id: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)
    procesado: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    intentos: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    ultimo_error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )
    procesado_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    def __repr__(self) -> str:
        return f"<WebhookEvent {self.proveedor}:{self.event_id} [{self.event_type}]>"
