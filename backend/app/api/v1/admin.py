"""
WingConcept Backend — Admin Endpoints
Panel de administración: usuarios, órdenes, estadísticas
Solo accesible con rol admin.
"""
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_current_admin
from app.database import get_db
from app.models.orden import Orden, ItemOrden
from app.models.producto import Producto
from app.models.usuario import Usuario
from app.schemas.orden import (
    AdminOrdenResponse,
    ESTADO_FRONTEND_MAP,
    OrdenUpdate,
    PaginatedAdminOrdenes,
)
from app.schemas.producto import (
    PaginatedAdminProductos,
    ProductoCreate,
    ProductoResponse,
    ProductoUpdate,
    VarianteCreate,
    VarianteResponse,
    VarianteUpdate,
)
from app.schemas.usuario import UsuarioAdminUpdate, UsuarioResponse
from app.schemas.contenido import ContenidoCreate, ContenidoResponse, ContenidoUpdate
from app.schemas.cupon import CuponCreateAdmin, CuponResponse, PaginatedCupones
from app.services.orden_service import orden_service
from app.services.producto_service import producto_service
from app.services.contenido_service import contenido_service
from app.services.cupon_service import cupon_service

router = APIRouter(prefix="/admin", tags=["Admin"])


# ── Dashboard Stats ───────────────────────────────────────────────────────────

