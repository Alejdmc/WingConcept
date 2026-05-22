"""
WingConcept Backend — Orden Service
Creación, gestión de estado y ciclo de vida de órdenes
"""
import logging
import math
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import RecursoNoEncontradoError, StockInsuficienteError, PermisosDenegadosError
from app.models.carrito import Carrito
from app.models.orden import ItemOrden, Orden
from app.models.variante import Variante
from app.schemas.orden import OrdenCreate, OrdenResponse, OrdenUpdate, PaginatedOrdenes

logger = logging.getLogger(__name__)


def _generar_numero_orden() -> str:
    """Genera número de orden legible: WC-2026-XXXXXX."""
    year = datetime.now(timezone.utc).year
    sufijo = str(int(datetime.now(timezone.utc).timestamp()))[-6:]
    return f"WC-{year}-{sufijo}"


class OrdenService:

    async def crear_desde_carrito(
        self, db: AsyncSession, usuario_id: UUID, data: OrdenCreate
    ) -> OrdenResponse:
        """
        Crea una orden a partir del carrito del usuario.
        Valida stock antes de crear.
        """
        # Obtener carrito con items
        result = await db.execute(
            select(Carrito)
            .options(selectinload(Carrito.items).selectinload(ItemOrden.variante if False else Carrito.items))
            .where(Carrito.usuario_id == usuario_id)
        )
        # Simplificado: obtener carrito e items directamente
        carrito_result = await db.execute(
            select(Carrito).where(Carrito.usuario_id == usuario_id)
        )
        carrito = carrito_result.scalar_one_or_none()

        if not carrito or not carrito.items:
            raise RecursoNoEncontradoError("Carrito vacío o inexistente")

        # Validar stock de cada item
        subtotal = 0.0
        items_orden = []

        for item in carrito.items:
            variante_result = await db.execute(
                select(Variante).where(Variante.id == item.variante_id)
            )
            variante = variante_result.scalar_one_or_none()

            if not variante or not variante.activo:
                raise RecursoNoEncontradoError(f"Variante {item.variante_id}")

            if variante.stock < item.cantidad:
                raise StockInsuficienteError(variante.nombre)

            subtotal += float(variante.precio) * item.cantidad

            # Snapshot del producto para auditoría
            snapshot = {
                "nombre": variante.producto.nombre if hasattr(variante, 'producto') and variante.producto else "Producto",
                "variante": variante.nombre,
                "sku": variante.sku,
                "precio": float(variante.precio),
            }

            items_orden.append(
                ItemOrden(
                    variante_id=variante.id,
                    cantidad=item.cantidad,
                    precio_unitario=variante.precio,
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

        # Limpiar carrito tras crear la orden
        for item in carrito.items:
            await db.delete(item)
        await db.flush()

        logger.info(f"Orden creada: {orden.numero_orden} usuario:{usuario_id}")
        await db.refresh(orden)
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
    ) -> PaginatedOrdenes:
        """Lista todas las órdenes (admin)."""
        query = select(Orden).options(selectinload(Orden.items))
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

        return PaginatedOrdenes(
            items=[OrdenResponse.model_validate(o) for o in ordenes],
            total=total,
            pagina=pagina,
            por_pagina=por_pagina,
            paginas=math.ceil(total / por_pagina) if total > 0 else 0,
        )

    async def actualizar_estado(
        self, db: AsyncSession, orden_id: UUID, data: OrdenUpdate
    ) -> OrdenResponse:
        """Actualiza estado y detalles de una orden (admin)."""
        result = await db.execute(
            select(Orden).options(selectinload(Orden.items)).where(Orden.id == orden_id)
        )
        orden = result.scalar_one_or_none()
        if not orden:
            raise RecursoNoEncontradoError("Orden")

        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(orden, key, value)

        await db.flush()
        logger.info(f"Orden {orden.numero_orden} actualizada: {data.model_dump(exclude_unset=True)}")
        return OrdenResponse.model_validate(orden)


orden_service = OrdenService()

