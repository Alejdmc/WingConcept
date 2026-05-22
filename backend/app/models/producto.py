"""
WingConcept Backend — Modelo Producto
Paramotores y accesorios con soporte multiidioma básico y modelo 3D.
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Producto(Base):
    __tablename__ = "productos"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    nombre: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(300), unique=True, nullable=False, index=True)
    descripcion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    descripcion_corta: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Categoría: paramotor | vela | motor | accesorios | repuestos
    categoria: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    subcategoria: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Imágenes: lista de URLs de Supabase Storage
    # Formato: ["https://[project].supabase.co/storage/v1/object/public/productos/img1.jpg"]
    imagenes: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String), nullable=True)

    # Modelo 3D: URL de archivo .glb/.gltf en Supabase Storage
    # Bucket: settings.SUPABASE_BUCKET_MODELOS_3D
    # Usado por el configurador 3D del frontend
    modelo_3d_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # SEO
    meta_titulo: Mapped[Optional[str]] = mapped_column(String(70), nullable=True)
    meta_descripcion: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)

    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    destacado: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    orden_display: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

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
    variantes: Mapped[List["Variante"]] = relationship(
        "Variante", back_populates="producto", cascade="all, delete-orphan"
    )
    configuraciones: Mapped[List["Configuracion"]] = relationship(
        "Configuracion", back_populates="producto"
    )

    def __repr__(self) -> str:
        return f"<Producto {self.nombre} [{self.categoria}]>"

