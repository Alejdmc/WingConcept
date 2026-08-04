"""Schemas — bloques de contenido del sitio."""
import uuid
from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class SiteBlockCreate(BaseModel):
    clave: str = Field(..., max_length=150)
    seccion: str = Field(..., max_length=80)
    etiqueta: str = Field(..., max_length=255)
    tipo: str = Field("text", max_length=30)
    valor: Optional[str] = None
    orden: int = 0
    activo: bool = True


class SiteBlockUpdate(BaseModel):
    etiqueta: Optional[str] = Field(None, max_length=255)
    tipo: Optional[str] = Field(None, max_length=30)
    valor: Optional[str] = None
    orden: Optional[int] = None
    activo: Optional[bool] = None


class SiteBlockResponse(BaseModel):
    id: uuid.UUID
    clave: str
    seccion: str
    etiqueta: str
    tipo: str
    valor: Optional[str]
    orden: int
    activo: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SiteBlocksPublicResponse(BaseModel):
    blocks: Dict[str, str]
