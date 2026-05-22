"""
WingConcept Backend — Carrito Endpoints
GET    /api/v1/carrito
POST   /api/v1/carrito/items
PUT    /api/v1/carrito/items/{item_id}
DELETE /api/v1/carrito/items/{item_id}
DELETE /api/v1/carrito
"""
import uuid

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_optional_user, get_session_id
from app.database import get_db
from app.schemas.carrito import (
    ActualizarCantidadRequest,
    AgregarItemRequest,
    CarritoResponse,
)
from app.services.carrito_service import carrito_service

router = APIRouter(prefix="/carrito", tags=["Carrito"])


@router.get("", response_model=CarritoResponse)
async def obtener_carrito(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_optional_user),
):
    """
    Obtiene el carrito del usuario autenticado (DB) o anónimo (Redis).
    Usar X-Session-ID header para carrito anónimo.
    """
    if current_user:
        carrito = await carrito_service.obtener_o_crear(db, current_user.id)
        return await carrito_service._carrito_a_response(db, carrito)
    else:
        session_id = get_session_id(request)
        return await carrito_service.obtener_anonimo(session_id)


@router.post("/items", response_model=CarritoResponse, status_code=status.HTTP_201_CREATED)
async def agregar_item(
    data: AgregarItemRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_optional_user),
):
    """Agrega un item al carrito."""
    if current_user:
        return await carrito_service.agregar_item(
            db, current_user.id, data.variante_id, data.cantidad
        )
    else:
        # Para carrito anónimo necesitamos datos del producto
        # El frontend debe pre-verificar stock
        session_id = get_session_id(request)
        return await carrito_service.agregar_item_anonimo(
            session_id=session_id,
            variante_id=str(data.variante_id),
            cantidad=data.cantidad,
            precio=0.0,  # El frontend envía el precio para el carrito anónimo
        )


@router.put("/items/{item_id}", response_model=CarritoResponse)
async def actualizar_item(
    item_id: uuid.UUID,
    data: ActualizarCantidadRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_optional_user),
):
    """Actualiza la cantidad de un item. Requiere usuario autenticado."""
    if not current_user:
        from app.core.exceptions import CredencialesInvalidasError
        raise CredencialesInvalidasError("Autenticación requerida para modificar el carrito")
    return await carrito_service.actualizar_cantidad(db, current_user.id, item_id, data.cantidad)


@router.delete("/items/{item_id}", response_model=CarritoResponse)
async def eliminar_item(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_optional_user),
):
    """Elimina un item del carrito."""
    if not current_user:
        from app.core.exceptions import CredencialesInvalidasError
        raise CredencialesInvalidasError("Autenticación requerida")
    return await carrito_service.eliminar_item(db, current_user.id, item_id)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def vaciar_carrito(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_optional_user),
):
    """Vacía el carrito completo."""
    if current_user:
        await carrito_service.vaciar(db, current_user.id)
    else:
        session_id = get_session_id(request)
        await carrito_service.limpiar_anonimo(session_id)

