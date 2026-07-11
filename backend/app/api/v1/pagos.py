"""
WingConcept Backend — Pagos (Stripe / USD)
POST /api/v1/pagos/checkout
"""
import logging

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_current_user
from app.core.exceptions import PermisosDenegadosError, RecursoNoEncontradoError
from app.database import get_db
from app.models.orden import Orden
from app.models.pago import Pago
from app.schemas.pago import CheckoutRequest, CheckoutResponse
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
    Inicia Stripe Checkout para una orden pendiente en USD.
    Retorna checkout_url para redirigir al cliente.
    """
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
        raise PermisosDenegadosError(
            "Solo se pueden pagar órdenes pendientes. "
            f"Estado actual: {orden.estado}"
        )

    pago_existente = await db.execute(
        select(Pago).where(
            Pago.orden_id == data.orden_id,
            Pago.estado == "approved",
        )
    )
    if pago_existente.scalar_one_or_none():
        logger.warning(
            f"Intento de doble pago para orden {orden.numero_orden} "
            f"por usuario {current_user.id}"
        )
        raise PermisosDenegadosError("Esta orden ya fue pagada exitosamente.")

    logger.info(
        f"Iniciando checkout Stripe: orden={orden.numero_orden} "
        f"usuario={current_user.id}"
    )
    return await pago_service.crear_checkout_stripe(db, orden)
