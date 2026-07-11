"""
WingConcept Backend — Modelo Cupón de descuento
Cupones de un solo uso asignados a un usuario específico.
"""
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.orden import Orden
    from app.models.usuario import Usuario


class Cupon(Base):
    __tablename__ = "cupones"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    codigo: Mapped[str] = mapped_column(String(30), unique=True, nullable=False, index=True)
    usuario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True
    )
    creado_por_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True
    )

    tipo: Mapped[str] = mapped_column(String(20), nullable=False)  # porcentaje | fijo
    valor: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    descripcion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    usado: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    usado_en: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    orden_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ordenes.id", ondelete="SET NULL"), nullable=True
    )

    expira_en: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    email_enviado: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        server_default=func.now(),
        nullable=False,
    )

    usuario: Mapped["Usuario"] = relationship("Usuario", foreign_keys=[usuario_id])
    creado_por: Mapped[Optional["Usuario"]] = relationship("Usuario", foreign_keys=[creado_por_id])
    orden: Mapped[Optional["Orden"]] = relationship("Orden", foreign_keys=[orden_id])

    def __repr__(self) -> str:
        return f"<Cupon {self.codigo} usuario={self.usuario_id}>"
