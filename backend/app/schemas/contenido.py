"""
WingConcept Backend — Schemas Contenido (CMS)
"""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator

SECCIONES_VALIDAS = frozenset({"adventure", "events", "shows"})
TIPOS_VALIDOS = frozenset({"hero", "intro", "expedicion"})


class ContenidoCreate(BaseModel):
    seccion: str = Field(..., max_length=50)
    tipo: str = Field(..., max_length=50)
    titulo: str = Field(..., min_length=2, max_length=255)
    slug: Optional[str] = Field(None, max_length=300)
    descripcion: Optional[str] = None
    imagen: Optional[str] = Field(None, max_length=500)
    ubicacion: Optional[str] = Field(None, max_length=255)
    duracion: Optional[str] = Field(None, max_length=100)
    dificultad: Optional[str] = Field(None, max_length=50)
    participantes: Optional[int] = Field(None, ge=1)
    highlights: Optional[List[str]] = None
    orden: int = 0
    activo: bool = True

    @field_validator("seccion")
    @classmethod
    def validar_seccion(cls, v: str) -> str:
        v_lower = v.lower().strip()
        if v_lower not in SECCIONES_VALIDAS:
            raise ValueError(f"Sección '{v}' no válida.")
        return v_lower

    @field_validator("tipo")
    @classmethod
    def validar_tipo(cls, v: str) -> str:
        v_lower = v.lower().strip()
        if v_lower not in TIPOS_VALIDOS:
            raise ValueError(f"Tipo '{v}' no válido.")
        return v_lower


class ContenidoUpdate(BaseModel):
    tipo: Optional[str] = Field(None, max_length=50)
    titulo: Optional[str] = Field(None, min_length=2, max_length=255)
    slug: Optional[str] = Field(None, max_length=300)
    descripcion: Optional[str] = None
    imagen: Optional[str] = Field(None, max_length=500)
    ubicacion: Optional[str] = Field(None, max_length=255)
    duracion: Optional[str] = Field(None, max_length=100)
    dificultad: Optional[str] = Field(None, max_length=50)
    participantes: Optional[int] = Field(None, ge=1)
    highlights: Optional[List[str]] = None
    orden: Optional[int] = None
    activo: Optional[bool] = None

    @field_validator("tipo")
    @classmethod
    def validar_tipo(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v_lower = v.lower().strip()
        if v_lower not in TIPOS_VALIDOS:
            raise ValueError(f"Tipo '{v}' no válido.")
        return v_lower


class ContenidoResponse(BaseModel):
    id: uuid.UUID
    seccion: str
    tipo: str
    titulo: str
    slug: str
    descripcion: Optional[str]
    imagen: Optional[str]
    ubicacion: Optional[str]
    duracion: Optional[str]
    dificultad: Optional[str]
    participantes: Optional[int]
    highlights: Optional[List[str]]
    orden: int
    activo: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AdventurePageResponse(BaseModel):
    hero: Optional[ContenidoResponse] = None
    intro: Optional[ContenidoResponse] = None
    expediciones: List[ContenidoResponse] = []
