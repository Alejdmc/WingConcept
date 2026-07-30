"""
WingConcept Backend — Schemas Manual
"""
import re
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from app.utils.validators import sanitizar_texto, validar_url_usuario

_STORAGE_REF = re.compile(r"^[a-z0-9_-]+/[a-zA-Z0-9/_.-]+$")


def _validar_archivo_storage(v: Optional[str]) -> Optional[str]:
    if v is None or not str(v).strip():
        return None
    ref = str(v).strip()
    if ref.startswith(("http://", "https://", "/")):
        return validar_url_usuario(ref)
    if _STORAGE_REF.match(ref):
        return ref
    raise ValueError(
        "Referencia de archivo inválida. Use una URL https:// o una ruta interna bucket/archivo."
    )


class ManualCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=255)
    descripcion: Optional[str] = None
    archivo_url: Optional[str] = Field(None, max_length=500)
    orden: int = 0
    activo: bool = True

    @field_validator("nombre")
    @classmethod
    def sanitizar_nombre(cls, v: str) -> str:
        return sanitizar_texto(v, max_length=255)

    @field_validator("descripcion")
    @classmethod
    def sanitizar_descripcion(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return sanitizar_texto(v, max_length=5000)

    @field_validator("archivo_url")
    @classmethod
    def validar_archivo(cls, v: Optional[str]) -> Optional[str]:
        return _validar_archivo_storage(v)


class ManualUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=255)
    descripcion: Optional[str] = None
    archivo_url: Optional[str] = Field(None, max_length=500)
    orden: Optional[int] = None
    activo: Optional[bool] = None

    @field_validator("archivo_url")
    @classmethod
    def validar_archivo(cls, v: Optional[str]) -> Optional[str]:
        return _validar_archivo_storage(v)


class ManualResponse(BaseModel):
    id: uuid.UUID
    nombre: str
    descripcion: Optional[str]
    archivo_url: Optional[str]
    orden: int
    activo: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ManualPublicResponse(BaseModel):
    id: uuid.UUID
    nombre: str
    descripcion: Optional[str]
    orden: int
    disponible_descarga: bool = False

    @classmethod
    def from_manual(cls, manual) -> "ManualPublicResponse":
        return cls(
            id=manual.id,
            nombre=manual.nombre,
            descripcion=manual.descripcion,
            orden=manual.orden,
            disponible_descarga=bool(manual.archivo_url),
        )
