"""
WingConcept Backend — Carrito Endpoints
GET    /api/v1/carrito
POST   /api/v1/carrito/items
PUT    /api/v1/carrito/items/{item_id}
DELETE /api/v1/carrito/items/{item_id}
DELETE /api/v1/carrito
POST   /api/v1/carrito/merge  (fusionar carrito anónimo al hacer login)
"""
import uuid

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import (
    get_current_user,
    get_optional_user,
    get_or_create_session_id,
    get_session_id,
)
from app.core.exceptions import CredencialesInvalidasError
from app.database import get_db
from app.schemas.carrito import (
    ActualizarCantidadRequest,
    AgregarItemRequest,
    CarritoResponse,
)
from app.services.carrito_service import carrito_service
from app.services.configurador_service import configurador_service

router = APIRouter(prefix="/carrito", tags=["Carrito"])


@router.get("", response_model=CarritoResponse)
async def obtener_carrito(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_optional_user),
    session_id: str = Depends(get_or_create_session_id),
):
    """
    Obtiene el carrito del usuario autenticado (DB) o anónimo (Redis).
    Usar X-Session-ID header para carrito anónimo.
    """
    if current_user:
        carrito = await carrito_service.obtener_o_crear(db, current_user.id)
        return await carrito_service._carrito_a_response(db, carrito)

    return await carrito_service.obtener_anonimo(session_id)


@router.post("/items", response_model=CarritoResponse, status_code=status.HTTP_201_CREATED)
async def agregar_item(
    data: AgregarItemRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_optional_user),
    session_id: str = Depends(get_or_create_session_id),
):
    """
    Agrega un item al carrito.

    Acepta variante_id o producto_id (configurador 3D).
    El precio se calcula en servidor — no se confía en totalPrice del cliente.
    """
    variante = await carrito_service.resolver_variante(
        db, variante_id=data.variante_id, producto_id=data.producto_id
    )
    precio = await configurador_service.resolver_precio_carrito(
        db,
        variante.producto_id,
        float(variante.precio),
        data.configuracion,
    )

    if current_user:
        return await carrito_service.agregar_item(
            db,
            current_user.id,
            variante.id,
            data.cantidad,
            configuracion=data.configuracion,
            precio_unitario=precio,
        )

    return await carrito_service.agregar_item_anonimo(
        session_id=session_id,
        variante_id=str(variante.id),
        cantidad=data.cantidad,
        precio=precio,
        variante_nombre=variante.nombre,
        producto_nombre=variante.producto.nombre if variante.producto else "",
        imagen=(
            variante.producto.imagenes[0]
            if variante.producto and variante.producto.imagenes
            else ""
        ),
        configuracion=data.configuracion,
        stock_disponible=variante.stock,
    )


@router.put("/items/{item_id}", response_model=CarritoResponse)
async def actualizar_item(
    item_id: uuid.UUID,
    data: ActualizarCantidadRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_optional_user),
    session_id: str = Depends(get_or_create_session_id),
):
    """Actualiza la cantidad de un item."""
    if current_user:
        return await carrito_service.actualizar_cantidad(
            db, current_user.id, item_id, data.cantidad
        )

    from sqlalchemy import select
    from app.models.variante import Variante

    anon_data = await carrito_service.obtener_anonimo(session_id)
    anon_item = next((i for i in anon_data.items if str(i.id) == str(item_id)), None)
    stock = None
    if anon_item:
        v_result = await db.execute(
            select(Variante).where(Variante.id == anon_item.variante_id)
        )
        variante = v_result.scalar_one_or_none()
        stock = variante.stock if variante else None

    return await carrito_service.actualizar_cantidad_anonimo(
        session_id, str(item_id), data.cantidad, stock_disponible=stock
    )


@router.delete("/items/{item_id}", response_model=CarritoResponse)
async def eliminar_item(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_optional_user),
    session_id: str = Depends(get_or_create_session_id),
):
    """Elimina un item del carrito."""
    if current_user:
        return await carrito_service.eliminar_item(db, current_user.id, item_id)

    return await carrito_service.eliminar_item_anonimo(session_id, str(item_id))


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def vaciar_carrito(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_optional_user),
    session_id: str = Depends(get_or_create_session_id),
):
    """Vacía el carrito completo."""
    if current_user:
        await carrito_service.vaciar(db, current_user.id)
    else:
        await carrito_service.limpiar_anonimo(session_id)


@router.post("/merge", response_model=CarritoResponse)
async def fusionar_carrito(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Fusiona el carrito anónimo (Redis) con el carrito del usuario autenticado.
    Llamar inmediatamente después del login para preservar items del carrito.
    Requiere header X-Session-ID con el session_id del carrito anónimo.
    """
    session_id = get_session_id(request)
    return await carrito_service.fusionar_anonimo_con_usuario(db, current_user.id, session_id)
