"""
WingConcept Backend — Modelo Contenido (CMS)
Contenido editable por sección: adventure, events, shows.
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Contenido(Base):
    __tablename__ = "contenidos"
    __table_args__ = (
        UniqueConstraint("seccion", "slug", name="uq_contenidos_seccion_slug"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    seccion: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    # hero | intro | expedicion
    tipo: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    titulo: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(300), nullable=False)
    descripcion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    imagen: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    ubicacion: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    duracion: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    dificultad: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    participantes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    highlights: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String), nullable=True)
    fecha: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    hora: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    capacidad: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    precio: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    orden: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)

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
        return f"<Contenido {self.seccion}/{self.tipo}: {self.titulo}>"
