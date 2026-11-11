"""
WingConcept Backend — Modelo Clearance
Publicaciones de equipo de segunda mano (trikes, paramotores, alas…) hechas por
usuarios registrados. WingConcept solo es intermediario: el pago y la entrega
se acuerdan directamente entre comprador y vendedor.
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

CATEGORIAS = ("trike", "paramotor", "paraglider", "engine", "accessory", "other")
ESTADOS = ("activo", "vendido", "oculto")


class ClearanceListing(Base):
    __tablename__ = "clearance_listings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    usuario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True
    )
    titulo: Mapped[str] = mapped_column(String(150), nullable=False)
    descripcion: Mapped[str] = mapped_column(Text, nullable=False)
    precio: Mapped[float] = mapped_column(Float, nullable=False)
    moneda: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    categoria: Mapped[str] = mapped_column(String(30), default="trike", nullable=False, index=True)
    ubicacion: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    imagenes: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    contacto_nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    contacto_email: Mapped[str] = mapped_column(String(254), nullable=False)
    contacto_telefono: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    estado: Mapped[str] = mapped_column(String(20), default="activo", nullable=False, index=True)

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

    def __repr__(self) -> str:
        return f"<ClearanceListing {self.titulo}>"
