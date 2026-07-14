"""
WingConcept Backend — Configurador 3D Endpoints
POST /api/v1/configurador
GET  /api/v1/configurador/{id}
GET  /api/v1/configurador (mis configuraciones)
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_optional_user
from app.core.exceptions import RecursoNoEncontradoError, PermisosDenegadosError
from app.database import get_db
from app.models.configuracion import Configuracion
from app.models.producto import Producto
from app.schemas.configuracion import (
    ConfiguracionCreate,
    ConfiguracionResponse,
    ValidarPrecioRequest,
    ValidarPrecioResponse,
)
from app.services.configurador_service import configurador_service

router = APIRouter(prefix="/configurador", tags=["Configurador 3D"])


@router.post("/validar-precio", response_model=ValidarPrecioResponse)
async def validar_precio_configuracion(
    data: ValidarPrecioRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Calcula el precio autoritativo de una configuración en el servidor.
    El frontend puede usarlo para mostrar totales; el carrito recalcula al agregar.
    """
    resultado = await configurador_service.validar_precio(
        db, data.producto_id, data.a_configuracion()
    )
    return ValidarPrecioResponse(
        precio_total=resultado.precio_total,
        desglose=resultado.desglose,
    )


@router.post("", response_model=ConfiguracionResponse, status_code=status.HTTP_201_CREATED)
async def guardar_configuracion(
    data: ConfiguracionCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_optional_user),
):
    """Guarda una configuración del configurador 3D. Usuario opcional."""
    # Verificar que el producto existe
    result = await db.execute(
        select(Producto).where(Producto.id == data.producto_id, Producto.activo == True)
    )
    if not result.scalar_one_or_none():
        raise RecursoNoEncontradoError("Producto")

    config = Configuracion(
        usuario_id=current_user.id if current_user else None,
        producto_id=data.producto_id,
        nombre=data.nombre,
        opciones=data.opciones,
        notas=data.notas,
    )
    db.add(config)
    await db.flush()
    await db.refresh(config)
    return ConfiguracionResponse.model_validate(config)


@router.get("", response_model=List[ConfiguracionResponse])
async def mis_configuraciones(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Lista las configuraciones del usuario autenticado."""
    result = await db.execute(
        select(Configuracion)
        .where(Configuracion.usuario_id == current_user.id)
        .order_by(Configuracion.created_at.desc())
    )
    return [ConfiguracionResponse.model_validate(c) for c in result.scalars().all()]


@router.get("/{config_id}", response_model=ConfiguracionResponse)
async def obtener_configuracion(
    config_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_optional_user),
):
    """Obtiene una configuración por ID."""
    result = await db.execute(
        select(Configuracion).where(Configuracion.id == config_id)
    )
    config = result.scalar_one_or_none()
    if not config:
        raise RecursoNoEncontradoError("Configuración")

    # Verificar acceso: dueño o admin
    if current_user and config.usuario_id and config.usuario_id != current_user.id:
        if current_user.rol != "admin":
            raise PermisosDenegadosError()

    return ConfiguracionResponse.model_validate(config)

