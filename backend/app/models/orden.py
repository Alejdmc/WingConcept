"""
WingConcept Backend — Modelo Orden
Estados: pendiente → pagado → procesando → enviado → entregado | cancelado | reembolsado
"""
import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.direccion_envio import DireccionEnvio
    from app.models.pago import Pago
    from app.models.usuario import Usuario
    from app.models.variante import Variante


class Orden(Base):
    __tablename__ = "ordenes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # Número legible para el cliente: WC-2026-0001
    numero_orden: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )

    usuario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    direccion_envio_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("direcciones_envio.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Estados del ciclo de vida de la orden
    estado: Mapped[str] = mapped_column(
        String(30), nullable=False, default="pendiente", index=True
    )
    # pendiente | pagado | procesando | enviado | entregado | cancelado | reembolsado

    # Montos
    subtotal: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    descuento: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    costo_envio: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    impuestos: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    total: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    # Moneda: USD (Stripe)
    moneda: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")

    # Notas del cliente y del administrador
    notas_cliente: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    notas_admin: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Tracking de envío
    numero_guia: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    transportadora: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

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
    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="ordenes")
    items: Mapped[List["ItemOrden"]] = relationship(
        "ItemOrden", back_populates="orden", cascade="all, delete-orphan"
    )
    pago: Mapped[Optional["Pago"]] = relationship("Pago", back_populates="orden", uselist=False)
    direccion_envio: Mapped[Optional["DireccionEnvio"]] = relationship(
        "DireccionEnvio", back_populates="ordenes"
    )

    def __repr__(self) -> str:
        return f"<Orden {self.numero_orden} [{self.estado}] ${self.total}>"


class ItemOrden(Base):
    __tablename__ = "items_orden"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    orden_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("ordenes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    variante_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("variantes.id", ondelete="RESTRICT"),
        nullable=False,
    )

    cantidad: Mapped[int] = mapped_column(Integer, nullable=False)
    precio_unitario: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    # Snapshot del producto al momento de compra
    snapshot: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    # {"nombre": "Paramotor XR200", "variante": "Rojo / Motor 80cc", "sku": "WC-001"}

    # ── Relaciones ────────────────────────────────────────────
    orden: Mapped["Orden"] = relationship("Orden", back_populates="items")
    variante: Mapped["Variante"] = relationship("Variante")

    @property
    def subtotal(self) -> float:
        return float(self.precio_unitario) * self.cantidad

    def __repr__(self) -> str:
        return f"<ItemOrden variante:{self.variante_id} x{self.cantidad}>"

