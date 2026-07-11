"""
WingConcept Backend — Modelo Pago (Stripe / USD)
"""
import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.orden import Orden


class Pago(Base):
    __tablename__ = "pagos"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    orden_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("ordenes.id", ondelete="RESTRICT"),
        nullable=False,
        unique=True,
        index=True,
    )

    proveedor: Mapped[str] = mapped_column(
        String(20), nullable=False, default="stripe", index=True
    )

    referencia: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True
    )

    transaction_id: Mapped[Optional[str]] = mapped_column(
        String(200), nullable=True, index=True
    )

    # pending | approved | declined | refunded
    estado: Mapped[str] = mapped_column(
        String(30), nullable=False, default="pending", index=True
    )

    monto: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    moneda: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")

    respuesta_proveedor: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    stripe_session_id: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )

    orden: Mapped["Orden"] = relationship("Orden", back_populates="pago")

    def __repr__(self) -> str:
        return f"<Pago {self.referencia} [{self.proveedor}] {self.estado}>"
