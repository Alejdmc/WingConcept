"""
WingConcept Backend — Schemas Pago (Stripe / USD)
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CheckoutRequest(BaseModel):
    orden_id: uuid.UUID


class CheckoutResponse(BaseModel):
    """Respuesta de inicio de pago Stripe."""
    pago_id: uuid.UUID
    referencia: str
    proveedor: str = "stripe"
    checkout_url: Optional[str] = None
    estado: str = "pending"


class PagoResponse(BaseModel):
    id: uuid.UUID
    orden_id: uuid.UUID
    proveedor: str
    referencia: str
    transaction_id: Optional[str]
    estado: str
    monto: float
    moneda: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
