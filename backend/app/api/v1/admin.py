"""
WingConcept Backend — Admin Endpoints
Panel de administración: usuarios, órdenes, estadísticas
Solo accesible con rol admin.
"""
import asyncio
import json
import logging
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_current_admin
from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.orden import (
    AdminOrdenResponse,
    ESTADO_FRONTEND_MAP,
    OrdenDetalleResponse,
    OrdenUpdate,
    PaginatedAdminOrdenes,
)
from app.schemas.producto import (
    PaginatedAdminProductos,
    PartsCatalogSyncResponse,
    ProductoCreate,
    ProductoResponse,
    ProductoUpdate,
    VarianteCreate,
    VarianteResponse,
    VarianteUpdate,
)
from app.schemas.usuario import CambiarRolRequest, UsuarioAdminUpdate, UsuarioResponse
from app.schemas.invitacion import CrearInvitacionRequest, InvitacionResponse
from app.schemas.contenido import ContenidoCreate, ContenidoResponse, ContenidoUpdate
from app.schemas.cupon import CuponCreateAdmin, CuponResponse, PaginatedCupones
from app.schemas.dealer import DealerCreate, DealerResponse, DealerUpdate
from app.schemas.manual import ManualCreate, ManualResponse, ManualUpdate
from app.services.orden_service import orden_service
from app.services.parts_catalog_sync_service import parts_catalog_sync_service
from app.services.producto_service import producto_service
from app.services.contenido_service import contenido_service
from app.services.cupon_service import cupon_service
from app.services.dealer_service import dealer_service
from app.services.manual_service import manual_service
from app.services.invitation_service import invitation_service
from app.services.email_service import email_service
from app.services.stock_service import stock_service
from app.services.admin_stats_service import get_dashboard_stats
from app.services.admin_policy import assert_invite_flow_allowed
from app.config import settings

router = APIRouter(prefix="/admin", tags=["Admin"])
logger = logging.getLogger(__name__)

UPDATABLE_USER_FIELDS = frozenset({"nombre", "apellido", "telefono", "activo"})


# ── Dashboard Stats ───────────────────────────────────────────────────────────

@router.get("/stats")
async def dashboard_stats(
    _admin=Depends(get_current_admin),
):
    """Estadísticas generales del dashboard (caché Redis + queries en paralelo)."""
    return await get_dashboard_stats(use_cache=True)


