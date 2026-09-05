"""
WingConcept Backend — Orden Service
Creación, gestión de estado y ciclo de vida de órdenes
"""
import logging
import math
import uuid as uuid_module
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import RecursoNoEncontradoError, PermisosDenegadosError
from app.services.carrito_service import carrito_service
from app.services.stock_service import stock_service
from app.models.carrito import Carrito
from app.models.orden import ItemOrden, Orden
from app.models.variante import Variante
from app.schemas.orden import (
    AdminOrdenResponse,
    DireccionEnvioResumen,
    ESTADO_DISPLAY_MAP,
    OrdenCreate,
    OrdenDetalleResponse,
    OrdenResponse,
    OrdenUpdate,
    PaginatedAdminOrdenes,
    PaginatedOrdenes,
)
from app.services.orden_timeline_service import orden_timeline_service
from app.services.orden_notification_service import orden_notification_service
from app.utils.config_summary import format_config_lines
from app.utils.tax import calcular_impuestos, get_tax_rate_from_producto

logger = logging.getLogger(__name__)

UPDATABLE_ORDEN_FIELDS = frozenset({
    "estado", "notas_admin", "numero_guia", "transportadora",
})


def _build_orden_response(orden: Orden) -> OrdenResponse:
    data = OrdenResponse.model_validate(orden)
    data.estado_display = ESTADO_DISPLAY_MAP.get(orden.estado, orden.estado.capitalize())
    return data


async def _build_orden_detalle(
    db: AsyncSession,
    orden: Orden,
    *,
    include_admin_fields: bool = False,
) -> OrdenDetalleResponse:
    await orden_timeline_service.ensure_timeline(db, orden)
    timeline = await orden_timeline_service.listar_eventos(db, orden.id)

    base = _build_orden_response(orden)
    detalle = OrdenDetalleResponse(
        **base.model_dump(),
        timeline=timeline,
        direccion_envio=(
            DireccionEnvioResumen.model_validate(orden.direccion_envio)
            if orden.direccion_envio else None
        ),
    )

    if include_admin_fields and orden.usuario:
        detalle.cliente_nombre = f"{orden.usuario.nombre} {orden.usuario.apellido}".strip()
        detalle.cliente_email = orden.usuario.email
        detalle.notas_admin = orden.notas_admin

    return detalle


def _build_admin_orden_response(orden: Orden) -> AdminOrdenResponse:
    """Construye respuesta enriquecida para el panel admin."""
    usuario = orden.usuario
    nombre_completo = None
    email = None
    if usuario:
        nombre_completo = f"{usuario.nombre} {usuario.apellido}".strip()
        email = usuario.email

    estado_display = ESTADO_DISPLAY_MAP.get(orden.estado, orden.estado.capitalize())
    precio_total = float(orden.total)
    total_formateado = f"${precio_total:,.2f}"
    fecha = orden.created_at.strftime("%Y-%m-%d") if orden.created_at else ""

    return AdminOrdenResponse(
        id=orden.id,
        numero_orden=orden.numero_orden,
        cliente_nombre=nombre_completo,
        cliente_email=email,
        total=precio_total,
        total_formateado=total_formateado,
        estado=orden.estado,
        estado_display=estado_display,
        fecha=fecha,
        cantidad_items=len(orden.items),
        moneda=orden.moneda,
    )


def _generar_numero_orden() -> str:
    """
    Genera número de orden legible con baja probabilidad de colisión.

    Formato: WC-{AÑO}-{4 dígitos de microsegundos}{5 hex aleatorios}
    Ejemplo: WC-2026-8312A3F9C

    El timestamp en segundos era vulnerable a colisiones en requests simultáneos.
    Ahora se usan microsegundos (4 dígitos) + UUID aleatorio (5 hex) como sufijo,
    lo que hace prácticamente imposible la colisión. El campo numero_orden tiene
    UNIQUE constraint en la DB como último respaldo.
    """
    now = datetime.now(timezone.utc)
    year = now.year
    micro_part = now.strftime("%f")[:4]          # 4 dígitos de microsegundos (0000-9999)
    uuid_part = uuid_module.uuid4().hex[:5].upper()  # 5 hex aleatorios (A3F9C)
    return f"WC-{year}-{micro_part}{uuid_part}"


