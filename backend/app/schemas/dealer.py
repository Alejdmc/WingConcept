"""
WingConcept Backend — Schemas Dealer
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from app.utils.validators import sanitizar_texto, validar_email, validar_telefono, validar_url_usuario


class DealerCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=255)
    equipo: Optional[str] = Field(None, max_length=255)
    ubicacion: Optional[str] = Field(None, max_length=255)
    descripcion: Optional[str] = None
    instagram: Optional[str] = Field(None, max_length=500)
    telefono: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=254)
    orden: int = 0
    activo: bool = True

    @field_validator("nombre", "equipo", "ubicacion")
    @classmethod
    def sanitizar_textos(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return sanitizar_texto(v, max_length=255)

    @field_validator("descripcion")
    @classmethod
    def sanitizar_descripcion(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return sanitizar_texto(v, max_length=5000)

    @field_validator("instagram")
    @classmethod
    def validar_instagram(cls, v: Optional[str]) -> Optional[str]:
        return validar_url_usuario(v, permitir_relativa=False)

    @field_validator("telefono")
    @classmethod
    def validar_tel(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None
        v = sanitizar_texto(v, max_length=50)
        if not validar_telefono(v):
            raise ValueError("Teléfono inválido")
        return v

    @field_validator("email")
    @classmethod
    def validar_mail(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None
        return validar_email(v)


class DealerUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=255)
    equipo: Optional[str] = Field(None, max_length=255)
    ubicacion: Optional[str] = Field(None, max_length=255)
    descripcion: Optional[str] = None
    instagram: Optional[str] = Field(None, max_length=500)
    telefono: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=254)
    orden: Optional[int] = None
    activo: Optional[bool] = None

    @field_validator("instagram")
    @classmethod
    def validar_instagram(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return validar_url_usuario(v, permitir_relativa=False)

    @field_validator("telefono")
    @classmethod
    def validar_tel(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None
        v = sanitizar_texto(v, max_length=50)
        if not validar_telefono(v):
            raise ValueError("Teléfono inválido")
        return v

    @field_validator("email")
    @classmethod
    def validar_mail(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None
        return validar_email(v)


class DealerResponse(BaseModel):
    id: uuid.UUID
    nombre: str
    equipo: Optional[str]
    ubicacion: Optional[str]
    descripcion: Optional[str]
    instagram: Optional[str]
    telefono: Optional[str] = None
    email: Optional[str] = None
    orden: int
    activo: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
