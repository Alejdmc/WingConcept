"""
WingConcept Backend — Producto Service
CRUD de productos y variantes con caché Redis
"""
import logging
import math
import uuid as uuid_module
from typing import List, Optional
from uuid import UUID

from slugify import slugify
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import RecursoNoEncontradoError
from app.models.producto import Producto
from app.models.variante import Variante
from app.schemas.producto import (
    AdminProductoResponse,
    CategoriaResponse,
    PaginatedAdminProductos,
    PaginatedProductos,
    ProductoCreate,
    ProductoListResponse,
    ProductoResponse,
    ProductoUpdate,
    VarianteCreate,
    VarianteResponse,
    VarianteUpdate,
)
from app.utils.redis_client import cache_delete_pattern, cache_get, cache_set
from app.config import settings

logger = logging.getLogger(__name__)

CACHE_PREFIX = "productos"


def _format_price(precio: Optional[float]) -> Optional[str]:
    """Formatea un precio numérico como string con signo $ y separadores de miles.
    Ejemplo: 5000.0 → '$5,000'  (compatible con useCart.js del frontend)
    """
    if precio is None:
        return None
    return f"${precio:,.0f}"


def _format_specs(atributos: Optional[dict]) -> Optional[str]:
    """Construye el string de specs técnicas desde los atributos de la variante.
    Ejemplo: {"peso_kg": 28, "empuje_kg": 95} → '28kg | 95kg thrust'
    """
    if not atributos:
        return None
    parts = []
    if "peso_kg" in atributos:
        parts.append(f"{atributos['peso_kg']}kg")
    if "empuje_kg" in atributos:
        parts.append(f"{atributos['empuje_kg']}kg thrust")
    return " | ".join(parts) if parts else None


def _build_list_response(p: "Producto", variantes_activas: list) -> "ProductoListResponse":
    """Construye un ProductoListResponse con todos los campos (backend + frontend)."""
    precio_desde = min((v.precio for v in variantes_activas), default=None)

    # Specs: tomar atributos de la variante principal (es_principal=True) o la primera
    variante_principal = next(
        (v for v in variantes_activas if v.es_principal),
        variantes_activas[0] if variantes_activas else None,
    )
    specs = _format_specs(variante_principal.atributos if variante_principal else None)

    return ProductoListResponse(
        id=p.id,
        nombre=p.nombre,
        slug=p.slug,
        descripcion_corta=p.descripcion_corta,
        categoria=p.categoria,
        subcategoria=p.subcategoria,
        imagenes=p.imagenes,
        activo=p.activo,
        destacado=p.destacado,
        precio_desde=precio_desde,
        # Campos amigables para el frontend
        name=p.nombre,
        image=p.imagenes[0] if p.imagenes else None,
        price=_format_price(precio_desde),
        desc=p.descripcion_corta,
        specs=specs,
    )


