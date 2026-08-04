"""Schemas — opciones del configurador."""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


GRUPOS_VALIDOS = frozenset({
    "engine", "chassis_type", "finish", "propeller", "accessory", "color",
})


class ConfiguradorOpcionCreate(BaseModel):
    producto_id: uuid.UUID
    grupo: str = Field(..., max_length=50)
    slug: str = Field(..., max_length=100)
    nombre: str = Field(..., max_length=255)
    descripcion: Optional[str] = None
    precio: float = Field(0, ge=0)
    imagen: Optional[str] = Field(None, max_length=500)
    extra: Optional[Dict[str, Any]] = None
    orden: int = 0
    activo: bool = True


class ConfiguradorOpcionUpdate(BaseModel):
    nombre: Optional[str] = Field(None, max_length=255)
    descripcion: Optional[str] = None
    precio: Optional[float] = Field(None, ge=0)
    imagen: Optional[str] = Field(None, max_length=500)
    extra: Optional[Dict[str, Any]] = None
    orden: Optional[int] = None
    activo: Optional[bool] = None


class ConfiguradorOpcionResponse(BaseModel):
    id: uuid.UUID
    producto_id: uuid.UUID
    grupo: str
    slug: str
    nombre: str
    descripcion: Optional[str]
    precio: float
    imagen: Optional[str]
    extra: Optional[Dict[str, Any]]
    orden: int
    activo: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ConfiguradorCatalogResponse(BaseModel):
    """Catálogo agrupado para el frontend del configurador."""
    producto_id: uuid.UUID
    base_chassis_price: Optional[float] = None
    engines: List[Dict[str, Any]] = []
    chassis_types: List[Dict[str, Any]] = []
    finishes: List[Dict[str, Any]] = []
    propellers: List[Dict[str, Any]] = []
    colors: List[Dict[str, Any]] = []
    accessories: List[Dict[str, Any]] = []


class PaginatedConfiguradorOpciones(BaseModel):
    items: List[ConfiguradorOpcionResponse]
    total: int
    pagina: int
    por_pagina: int
    paginas: int
