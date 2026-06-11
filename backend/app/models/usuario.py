"""
WingConcept Backend — Modelo Usuario
Roles: client | admin
"""
import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.carrito import Carrito
    from app.models.configuracion import Configuracion
    from app.models.direccion_envio import DireccionEnvio
    from app.models.orden import Orden


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    apellido: Mapped[str] = mapped_column(String(100), nullable=False)
    telefono: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    # Roles: client (comprador) | admin (gestión)
    rol: Mapped[str] = mapped_column(
        String(20), nullable=False, default="client", index=True
    )

    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    email_verificado: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Token para recuperación de contraseña / verificación de email
    reset_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    reset_token_expires: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
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
    ordenes: Mapped[List["Orden"]] = relationship("Orden", back_populates="usuario")
    carrito: Mapped[Optional["Carrito"]] = relationship(
        "Carrito", back_populates="usuario", uselist=False
    )
    configuraciones: Mapped[List["Configuracion"]] = relationship(
        "Configuracion", back_populates="usuario"
    )
    direcciones: Mapped[List["DireccionEnvio"]] = relationship(
        "DireccionEnvio", back_populates="usuario"
    )

    def __repr__(self) -> str:
        return f"<Usuario {self.email} [{self.rol}]>"

