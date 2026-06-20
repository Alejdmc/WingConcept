"""
WingConcept Backend — Schemas Carrito (Pydantic V2)
"""
import uuid
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, model_validator


class AgregarItemRequest(BaseModel):
    """
    Agrega un item al carrito.

    Acepta variante_id (estándar) o producto_id (configurador 3D del frontend).
    Si solo se envía producto_id, se usa la variante principal activa del producto.
    """
    variante_id: Optional[uuid.UUID] = None
    producto_id: Optional[uuid.UUID] = None
    cantidad: int = Field(1, ge=1, le=99)
    configuracion: Optional[Dict[str, Any]] = None

    @model_validator(mode="after")
    def validar_referencia_producto(self) -> "AgregarItemRequest":
        if not self.variante_id and not self.producto_id:
            raise ValueError("Se requiere variante_id o producto_id")
        return self


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
    configuracion: Optional[Dict[str, Any]] = None

    # ── Campos amigables para cart/page.js ────────────────────────────────
    # cart/page.js usa item.cartId como key y para eliminar,
    # item.name para mostrar el nombre, item.price como string formateado.
    cartId: Optional[uuid.UUID] = None   # = id  (alias para React key + removeFromCart)
    name: Optional[str] = None           # = producto_nombre
    price: Optional[str] = None          # = precio_unitario formateado como "$5,200"

    model_config = {"from_attributes": True}


class CarritoResponse(BaseModel):
    id: Optional[uuid.UUID] = None
    items: List[ItemCarritoResponse] = []
    total: float = 0.0
    cantidad_items: int = 0

    model_config = {"from_attributes": True}

