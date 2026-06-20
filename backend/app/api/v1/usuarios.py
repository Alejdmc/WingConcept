"""
WingConcept Backend — Usuario Endpoints
GET  /api/v1/usuarios/me
PUT  /api/v1/usuarios/me
GET  /api/v1/usuarios/me/direcciones
POST /api/v1/usuarios/me/direcciones
PUT  /api/v1/usuarios/me/direcciones/{id}
DELETE /api/v1/usuarios/me/direcciones/{id}
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database import get_db
from app.schemas.usuario import (
    DireccionEnvioCreate,
    DireccionEnvioResponse,
    UsuarioResponse,
    UsuarioUpdate,
)
from app.services.direccion_service import direccion_service

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.get("/me", response_model=UsuarioResponse)
async def obtener_perfil(current_user=Depends(get_current_user)):
    """Retorna el perfil del usuario autenticado."""
    return current_user


@router.put("/me", response_model=UsuarioResponse)
async def actualizar_perfil(
    data: UsuarioUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Actualiza nombre, apellido o teléfono del usuario autenticado."""
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(current_user, key, value)
    await db.flush()
    await db.refresh(current_user)
    return UsuarioResponse.model_validate(current_user)


@router.get("/me/direcciones", response_model=List[DireccionEnvioResponse])
async def listar_direcciones(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Lista las direcciones de envío del usuario."""
    return await direccion_service.listar(db, current_user.id)


@router.post(
    "/me/direcciones",
    response_model=DireccionEnvioResponse,
    status_code=status.HTTP_201_CREATED,
)
async def crear_direccion(
    data: DireccionEnvioCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Agrega una dirección de envío."""
    return await direccion_service.crear(db, current_user.id, data)


@router.put("/me/direcciones/{direccion_id}", response_model=DireccionEnvioResponse)
async def actualizar_direccion(
    direccion_id: uuid.UUID,
    data: DireccionEnvioCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Actualiza una dirección de envío existente."""
    return await direccion_service.actualizar(db, current_user.id, direccion_id, data)


@router.delete("/me/direcciones/{direccion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_direccion(
    direccion_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Elimina una dirección de envío."""
    await direccion_service.eliminar(db, current_user.id, direccion_id)
