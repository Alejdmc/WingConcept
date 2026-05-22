"""
WingConcept Backend — Pagos Endpoints
POST /api/v1/pagos/checkout

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Soporta dos proveedores de pago:

1. WOMPI (Colombia - COP)
   Panel:   https://comercios.wompi.co
   Docs:    https://docs.wompi.co
   Widget:  https://docs.wompi.co/docs/en/widget-checkout-web
   Keys:    WOMPI_PUBLIC_KEY, WOMPI_PRIVATE_KEY (en .env)

2. STRIPE (Global - USD/EUR/etc.)
   Panel:   https://dashboard.stripe.com
   Docs:    https://stripe.com/docs/api/checkout/sessions
   Session: checkout.Session.create()
   Keys:    STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY (en .env)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
import uuid
import logging
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.core.exceptions import RecursoNoEncontradoError, PermisosDenegadosError
from app.database import get_db
from app.models.orden import Orden
from app.schemas.pago import CheckoutRequest, CheckoutResponse, PagoResponse
from app.services.pago_service import pago_service

router = APIRouter(prefix="/pagos", tags=["Pagos"])
logger = logging.getLogger(__name__)


@router.post("/checkout", response_model=CheckoutResponse, status_code=status.HTTP_201_CREATED)
async def iniciar_checkout(
    data: CheckoutRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Inicia el proceso de pago para una orden.

    Proveedor:
    - "wompi"  → Pago en Colombia (COP). Retorna datos para el widget Wompi.
    - "stripe" → Pago internacional (USD). Retorna URL de Stripe Checkout.
    """
    # Verificar que la orden existe y pertenece al usuario
    result = await db.execute(
        select(Orden)
        .options(selectinload(Orden.items))
        .where(Orden.id == data.orden_id)
    )
    orden = result.scalar_one_or_none()

    if not orden:
        raise RecursoNoEncontradoError("Orden")

    if orden.usuario_id != current_user.id and current_user.rol != "admin":
        raise PermisosDenegadosError()

    if orden.estado != "pendiente":
        raise PermisosDenegadosError("Solo se pueden pagar órdenes pendientes")

    # Enrutar al proveedor correspondiente
    if data.proveedor == "wompi":
        return await pago_service.crear_pago_wompi(db, orden)
    elif data.proveedor == "stripe":
        return await pago_service.crear_pago_stripe(db, orden)

