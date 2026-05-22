"""
WingConcept Backend — Modelo Configuración personalizada de paramotor
Guarda configuraciones del configurador 3D interactivo.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Configuracion(Base):
    __tablename__ = "configuraciones"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    usuario_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    producto_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("productos.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    nombre: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Configuración serializada del configurador 3D
    # Estructura: {"motor": "Polini 130", "vela": "Swing Arcus", "color_frame": "#FF0000", ...}
    opciones: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    # Notas adicionales del cliente
    notas: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )

    # ── Relaciones ────────────────────────────────────────────
    usuario: Mapped[Optional["Usuario"]] = relationship(
        "Usuario", back_populates="configuraciones"
    )
    producto: Mapped["Producto"] = relationship("Producto", back_populates="configuraciones")

    def __repr__(self) -> str:
        return f"<Configuracion {self.id} producto:{self.producto_id}>"

