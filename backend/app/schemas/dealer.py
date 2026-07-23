"""
WingConcept Backend — Schemas Dealer
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from app.utils.validators import sanitizar_texto


class DealerCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=255)
    equipo: Optional[str] = Field(None, max_length=255)
    ubicacion: Optional[str] = Field(None, max_length=255)
    descripcion: Optional[str] = None
    instagram: Optional[str] = Field(None, max_length=500)
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


class DealerUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=255)
    equipo: Optional[str] = Field(None, max_length=255)
    ubicacion: Optional[str] = Field(None, max_length=255)
    descripcion: Optional[str] = None
    instagram: Optional[str] = Field(None, max_length=500)
    orden: Optional[int] = None
    activo: Optional[bool] = None


class DealerResponse(BaseModel):
    id: uuid.UUID
    nombre: str
    equipo: Optional[str]
    ubicacion: Optional[str]
    descripcion: Optional[str]
    instagram: Optional[str]
    orden: int
    activo: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
