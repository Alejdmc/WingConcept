"""
WingConcept Backend — Órdenes Endpoints
GET  /api/v1/ordenes
GET  /api/v1/ordenes/{id}
POST /api/v1/ordenes
"""
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.dependencies import get_current_user
from app.core.exceptions import EmailVerificadoRequeridoError
from app.database import get_db
from app.schemas.orden import OrdenCreate, OrdenResponse, PaginatedOrdenes
from app.services.orden_service import orden_service

router = APIRouter(prefix="/ordenes", tags=["Órdenes"])


@router.get("", response_model=PaginatedOrdenes)
async def listar_ordenes(
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Lista las órdenes del usuario autenticado."""
    return await orden_service.listar_usuario(db, current_user.id, pagina, por_pagina)


@router.get("/{orden_id}", response_model=OrdenResponse)
async def obtener_orden(
    orden_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtiene el detalle de una orden. Solo el dueño o admin."""
    return await orden_service.obtener_con_acceso(db, orden_id, current_user)


@router.post("", response_model=OrdenResponse, status_code=status.HTTP_201_CREATED)
async def crear_orden(
    data: OrdenCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Crea una orden desde el carrito del usuario autenticado."""
    if settings.REQUIRE_EMAIL_VERIFIED and not current_user.email_verificado:
        raise EmailVerificadoRequeridoError()
    return await orden_service.crear_desde_carrito(db, current_user.id, data)

