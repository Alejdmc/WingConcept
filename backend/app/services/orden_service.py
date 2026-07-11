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
from app.models.carrito import Carrito
from app.models.orden import ItemOrden, Orden
from app.models.variante import Variante
from app.schemas.orden import (
    AdminOrdenResponse,
    ESTADO_DISPLAY_MAP,
    OrdenCreate,
    OrdenResponse,
    OrdenUpdate,
    PaginatedAdminOrdenes,
    PaginatedOrdenes,
)

logger = logging.getLogger(__name__)


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
        El stock lo gestiona el admin desde el panel.
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

        # Calcular subtotal desde precios del carrito
        subtotal = 0.0
        items_orden = []

        for item in carrito.items:
            variante_result = await db.execute(
                select(Variante)
                .options(selectinload(Variante.producto))
                .where(Variante.id == item.variante_id)
            )
            variante = variante_result.scalar_one_or_none()

            if not variante or not variante.activo:
                raise RecursoNoEncontradoError(f"Variante {item.variante_id}")

            subtotal += float(item.precio_unitario) * item.cantidad

            # Snapshot del producto para auditoría histórica
            snapshot = {
                "nombre": variante.producto.nombre if variante.producto else "Producto",
                "variante": variante.nombre,
                "sku": variante.sku,
                "precio": float(variante.precio),
                "imagen": (variante.producto.imagenes[0] if variante.producto and variante.producto.imagenes else None),
            }

            items_orden.append(
                ItemOrden(
                    variante_id=variante.id,
                    cantidad=item.cantidad,
                    precio_unitario=item.precio_unitario,
                    snapshot=snapshot,
                )
            )

        # Crear orden
        total = subtotal  # + costo_envio + impuestos (a calcular según reglas de negocio)
        orden = Orden(
            numero_orden=_generar_numero_orden(),
            usuario_id=usuario_id,
            direccion_envio_id=data.direccion_envio_id,
            estado="pendiente",
            subtotal=subtotal,
            descuento=0,
            costo_envio=0,
            impuestos=0,
            total=total,
            moneda=data.moneda,
            notas_cliente=data.notas_cliente,
            items=items_orden,
        )
        db.add(orden)
        await db.flush()
        orden_id = orden.id

        # Limpiar carrito tras crear la orden
        for item in carrito.items:
            await db.delete(item)
        await db.flush()

        # Re-cargar orden con items (evita MissingGreenlet en model_validate)
        orden_result = await db.execute(
            select(Orden)
            .options(selectinload(Orden.items))
            .where(Orden.id == orden_id)
        )
        orden = orden_result.scalar_one()

        logger.info(f"Orden creada: {orden.numero_orden} usuario:{usuario_id}")
        return OrdenResponse.model_validate(orden)

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

        return OrdenResponse.model_validate(orden)

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
            items=[OrdenResponse.model_validate(o) for o in ordenes],
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

        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(orden, key, value)

        await db.flush()
        logger.info(f"Orden {orden.numero_orden} actualizada: {data.model_dump(exclude_unset=True)}")
        return _build_admin_orden_response(orden)


orden_service = OrdenService()