class OrdenService:

    async def crear_desde_carrito(
        self, db: AsyncSession, usuario_id: UUID, data: OrdenCreate
    ) -> OrdenResponse:
        """
        Crea una orden a partir del carrito del usuario.
        Valida stock de partes/accesorios antes de confirmar.
        """
        # Obtener carrito con todos sus items
        carrito_result = await db.execute(
            select(Carrito)
            .options(selectinload(Carrito.items))
            .where(Carrito.usuario_id == usuario_id)
        )
        carrito = carrito_result.scalar_one_or_none()

        if not carrito or not carrito.items:
            raise RecursoNoEncontradoError("Carrito vacío o inexistente")

        # Recalcular precios configurados (paratrikes) con tarifas actuales del admin
        variante_ids = [item.variante_id for item in carrito.items]
        variantes_result = await db.execute(
            select(Variante)
            .options(selectinload(Variante.producto))
            .where(Variante.id.in_(variante_ids))
        )
        variantes_map = {v.id: v for v in variantes_result.scalars().all()}
        await carrito_service._sincronizar_precios_carrito_db(db, carrito, variantes_map)

        # Calcular subtotal desde precios del carrito
        subtotal = 0.0
        items_orden = []
        lineas_impuesto = []

        for item in carrito.items:
            variante = variantes_map.get(item.variante_id)

            if not variante or not variante.activo:
                raise RecursoNoEncontradoError(f"Variante {item.variante_id}")

            line_subtotal = float(item.precio_unitario) * item.cantidad
            subtotal += line_subtotal
            lineas_impuesto.append(
                (line_subtotal, get_tax_rate_from_producto(variante.producto))
            )

            # Snapshot del producto al momento de compra (incluye configuración del configurador)
            configuracion = item.configuracion or None
            snapshot = {
                "nombre": variante.producto.nombre if variante.producto else "Producto",
                "variante": variante.nombre,
                "sku": variante.sku,
                "precio": float(variante.precio),
                "imagen": (variante.producto.imagenes[0] if variante.producto and variante.producto.imagenes else None),
            }
            if configuracion:
                snapshot["configuracion"] = configuracion
                summary = format_config_lines(configuracion)
                if summary:
                    snapshot["config_summary"] = summary

            items_orden.append(
                ItemOrden(
                    variante_id=variante.id,
                    cantidad=item.cantidad,
                    precio_unitario=item.precio_unitario,
                    snapshot=snapshot,
                )
            )

        await stock_service.validar_items_orden(db, items_orden)

        # Crear orden
        descuento = 0.0
        impuestos = calcular_impuestos(lineas_impuesto, subtotal, descuento)
        total = subtotal + impuestos

        orden = Orden(
            numero_orden=_generar_numero_orden(),
            usuario_id=usuario_id,
            direccion_envio_id=data.direccion_envio_id,
            estado="pendiente",
            subtotal=subtotal,
            descuento=descuento,
            costo_envio=0,
            impuestos=impuestos,
            total=total,
            moneda=data.moneda,
            notas_cliente=data.notas_cliente,
            items=items_orden,
        )
        db.add(orden)
        await db.flush()
        orden_id = orden.id

        if data.codigo_cupon:
            from app.services.cupon_service import cupon_service
            descuento = await cupon_service.aplicar_en_orden(
                db, usuario_id, data.codigo_cupon, subtotal, orden_id
            )
            impuestos = calcular_impuestos(lineas_impuesto, subtotal, descuento)
            orden.descuento = descuento
            orden.impuestos = impuestos
            orden.total = max(subtotal - descuento, 0) + impuestos
            await db.flush()

        # Limpiar carrito tras crear la orden
        for item in carrito.items:
            await db.delete(item)
        await db.flush()

        # Re-cargar orden con items (evita MissingGreenlet en model_validate)
        orden_result = await db.execute(
            select(Orden)
            .options(selectinload(Orden.items), selectinload(Orden.usuario))
            .where(Orden.id == orden_id)
        )
        orden = orden_result.scalar_one()

        await orden_timeline_service.registrar_evento(
            db,
            orden,
            "pendiente",
            mensaje="Your order has been received.",
            actor="system",
            created_at=orden.created_at,
        )

        await orden_notification_service.notificar_estado(db, orden, None, forzar=True)

        logger.info(f"Orden creada: {orden.numero_orden} usuario:{usuario_id}")
        return _build_orden_response(orden)

    async def obtener_por_id(
        self, db: AsyncSession, orden_id: UUID, usuario_id: Optional[UUID] = None
    ) -> OrdenResponse:
        """
        Obtiene una orden por ID.
        Si se pasa usuario_id, valida que la orden pertenece al usuario.
        """
        query = (
            select(Orden)
            .options(selectinload(Orden.items))
            .where(Orden.id == orden_id)
        )
        if usuario_id:
            query = query.where(Orden.usuario_id == usuario_id)

        result = await db.execute(query)
        orden = result.scalar_one_or_none()
        if not orden:
            raise RecursoNoEncontradoError("Orden")

        return _build_orden_response(orden)

    async def obtener_con_acceso(
        self,
        db: AsyncSession,
        orden_id: UUID,
        usuario,
    ) -> OrdenDetalleResponse:
        """
        Obtiene orden con timeline. Admin ve datos extra del cliente.
        """
        result = await db.execute(
            select(Orden)
            .options(
                selectinload(Orden.items),
                selectinload(Orden.direccion_envio),
                selectinload(Orden.usuario),
            )
            .where(Orden.id == orden_id)
        )
        orden = result.scalar_one_or_none()
        if not orden:
            raise RecursoNoEncontradoError("Orden")

        is_admin = getattr(usuario, "rol", "client") == "admin"
        if not is_admin and orden.usuario_id != usuario.id:
            raise RecursoNoEncontradoError("Orden")

        return await _build_orden_detalle(db, orden, include_admin_fields=is_admin)

    async def listar_usuario(
        self,
        db: AsyncSession,
        usuario_id: UUID,
        pagina: int = 1,
        por_pagina: int = 10,
    ) -> PaginatedOrdenes:
        """Lista las órdenes de un usuario con paginación."""
        query = (
            select(Orden)
            .options(selectinload(Orden.items))
            .where(Orden.usuario_id == usuario_id)
            .order_by(Orden.created_at.desc())
        )

        count_result = await db.execute(
            select(func.count()).select_from(
                select(Orden).where(Orden.usuario_id == usuario_id).subquery()
            )
        )
        total = count_result.scalar() or 0

        query = query.offset((pagina - 1) * por_pagina).limit(por_pagina)
        result = await db.execute(query)
        ordenes = result.scalars().all()

        return PaginatedOrdenes(
            items=[_build_orden_response(o) for o in ordenes],
            total=total,
            pagina=pagina,
            por_pagina=por_pagina,
            paginas=math.ceil(total / por_pagina) if total > 0 else 0,
        )

    async def listar_admin(
        self,
        db: AsyncSession,
        pagina: int = 1,
        por_pagina: int = 20,
        estado: Optional[str] = None,
    ) -> PaginatedAdminOrdenes:
        """Lista todas las órdenes (admin) con datos del cliente."""
        query = (
            select(Orden)
            .options(selectinload(Orden.items), selectinload(Orden.usuario))
        )
        if estado:
            query = query.where(Orden.estado == estado)

        count_result = await db.execute(
            select(func.count()).select_from(query.subquery())
        )
        total = count_result.scalar() or 0

        query = query.order_by(Orden.created_at.desc()).offset(
            (pagina - 1) * por_pagina
        ).limit(por_pagina)
        result = await db.execute(query)
        ordenes = result.scalars().all()

        items = [_build_admin_orden_response(o) for o in ordenes]

        return PaginatedAdminOrdenes(
            items=items,
            total=total,
            pagina=pagina,
            por_pagina=por_pagina,
            paginas=math.ceil(total / por_pagina) if total > 0 else 0,
        )

    async def actualizar_estado(
        self, db: AsyncSession, orden_id: UUID, data: OrdenUpdate
    ) -> AdminOrdenResponse:
        """Actualiza estado y detalles de una orden (admin)."""
        result = await db.execute(
            select(Orden)
            .options(selectinload(Orden.items), selectinload(Orden.usuario))
            .where(Orden.id == orden_id)
        )
        orden = result.scalar_one_or_none()
        if not orden:
            raise RecursoNoEncontradoError("Orden")

        estado_anterior = orden.estado
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field in UPDATABLE_ORDEN_FIELDS:
                setattr(orden, field, value)
            else:
                logger.warning(
                    f"Campo no permitido en actualización de orden ignorado: {field}"
                )

        await db.flush()

        if "estado" in update_data and orden.estado != estado_anterior:
            await orden_timeline_service.registrar_cambio_estado(
                db, orden, estado_anterior, actor="admin",
            )
            await orden_notification_service.notificar_estado(
                db, orden, estado_anterior,
            )

        logger.info(f"Orden {orden.numero_orden} actualizada: {update_data}")
        return _build_admin_orden_response(orden)


orden_service = OrdenService()