@router.get("/stats/stream")
async def dashboard_stats_stream(
    _admin=Depends(get_current_admin),
):
    """SSE: empuja stats actualizadas cada 30 segundos al panel admin."""

    async def event_generator():
        try:
            while True:
                stats = await get_dashboard_stats(use_cache=True)
                yield f"data: {json.dumps(stats, default=str)}\n\n"
                await asyncio.sleep(30)
        except asyncio.CancelledError:
            raise

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/stock/alertas")
async def alertas_stock_admin(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Lista completa de partes/accesorios con stock bajo o agotado."""
    alertas = await stock_service.listar_alertas_stock(db)
    return {
        "umbral": settings.LOW_STOCK_THRESHOLD,
        "total": len(alertas),
        "items": alertas,
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
        from app.utils.validators import escapar_like, sanitizar_texto
        term = f"%{escapar_like(sanitizar_texto(buscar.strip(), max_length=100))}%"
        query = query.where(
            or_(
                Usuario.email.ilike(term, escape="\\"),
                Usuario.nombre.ilike(term, escape="\\"),
                Usuario.apellido.ilike(term, escape="\\"),
                func.concat(Usuario.nombre, " ", Usuario.apellido).ilike(term, escape="\\"),
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
    admin=Depends(get_current_admin),
):
    """Actualiza datos básicos de un usuario (sin cambiar rol)."""
    from app.core.exceptions import RecursoNoEncontradoError

    result = await db.execute(select(Usuario).where(Usuario.id == usuario_id))
    usuario = result.scalar_one_or_none()
    if not usuario:
        raise RecursoNoEncontradoError("Usuario")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field in UPDATABLE_USER_FIELDS:
            setattr(usuario, field, value)
        else:
            logger.warning(
                f"Admin {admin.id} intentó modificar campo no permitido: {field}"
            )

    await db.flush()
    return UsuarioResponse.model_validate(usuario)


@router.patch("/usuarios/{usuario_id}/rol", response_model=UsuarioResponse)
async def cambiar_rol_usuario(
    usuario_id: uuid.UUID,
    data: CambiarRolRequest,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """Cambia el rol de un usuario — solo se permite degradar a client."""
    from app.core.exceptions import RecursoNoEncontradoError, ValidacionError

    if usuario_id == admin.id:
        raise ValidacionError("No puedes cambiar tu propio rol")

    if data.rol == "admin":
        raise ValidacionError(
            "No se puede promover a admin. La creación de administradores está deshabilitada."
        )

    result = await db.execute(select(Usuario).where(Usuario.id == usuario_id))
    usuario = result.scalar_one_or_none()
    if not usuario:
        raise RecursoNoEncontradoError("Usuario")

    rol_anterior = usuario.rol
    logger.info(
        f"Admin {admin.id} cambió rol de usuario {usuario_id} "
        f"de '{rol_anterior}' a '{data.rol}'"
    )
    usuario.rol = data.rol
    await db.flush()
    return UsuarioResponse.model_validate(usuario)


# ── Invitaciones admin ────────────────────────────────────────────────────────

@router.post("/invitaciones", response_model=InvitacionResponse, status_code=status.HTTP_201_CREATED)
async def crear_invitacion_admin(
    data: CrearInvitacionRequest,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    assert_invite_flow_allowed(hide_endpoint=True)
    invitacion, token = await invitation_service.crear_invitacion(
        db, data.email, admin.id
    )
    await email_service.enviar_invitacion_admin(
        email=data.email,
        token=token,
        frontend_url=settings.FRONTEND_URL,
        invited_by=admin.nombre,
    )
    return InvitacionResponse.model_validate(invitacion)


@router.get("/invitaciones")
async def listar_invitaciones_admin(
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    assert_invite_flow_allowed(hide_endpoint=True)
    data = await invitation_service.listar_invitaciones(db, pagina, por_pagina)
    return {
        **data,
        "items": [InvitacionResponse.model_validate(i) for i in data["items"]],
    }


@router.delete("/invitaciones/{invitacion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revocar_invitacion_admin(
    invitacion_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    assert_invite_flow_allowed(hide_endpoint=True)
    await invitation_service.revocar_invitacion(db, invitacion_id)


# ── Productos Admin ───────────────────────────────────────────────────────────

@router.get("/productos", response_model=PaginatedAdminProductos)
async def listar_productos_admin(
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(20, ge=1, le=100),
    buscar: Optional[str] = Query(None, max_length=100),
    categoria: Optional[str] = Query(None, max_length=100),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Lista todos los productos con stock y ventas para el panel de admin."""
    return await producto_service.listar_admin(db, pagina, por_pagina, buscar, categoria)


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


@router.post("/parts/sync-catalog", response_model=PartsCatalogSyncResponse)
async def sync_parts_catalog_admin(
    stock_reset: bool = Query(True, description="Reset stock to 10 for catalog items"),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Importa o actualiza el catálogo oficial de /parts (repuestos + accesorios)."""
    return await parts_catalog_sync_service.sync_catalog(db, stock_reset=stock_reset)


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


@router.get("/ordenes/{orden_id}", response_model=OrdenDetalleResponse)
async def obtener_orden_admin(
    orden_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """Detalle completo de una orden para el panel admin (items, timeline, cliente)."""
    return await orden_service.obtener_con_acceso(db, orden_id, admin)


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


# ── Dealers (admin) ────────────────────────────────────────────────────────────

@router.get("/dealers")
async def listar_dealers_admin(
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Lista distribuidores editables."""
    return await dealer_service.listar_admin(db, pagina, por_pagina)


@router.get("/dealers/{dealer_id}", response_model=DealerResponse)
async def obtener_dealer_admin(
    dealer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Obtiene un distribuidor por ID."""
    dealer = await dealer_service.obtener_por_id(db, dealer_id)
    return DealerResponse.model_validate(dealer)


@router.post("/dealers", response_model=DealerResponse, status_code=status.HTTP_201_CREATED)
async def crear_dealer_admin(
    data: DealerCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Crea un distribuidor."""
    return await dealer_service.crear(db, data)


@router.put("/dealers/{dealer_id}", response_model=DealerResponse)
async def actualizar_dealer_admin(
    dealer_id: uuid.UUID,
    data: DealerUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Actualiza un distribuidor."""
    return await dealer_service.actualizar(db, dealer_id, data)


@router.delete("/dealers/{dealer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_dealer_admin(
    dealer_id: uuid.UUID,
    permanente: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Desactiva o elimina permanentemente un distribuidor."""
    await dealer_service.eliminar(db, dealer_id, permanente=permanente)


# ── Manuales (admin) ───────────────────────────────────────────────────────────

@router.get("/manuals")
async def listar_manuales_admin(
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Lista manuales descargables editables."""
    return await manual_service.listar_admin(db, pagina, por_pagina)


@router.get("/manuals/{manual_id}", response_model=ManualResponse)
async def obtener_manual_admin(
    manual_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Obtiene un manual por ID."""
    manual = await manual_service.obtener_por_id(db, manual_id)
    return ManualResponse.model_validate(manual)


@router.post("/manuals", response_model=ManualResponse, status_code=status.HTTP_201_CREATED)
async def crear_manual_admin(
    data: ManualCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Crea un manual descargable."""
    return await manual_service.crear(db, data)


@router.put("/manuals/{manual_id}", response_model=ManualResponse)
async def actualizar_manual_admin(
    manual_id: uuid.UUID,
    data: ManualUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Actualiza un manual."""
    return await manual_service.actualizar(db, manual_id, data)


@router.delete("/manuals/{manual_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_manual_admin(
    manual_id: uuid.UUID,
    permanente: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Desactiva o elimina permanentemente un manual."""
    await manual_service.eliminar(db, manual_id, permanente=permanente)


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


# ── Configurador opciones (CMS) ───────────────────────────────────────────────

from app.schemas.configurador_opcion import (
    ConfiguradorOpcionCreate,
    ConfiguradorOpcionResponse,
    ConfiguradorOpcionUpdate,
    PaginatedConfiguradorOpciones,
)
from app.schemas.site_block import SiteBlockCreate, SiteBlockResponse, SiteBlockUpdate
from app.services.configurador_opcion_service import configurador_opcion_service
from app.services.site_block_service import site_block_service


@router.get("/configurador-opciones", response_model=PaginatedConfiguradorOpciones)
async def listar_configurador_opciones_admin(
    producto_id: Optional[uuid.UUID] = Query(None),
    grupo: Optional[str] = Query(None),
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return await configurador_opcion_service.listar_admin(db, producto_id, grupo, pagina, por_pagina)


@router.post("/configurador-opciones", response_model=ConfiguradorOpcionResponse, status_code=status.HTTP_201_CREATED)
async def crear_configurador_opcion_admin(
    data: ConfiguradorOpcionCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    op = await configurador_opcion_service.crear(db, data)
    return ConfiguradorOpcionResponse.model_validate(op)


@router.put("/configurador-opciones/{opcion_id}", response_model=ConfiguradorOpcionResponse)
async def actualizar_configurador_opcion_admin(
    opcion_id: uuid.UUID,
    data: ConfiguradorOpcionUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    op = await configurador_opcion_service.actualizar(db, opcion_id, data)
    return ConfiguradorOpcionResponse.model_validate(op)


@router.delete("/configurador-opciones/{opcion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_configurador_opcion_admin(
    opcion_id: uuid.UUID,
    permanente: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    await configurador_opcion_service.eliminar(db, opcion_id, permanente=permanente)


# ── Bloques del sitio (CMS global) ────────────────────────────────────────────

@router.get("/site-blocks")
async def listar_site_blocks_admin(
    seccion: Optional[str] = Query(None),
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(200, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return await site_block_service.listar_admin(db, seccion, pagina, por_pagina)


@router.post("/site-blocks", response_model=SiteBlockResponse, status_code=status.HTTP_201_CREATED)
async def crear_site_block_admin(
    data: SiteBlockCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    block = await site_block_service.crear(db, data)
    return SiteBlockResponse.model_validate(block)


@router.put("/site-blocks/{block_id}", response_model=SiteBlockResponse)
async def actualizar_site_block_admin(
    block_id: uuid.UUID,
    data: SiteBlockUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    block = await site_block_service.actualizar(db, block_id, data)
    return SiteBlockResponse.model_validate(block)


@router.delete("/site-blocks/{block_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_site_block_admin(
    block_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    await site_block_service.eliminar(db, block_id)


