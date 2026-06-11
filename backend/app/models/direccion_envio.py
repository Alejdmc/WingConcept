"""
WingConcept Backend — Modelo DireccionEnvio
"""
import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.orden import Orden
    from app.models.usuario import Usuario


class DireccionEnvio(Base):
    __tablename__ = "direcciones_envio"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    usuario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    nombre_destinatario: Mapped[str] = mapped_column(String(200), nullable=False)
    telefono: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Dirección completa
    linea1: Mapped[str] = mapped_column(String(300), nullable=False)
    linea2: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    ciudad: Mapped[str] = mapped_column(String(100), nullable=False)
    departamento_estado: Mapped[str] = mapped_column(String(100), nullable=False)
    codigo_postal: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # ISO 3166-1 alpha-2: CO, US, ES, etc.
    pais: Mapped[str] = mapped_column(String(2), nullable=False, default="CO")

    es_principal: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )

    # ── Relaciones ────────────────────────────────────────────
    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="direcciones")
    ordenes: Mapped[list["Orden"]] = relationship("Orden", back_populates="direccion_envio")

    def __repr__(self) -> str:
        return f"<DireccionEnvio {self.ciudad}, {self.pais}>"

