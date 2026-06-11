"""
WingConcept Backend — Modelo Pago
Soporta múltiples proveedores: Wompi (Colombia) y Stripe (global).
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

    # ── Proveedor de pago ─────────────────────────────────────
    # wompi   → pagos en Colombia (COP)
    #           Docs: https://docs.wompi.co
    #           Panel: https://comercios.wompi.co
    #
    # stripe  → pagos internacionales (USD, EUR, etc.)
    #           Docs: https://stripe.com/docs/api
    #           Panel: https://dashboard.stripe.com
    proveedor: Mapped[str] = mapped_column(
        String(20), nullable=False, index=True
    )  # wompi | stripe

    # Referencia interna que enviamos al proveedor
    referencia: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True
    )

    # ID de transacción retornado por el proveedor
    # Wompi: transaction_id | Stripe: payment_intent_id (pi_xxx) o charge_id (ch_xxx)
    transaction_id: Mapped[Optional[str]] = mapped_column(
        String(200), nullable=True, index=True
    )

    # Estados normalizados (independientes del proveedor):
    # pending | approved | declined | voided | error | refunded
    estado: Mapped[str] = mapped_column(
        String(30), nullable=False, default="pending", index=True
    )

    monto: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    moneda: Mapped[str] = mapped_column(String(3), nullable=False, default="COP")

    # Respuesta completa del proveedor para auditoría y debugging
    respuesta_proveedor: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # URL de redirección post-pago (usada por Wompi)
    redirect_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Stripe: checkout session ID (cs_xxx) para tracking
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

    # ── Relaciones ────────────────────────────────────────────
    orden: Mapped["Orden"] = relationship("Orden", back_populates="pago")

    def __repr__(self) -> str:
        return f"<Pago {self.referencia} [{self.proveedor}] {self.estado}>"