@router.get("/stats")
async def dashboard_stats(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Estadísticas generales del dashboard."""
    total_usuarios = (await db.execute(select(func.count(Usuario.id)))).scalar()
    total_productos = (await db.execute(
        select(func.count(Producto.id)).where(Producto.activo == True)
    )).scalar()
    total_ordenes = (await db.execute(select(func.count(Orden.id)))).scalar()
    ordenes_pendientes = (await db.execute(
        select(func.count(Orden.id)).where(Orden.estado == "pendiente")
    )).scalar()
    ingresos_result = await db.execute(
        select(func.sum(Orden.total)).where(Orden.estado.in_(["pagado", "procesando", "enviado", "entregado"]))
    )
    ingresos_totales = float(ingresos_result.scalar() or 0)

    # Kg vendidos: suma de ItemOrden.cantidad de órdenes completadas.
    # (En el futuro se puede ponderar por el peso_kg del snapshot.)
    kg_result = await db.execute(
        select(func.coalesce(func.sum(ItemOrden.cantidad), 0))
        .join(Orden, Orden.id == ItemOrden.orden_id)
        .where(Orden.estado.in_(["enviado", "entregado"]))
    )
    kg_vendidos = float(kg_result.scalar() or 0)

    return {
        "total_usuarios": total_usuarios,
        "total_productos_activos": total_productos,
        "total_ordenes": total_ordenes,
        "ordenes_pendientes": ordenes_pendientes,
        "ingresos_totales": ingresos_totales,
        "kg_vendidos": kg_vendidos,
    }


# ── Usuarios ──────────────────────────────────────────────────────────────────

@router.get("/usuarios")
async def listar_usuarios(
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(20, ge=1, le=100),
    buscar: Optional[str] = Query(None),
    rol: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Lista todos los usuarios del sistema."""
    import math
    query = select(Usuario)
    if buscar:
        from sqlalchemy import or_
        term = f"%{buscar.strip()}%"
        query = query.where(
            or_(
                Usuario.email.ilike(term),
                Usuario.nombre.ilike(term),
                Usuario.apellido.ilike(term),
                func.concat(Usuario.nombre, " ", Usuario.apellido).ilike(term),
            )
        )
    if rol:
        query = query.where(Usuario.rol == rol)
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    query = query.order_by(Usuario.created_at.desc()).offset((pagina - 1) * por_pagina).limit(por_pagina)
    result = await db.execute(query)
    usuarios = result.scalars().all()

    return {
        "items": [UsuarioResponse.model_validate(u) for u in usuarios],
        "total": total,
        "pagina": pagina,
        "paginas": math.ceil(total / por_pagina) if total > 0 else 0,
    }


@router.put("/usuarios/{usuario_id}", response_model=UsuarioResponse)
async def actualizar_usuario(
    usuario_id: uuid.UUID,
    data: UsuarioAdminUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Actualiza datos de un usuario (rol, activo, etc.)."""
    from app.core.exceptions import RecursoNoEncontradoError
    result = await db.execute(select(Usuario).where(Usuario.id == usuario_id))
    usuario = result.scalar_one_or_none()
    if not usuario:
        raise RecursoNoEncontradoError("Usuario")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(usuario, key, value)

    await db.flush()
    return UsuarioResponse.model_validate(usuario)


# ── Productos Admin ───────────────────────────────────────────────────────────

@router.get("/productos", response_model=PaginatedAdminProductos)
async def listar_productos_admin(
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(20, ge=1, le=100),
    buscar: Optional[str] = Query(None, max_length=100),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Lista todos los productos con stock y ventas para el panel de admin."""
    return await producto_service.listar_admin(db, pagina, por_pagina, buscar)


@router.get("/productos/{producto_id}", response_model=ProductoResponse)
async def obtener_producto_admin(
    producto_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Obtiene un producto completo con variantes para edición en el panel."""
    return await producto_service.obtener_admin(db, producto_id)


@router.post("/productos", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED)
async def crear_producto_admin(
    data: ProductoCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Crea un producto. Alias de POST /productos para el panel admin."""
    return await producto_service.crear(db, data)


@router.put("/productos/{producto_id}", response_model=ProductoResponse)
async def actualizar_producto_admin(
    producto_id: uuid.UUID,
    data: ProductoUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Actualiza un producto. Alias de PUT /productos/{id} para el panel admin."""
    return await producto_service.actualizar(db, producto_id, data)


@router.delete("/productos/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_producto_admin(
    producto_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Desactiva un producto (soft delete). Alias para el panel admin."""
    await producto_service.eliminar(db, producto_id)


@router.post(
    "/productos/{producto_id}/variantes",
    response_model=VarianteResponse,
    status_code=status.HTTP_201_CREATED,
)
async def crear_variante_admin(
    producto_id: uuid.UUID,
    data: VarianteCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Agrega una variante a un producto desde el panel admin."""
    return await producto_service.crear_variante(db, producto_id, data)


# ── Stock de variantes (admin) ────────────────────────────────────────────────

@router.patch(
    "/variantes/{variante_id}/stock",
    response_model=VarianteResponse,
)
async def actualizar_stock_variante(
    variante_id: uuid.UUID,
    data: VarianteUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Actualiza stock y datos de una variante desde el panel admin."""
    if data.stock is None and data.model_dump(exclude_unset=True) == {}:
        from app.core.exceptions import PermisosDenegadosError
        raise PermisosDenegadosError("Se requiere al menos un campo para actualizar")
    return await producto_service.actualizar_variante(db, variante_id, data)


# ── Órdenes Admin ─────────────────────────────────────────────────────────────

@router.get("/ordenes", response_model=PaginatedAdminOrdenes)
async def listar_todas_ordenes(
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(20, ge=1, le=100),
    estado: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Lista todas las órdenes del sistema con datos de cliente.

    El parámetro ``estado`` acepta tanto el valor en español (``pendiente``,
    ``enviado``…) como en inglés (``Pending``, ``Shipped``…).
    """
    # Normalizar estado recibido al valor interno
    estado_interno: Optional[str] = None
    if estado:
        estado_interno = ESTADO_FRONTEND_MAP.get(estado, estado)

    return await orden_service.listar_admin(db, pagina, por_pagina, estado_interno)


@router.put("/ordenes/{orden_id}", response_model=AdminOrdenResponse)
async def actualizar_orden(
    orden_id: uuid.UUID,
    data: OrdenUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Actualiza estado, guía y notas de una orden.

    El campo ``estado`` acepta valores en inglés (``Pending``, ``Shipped``,
    ``Delivered``…) además de los valores internos en español.
    """
    estado_interno = data.estado
    if data.estado:
        estado_interno = ESTADO_FRONTEND_MAP.get(data.estado, data.estado)
        data = data.model_copy(update={"estado": estado_interno})

    orden_response = await orden_service.actualizar_estado(db, orden_id, data)

    # Enviar email si se marca como enviada
    if (
        estado_interno == "enviado"
        and data.numero_guia
        and data.transportadora
    ):
        result = await db.execute(
            select(Orden)
            .options(selectinload(Orden.usuario))
            .where(Orden.id == orden_id)
        )
        orden = result.scalar_one_or_none()
        if orden and orden.usuario:
            from app.services.email_service import email_service
            await email_service.enviar_orden_enviada(
                email=orden.usuario.email,
                nombre=orden.usuario.nombre,
                numero_orden=orden.numero_orden,
                numero_guia=data.numero_guia,
                transportadora=data.transportadora,
            )

    return orden_response


# ── Contenidos CMS (admin) ────────────────────────────────────────────────────

@router.get("/contenidos")
async def listar_contenidos_admin(
    seccion: Optional[str] = Query(None),
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Lista contenidos editables del CMS."""
    return await contenido_service.listar_admin(db, seccion, pagina, por_pagina)


@router.get("/contenidos/{contenido_id}", response_model=ContenidoResponse)
async def obtener_contenido_admin(
    contenido_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Obtiene un bloque de contenido por ID."""
    contenido = await contenido_service.obtener_por_id(db, contenido_id)
    return ContenidoResponse.model_validate(contenido)


@router.post("/contenidos", response_model=ContenidoResponse, status_code=status.HTTP_201_CREATED)
async def crear_contenido_admin(
    data: ContenidoCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Crea un bloque de contenido (hero, intro, expedición, etc.)."""
    return await contenido_service.crear(db, data)


@router.put("/contenidos/{contenido_id}", response_model=ContenidoResponse)
async def actualizar_contenido_admin(
    contenido_id: uuid.UUID,
    data: ContenidoUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Actualiza un bloque de contenido."""
    return await contenido_service.actualizar(db, contenido_id, data)


@router.delete("/contenidos/{contenido_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_contenido_admin(
    contenido_id: uuid.UUID,
    permanente: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Desactiva o elimina permanentemente un bloque de contenido."""
    await contenido_service.eliminar(db, contenido_id, permanente=permanente)


# ── Cupones / Descuentos (admin) ──────────────────────────────────────────────

@router.get("/cupones", response_model=PaginatedCupones)
async def listar_cupones_admin(
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(20, ge=1, le=100),
    buscar: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """Lista cupones emitidos por el admin."""
    return await cupon_service.listar_admin(db, pagina, por_pagina, buscar)


@router.post("/cupones", response_model=CuponResponse, status_code=status.HTTP_201_CREATED)
async def crear_cupon_admin(
    data: CuponCreateAdmin,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """Crea un cupón para un cliente y envía el código por email."""
    return await cupon_service.crear_y_enviar(db, data, admin.id)