class ProductoService:

    async def listar(
        self,
        db: AsyncSession,
        pagina: int = 1,
        por_pagina: int = 12,
        categoria: Optional[str] = None,
        buscar: Optional[str] = None,
        solo_activos: bool = True,
    ) -> PaginatedProductos:
        """Lista productos con paginación, filtros y caché."""
        cache_key = f"{CACHE_PREFIX}:list:{pagina}:{por_pagina}:{categoria}:{buscar}:{solo_activos}"
        cached = await cache_get(cache_key)
        if cached:
            return PaginatedProductos(**cached)

        query = select(Producto).options(selectinload(Producto.variantes))

        if solo_activos:
            query = query.where(Producto.activo == True)
        if categoria:
            query = query.where(Producto.categoria == categoria)
        if buscar:
            query = query.where(
                or_(
                    Producto.nombre.ilike(f"%{buscar}%"),
                    Producto.descripcion.ilike(f"%{buscar}%"),
                )
            )

        # Contar total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # Aplicar paginación y orden
        query = (
            query
            .order_by(Producto.orden_display, Producto.created_at.desc())
            .offset((pagina - 1) * por_pagina)
            .limit(por_pagina)
        )

        result = await db.execute(query)
        productos = result.scalars().all()

        items = []
        for p in productos:
            variantes_activas = [v for v in p.variantes if v.activo]
            items.append(_build_list_response(p, variantes_activas))

        paginated = PaginatedProductos(
            items=items,
            total=total,
            pagina=pagina,
            por_pagina=por_pagina,
            paginas=math.ceil(total / por_pagina) if total > 0 else 0,
        )

        await cache_set(cache_key, paginated.model_dump(), ttl=settings.REDIS_CACHE_TTL)
        return paginated

    async def obtener_por_slug(self, db: AsyncSession, slug: str) -> ProductoResponse:
        """Obtiene un producto completo por slug."""
        cache_key = f"{CACHE_PREFIX}:slug:{slug}"
        cached = await cache_get(cache_key)
        if cached:
            return ProductoResponse(**cached)

        result = await db.execute(
            select(Producto)
            .options(selectinload(Producto.variantes))
            .where(Producto.slug == slug, Producto.activo == True)
        )
        producto = result.scalar_one_or_none()
        if not producto:
            raise RecursoNoEncontradoError("Producto")

        response = ProductoResponse.model_validate(producto)
        await cache_set(cache_key, response.model_dump(), ttl=settings.REDIS_CACHE_TTL)
        return response

    async def obtener_por_id(self, db: AsyncSession, producto_id: UUID) -> Producto:
        """Obtiene un producto por ID (para uso interno)."""
        result = await db.execute(
            select(Producto)
            .options(selectinload(Producto.variantes))
            .where(Producto.id == producto_id)
        )
        producto = result.scalar_one_or_none()
        if not producto:
            raise RecursoNoEncontradoError("Producto")
        return producto

    async def crear(self, db: AsyncSession, data: ProductoCreate) -> ProductoResponse:
        """Crea un nuevo producto con variantes opcionales."""
        slug = slugify(data.nombre, allow_unicode=False)
        # Verificar slug único
        existe = await db.execute(select(Producto).where(Producto.slug == slug))
        if existe.scalar_one_or_none():
            slug = f"{slug}-{str(uuid_module.uuid4())[:8]}"

        payload = data.model_dump(exclude={"variantes"})
        producto = Producto(slug=slug, **payload)
        db.add(producto)
        await db.flush()

        if data.variantes:
            for variante_data in data.variantes:
                variante = Variante(producto_id=producto.id, **variante_data.model_dump())
                db.add(variante)
            await db.flush()

        await db.refresh(producto)
        await cache_delete_pattern(f"{CACHE_PREFIX}:list:*")
        logger.info(f"Producto creado: {producto.nombre}")
        return ProductoResponse.model_validate(producto)

    async def obtener_admin(self, db: AsyncSession, producto_id: UUID) -> ProductoResponse:
        """Obtiene un producto completo por ID para el panel admin."""
        producto = await self.obtener_por_id(db, producto_id)
        return ProductoResponse.model_validate(producto)

    async def actualizar(
        self, db: AsyncSession, producto_id: UUID, data: ProductoUpdate
    ) -> ProductoResponse:
        """Actualiza un producto existente."""
        producto = await self.obtener_por_id(db, producto_id)

        update_data = data.model_dump(exclude_unset=True)
        if "nombre" in update_data:
            update_data["slug"] = slugify(update_data["nombre"])

        for key, value in update_data.items():
            setattr(producto, key, value)

        await db.flush()
        await cache_delete_pattern(f"{CACHE_PREFIX}:*")
        return ProductoResponse.model_validate(producto)

    async def eliminar(self, db: AsyncSession, producto_id: UUID) -> None:
        """Soft delete: desactiva el producto en lugar de eliminarlo."""
        producto = await self.obtener_por_id(db, producto_id)
        producto.activo = False
        await db.flush()
        await cache_delete_pattern(f"{CACHE_PREFIX}:*")
        logger.info(f"Producto desactivado: {producto_id}")

    # ── Variantes ──────────────────────────────────────────────────────────────

    async def crear_variante(
        self, db: AsyncSession, producto_id: UUID, data: VarianteCreate
    ) -> VarianteResponse:
        """Agrega una variante a un producto."""
        await self.obtener_por_id(db, producto_id)
        variante = Variante(producto_id=producto_id, **data.model_dump())
        db.add(variante)
        await db.flush()
        await db.refresh(variante)
        await cache_delete_pattern(f"{CACHE_PREFIX}:*")
        return VarianteResponse.model_validate(variante)

    async def actualizar_variante(
        self, db: AsyncSession, variante_id: UUID, data: VarianteUpdate
    ) -> VarianteResponse:
        """Actualiza una variante."""
        result = await db.execute(select(Variante).where(Variante.id == variante_id))
        variante = result.scalar_one_or_none()
        if not variante:
            raise RecursoNoEncontradoError("Variante")

        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(variante, key, value)

        await db.flush()
        await cache_delete_pattern(f"{CACHE_PREFIX}:*")
        return VarianteResponse.model_validate(variante)

    # ── Endpoints de utilidad ──────────────────────────────────────────────────

    async def listar_destacados(
        self,
        db: AsyncSession,
        limite: int = 6,
    ) -> List[ProductoListResponse]:
        """Lista productos destacados para la página principal."""
        cache_key = f"{CACHE_PREFIX}:destacados:{limite}"
        cached = await cache_get(cache_key)
        if cached:
            return [ProductoListResponse(**p) for p in cached]

        result = await db.execute(
            select(Producto)
            .options(selectinload(Producto.variantes))
            .where(
                Producto.activo == True,
                Producto.destacado == True,
                Producto.slug != "i-pro",
            )
            .order_by(Producto.orden_display, Producto.created_at.desc())
            .limit(limite)
        )
        productos = result.scalars().all()

        items = []
        for p in productos:
            variantes_activas = [v for v in p.variantes if v.activo]
            items.append(_build_list_response(p, variantes_activas))

        await cache_set(cache_key, [i.model_dump() for i in items], ttl=settings.REDIS_CACHE_TTL)
        return items

    async def listar_admin(
        self,
        db: AsyncSession,
        pagina: int = 1,
        por_pagina: int = 20,
        buscar: Optional[str] = None,
    ) -> PaginatedAdminProductos:
        """Lista productos para el panel de admin con stock total y ventas."""
        from app.models.variante import Variante
        from app.models.orden import ItemOrden

        query = select(Producto).options(selectinload(Producto.variantes))
        if buscar:
            query = query.where(Producto.nombre.ilike(f"%{buscar}%"))

        count_result = await db.execute(
            select(func.count()).select_from(query.subquery())
        )
        total = count_result.scalar() or 0

        query = (
            query
            .order_by(Producto.orden_display, Producto.nombre)
            .offset((pagina - 1) * por_pagina)
            .limit(por_pagina)
        )
        result = await db.execute(query)
        productos = result.scalars().all()

        # Obtener ventas totales por producto mediante una subquery
        # ventas_map: { producto_id → total_unidades_vendidas }
        ventas_result = await db.execute(
            select(
                Variante.producto_id,
                func.coalesce(func.sum(ItemOrden.cantidad), 0).label("total_ventas"),
            )
            .join(ItemOrden, ItemOrden.variante_id == Variante.id, isouter=True)
            .group_by(Variante.producto_id)
        )
        ventas_map = {str(row.producto_id): int(row.total_ventas) for row in ventas_result.all()}

        items = []
        for p in productos:
            variantes_activas = [v for v in p.variantes if v.activo]
            stock_total = sum(v.stock for v in variantes_activas)
            precio_desde = min((v.precio for v in variantes_activas), default=None)
            ventas = ventas_map.get(str(p.id), 0)

            items.append(AdminProductoResponse(
                id=p.id,
                name=p.nombre,
                price=_format_price(precio_desde),
                stock=stock_total,
                sales=ventas,
                activo=p.activo,
                categoria=p.categoria,
                subcategoria=p.subcategoria,
            ))

        return PaginatedAdminProductos(
            items=items,
            total=total,
            pagina=pagina,
            por_pagina=por_pagina,
            paginas=math.ceil(total / por_pagina) if total > 0 else 0,
        )

    async def listar_categorias(self, db: AsyncSession) -> List[CategoriaResponse]:
        """Retorna categorías disponibles con conteo de productos activos."""
        cache_key = f"{CACHE_PREFIX}:categorias"
        cached = await cache_get(cache_key)
        if cached:
            return [CategoriaResponse(**c) for c in cached]

        result = await db.execute(
            select(Producto.categoria, func.count(Producto.id).label("total"))
            .where(Producto.activo == True)
            .group_by(Producto.categoria)
            .order_by(Producto.categoria)
        )
        rows = result.all()
        categorias = [CategoriaResponse(categoria=row.categoria, total=row.total) for row in rows]

        await cache_set(cache_key, [c.model_dump() for c in categorias], ttl=settings.REDIS_CACHE_TTL)
        return categorias


producto_service = ProductoService()

