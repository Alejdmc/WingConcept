"""
WingConcept Backend — Schemas Pago (Pydantic V2)
Soporta Wompi (Colombia) y Stripe (global)
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


# ── Checkout (inicio de pago) ─────────────────────────────────────────────────

class CheckoutRequest(BaseModel):
    orden_id: uuid.UUID
    # Proveedor de pago:
    # "wompi"  → Colombia (COP) — https://docs.wompi.co
    # "stripe" → Internacional (USD, EUR, etc.) — https://stripe.com/docs
    proveedor: str = Field(..., pattern="^(wompi|stripe)$")


# ── Responses ─────────────────────────────────────────────────────────────────

class CheckoutResponse(BaseModel):
    """Respuesta de inicio de pago."""
    pago_id: uuid.UUID
    referencia: str
    proveedor: str

    # Wompi: URL del widget de pago
    # Stripe: URL de Stripe Checkout Session
    checkout_url: Optional[str] = None

    # Wompi: datos para renderizar el widget en frontend
    wompi_data: Optional[Dict[str, Any]] = None

    # Stripe: payment_intent client_secret para frontend SDK
    stripe_client_secret: Optional[str] = None

    estado: str  # pending


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

