"""
WingConcept Backend — Schemas Orden (Pydantic V2)
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

# Mapeo estado interno (español) → display frontend (inglés)
ESTADO_DISPLAY_MAP: Dict[str, str] = {
    "pendiente": "Pending",
    "pagado": "Paid",
    "procesando": "Processing",
    "enviado": "Shipped",
    "entregado": "Delivered",
    "cancelado": "Cancelled",
    "reembolsado": "Refunded",
    "error_stock": "Stock Error",   # Pago aprobado pero sin stock — requiere intervención manual
}

# Mapeo inverso: valores que puede enviar el frontend → estado interno
ESTADO_FRONTEND_MAP: Dict[str, str] = {
    "Pending": "pendiente",
    "Paid": "pagado",
    "Processing": "procesando",
    "Shipped": "enviado",
    "Delivered": "entregado",
    "Cancelled": "cancelado",
    "Refunded": "reembolsado",
    "Stock Error": "error_stock",
}


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
    """Solo para administradores.
    Acepta estado en español (pendiente/enviado…) o en inglés (Pending/Shipped…).
    La normalización al valor interno se realiza en el endpoint.
    """
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


# ── Respuestas enriquecidas para el panel de administración ───────────────────

class AdminOrdenResponse(BaseModel):
    """Respuesta optimizada para el admin panel del frontend.

    Incluye datos del cliente, estado en inglés (estado_display),
    total formateado, fecha y conteo de ítems — todo lo que necesita
    /admin/orders/page.js sin tener que hacer JOINs en el frontend.
    """
    id: uuid.UUID
    numero_orden: str           # usado como "Order ID" en la tabla
    cliente_nombre: Optional[str] = None   # Usuario.nombre + apellido
    cliente_email: Optional[str] = None    # Usuario.email
    total: float
    total_formateado: Optional[str] = None  # "$5,200"
    estado: str                  # estado interno en español
    estado_display: str          # "Pending" | "Shipped" | "Delivered" …
    fecha: str                   # "2025-06-01"
    cantidad_items: int = 0      # count de ítems en la orden
    moneda: str = "COP"

    model_config = {"from_attributes": False}


class PaginatedAdminOrdenes(BaseModel):
    items: List[AdminOrdenResponse]
    total: int
    pagina: int
    por_pagina: int
    paginas: int


