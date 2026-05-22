"""
WingConcept Backend — Schemas Orden (Pydantic V2)
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ItemOrdenResponse(BaseModel):
    id: uuid.UUID
    variante_id: uuid.UUID
    cantidad: int
    precio_unitario: float
    subtotal: float
    snapshot: Optional[Dict[str, Any]]

    model_config = {"from_attributes": True}


class OrdenCreate(BaseModel):
    direccion_envio_id: Optional[uuid.UUID] = None
    notas_cliente: Optional[str] = Field(None, max_length=1000)
    moneda: str = Field("COP", max_length=3)


class OrdenUpdate(BaseModel):
    """Solo para administradores."""
    estado: Optional[str] = None
    notas_admin: Optional[str] = None
    numero_guia: Optional[str] = Field(None, max_length=100)
    transportadora: Optional[str] = Field(None, max_length=100)


class OrdenResponse(BaseModel):
    id: uuid.UUID
    numero_orden: str
    usuario_id: uuid.UUID
    estado: str
    subtotal: float
    descuento: float
    costo_envio: float
    impuestos: float
    total: float
    moneda: str
    notas_cliente: Optional[str]
    numero_guia: Optional[str]
    transportadora: Optional[str]
    items: List[ItemOrdenResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PaginatedOrdenes(BaseModel):
    items: List[OrdenResponse]
    total: int
    pagina: int
    por_pagina: int
    paginas: int

