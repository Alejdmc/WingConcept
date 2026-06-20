"""
WingConcept Backend — Modelos Carrito y ItemCarrito
Soporte dual: usuarios autenticados (DB) y anónimos (Redis).
"""
import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.usuario import Usuario
    from app.models.variante import Variante


class Carrito(Base):
    __tablename__ = "carritos"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # NULL = carrito de usuario autenticado sin usuario (no debería ocurrir en producción)
    usuario_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=True,
        unique=True,
        index=True,
    )

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
    usuario: Mapped[Optional["Usuario"]] = relationship("Usuario", back_populates="carrito")
    items: Mapped[List["ItemCarrito"]] = relationship(
        "ItemCarrito", back_populates="carrito", cascade="all, delete-orphan"
    )

    @property
    def total(self) -> float:
        return sum(item.subtotal for item in self.items)

    def __repr__(self) -> str:
        return f"<Carrito usuario:{self.usuario_id} items:{len(self.items)}>"


class ItemCarrito(Base):
    __tablename__ = "items_carrito"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    carrito_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("carritos.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    variante_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("variantes.id", ondelete="CASCADE"),
        nullable=False,
    )
    cantidad: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Precio al momento de agregar (puede cambiar el precio del producto)
    precio_unitario: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    # Opciones del configurador 3D (motor, acabado, upgrades…) si aplica
    configuracion: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )

    # ── Relaciones ────────────────────────────────────────────
    carrito: Mapped["Carrito"] = relationship("Carrito", back_populates="items")
    variante: Mapped["Variante"] = relationship("Variante")

    @property
    def subtotal(self) -> float:
        return float(self.precio_unitario) * self.cantidad

    def __repr__(self) -> str:
        return f"<ItemCarrito variante:{self.variante_id} x{self.cantidad}>"

