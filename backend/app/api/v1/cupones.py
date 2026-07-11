"""
WingConcept Backend — Cupones Endpoints
POST /api/v1/cupones/validar
"""
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database import get_db
from app.schemas.cupon import CuponValidacionResponse, CuponValidarRequest
from app.services.cupon_service import cupon_service

router = APIRouter(prefix="/cupones", tags=["Cupones"])


@router.post("/validar", response_model=CuponValidacionResponse)
async def validar_cupon(
    data: CuponValidarRequest,
    subtotal: Optional[float] = Query(None, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Valida un cupón para el usuario autenticado."""
    return await cupon_service.validar_para_usuario(
        db, current_user.id, data.codigo, subtotal
    )
