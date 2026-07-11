"""
WingConcept Backend — Schemas Cupón
"""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator, model_validator

TIPOS_DESCUENTO = frozenset({"porcentaje", "fijo"})


class CuponCreateAdmin(BaseModel):
    usuario_id: uuid.UUID
    tipo: str = Field(..., max_length=20)
    valor: float = Field(..., gt=0)
    descripcion: Optional[str] = Field(None, max_length=500)
    dias_validez: Optional[int] = Field(None, ge=1, le=365)

    @field_validator("tipo")
    @classmethod
    def validar_tipo(cls, v: str) -> str:
        v_lower = v.lower().strip()
        if v_lower not in TIPOS_DESCUENTO:
            raise ValueError("Tipo debe ser 'porcentaje' o 'fijo'")
        return v_lower

    @model_validator(mode="after")
    def validar_valor_tipo(self):
        if self.tipo == "porcentaje" and (self.valor <= 0 or self.valor > 100):
            raise ValueError("El porcentaje debe estar entre 1 y 100")
        if self.tipo == "fijo" and self.valor <= 0:
            raise ValueError("El descuento fijo debe ser mayor a 0")
        return self


class CuponValidarRequest(BaseModel):
    codigo: str = Field(..., min_length=4, max_length=30)


class CuponResponse(BaseModel):
    id: uuid.UUID
    codigo: str
    usuario_id: uuid.UUID
    usuario_nombre: Optional[str] = None
    usuario_email: Optional[str] = None
    tipo: str
    valor: float
    descripcion: Optional[str]
    usado: bool
    usado_en: Optional[datetime]
    expira_en: Optional[datetime]
    email_enviado: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CuponValidacionResponse(BaseModel):
    valido: bool
    codigo: str
    tipo: str
    valor: float
    descripcion: Optional[str] = None
    descuento_estimado: Optional[float] = None
    mensaje: Optional[str] = None


class PaginatedCupones(BaseModel):
    items: List[CuponResponse]
    total: int
    pagina: int
    por_pagina: int
    paginas: int
