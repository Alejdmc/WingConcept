"""Bloques de contenido del sitio (homepage, footer, textos globales)."""
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SiteBlock(Base):
    __tablename__ = "site_blocks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clave: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)
    seccion: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    # Etiqueta amigable para el panel admin (sin jerga técnica)
    etiqueta: Mapped[str] = mapped_column(String(255), nullable=False)
    # text | textarea | image | json
    tipo: Mapped[str] = mapped_column(String(30), nullable=False, default="text")
    valor: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
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
        return f"<SiteBlock {self.clave}>"
