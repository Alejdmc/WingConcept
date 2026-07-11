"""
WingConcept Backend — Modelo Variante de Producto
Cada producto puede tener múltiples variantes (talla, color, potencia, etc.)
"""
import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.producto import Producto


class Variante(Base):
    __tablename__ = "variantes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    producto_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("productos.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Nombre descriptivo: "Rojo / Talla M", "Motor 80cc", etc.
    nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    sku: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True, index=True)

    # Precio en USD
    # Para Stripe internacional se convierte en el servicio de pagos
    precio: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    precio_anterior: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)

    stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    stock_minimo: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Atributos flexibles: {"color": "rojo", "talla": "M", "potencia": "80cc"}
    # Tipo JSONB para queries eficientes en PostgreSQL
    atributos: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    es_principal: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Peso para cálculo de envío (kg)
    peso_kg: Mapped[Optional[float]] = mapped_column(Numeric(8, 3), nullable=True)

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
    producto: Mapped["Producto"] = relationship("Producto", back_populates="variantes")

    @property
    def tiene_stock(self) -> bool:
        return self.stock >= self.stock_minimo

    @property
    def en_descuento(self) -> bool:
        return self.precio_anterior is not None and self.precio_anterior > self.precio

    def __repr__(self) -> str:
        return f"<Variante {self.nombre} [stock:{self.stock}]>"

