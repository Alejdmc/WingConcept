"""
WingConcept Backend — Schemas Carrito (Pydantic V2)
"""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class AgregarItemRequest(BaseModel):
    variante_id: uuid.UUID
    cantidad: int = Field(1, ge=1, le=99)


class ActualizarCantidadRequest(BaseModel):
    cantidad: int = Field(..., ge=1, le=99)


class ItemCarritoResponse(BaseModel):
    id: uuid.UUID
    variante_id: uuid.UUID
    cantidad: int
    precio_unitario: float
    subtotal: float
    # Info del producto/variante para el frontend
    variante_nombre: Optional[str] = None
    producto_nombre: Optional[str] = None
    producto_imagen: Optional[str] = None

    model_config = {"from_attributes": True}


class CarritoResponse(BaseModel):
    id: Optional[uuid.UUID] = None
    items: List[ItemCarritoResponse] = []
    total: float = 0.0
    cantidad_items: int = 0

    model_config = {"from_attributes": True}

