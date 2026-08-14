"""Sync /parts catalog into productos + variantes (admin + seed)."""
from __future__ import annotations

import uuid
from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.data.parts_catalog import (
    ACCESSORIES,
    ACCESSORY_SLUG_ALIASES,
    CATALOG_NAMESPACE,
    DEFAULT_STOCK,
    DEFAULT_STOCK_MINIMO,
    PARTS,
)
from app.models.producto import Producto
from app.models.variante import Variante
from app.utils.redis_client import cache_delete_pattern

_NAMESPACE = UUID(CATALOG_NAMESPACE)


def _pid(slug: str) -> UUID:
    return uuid.uuid5(_NAMESPACE, slug)


def _vid(slug: str) -> UUID:
    return uuid.uuid5(_NAMESPACE, f"variant-{slug}")


def _legacy_slugs(canonical_slug: str) -> List[str]:
    aliases = list(ACCESSORY_SLUG_ALIASES.get(canonical_slug, []))
    if canonical_slug.startswith("part-"):
        aliases.append(canonical_slug[5:])
    if canonical_slug.startswith("acc-"):
        bare = canonical_slug[4:]
        aliases.extend([bare, f"vanguard-{bare}", f"nomadic-{bare}"])
    return aliases


class PartsCatalogSyncService:
    async def _find_producto(
        self, db: AsyncSession, canonical_slug: str, deterministic_id: UUID
    ) -> Optional[Producto]:
        result = await db.execute(select(Producto).where(Producto.slug == canonical_slug))
        producto = result.scalar_one_or_none()
        if producto:
            return producto

        for legacy in _legacy_slugs(canonical_slug):
            result = await db.execute(select(Producto).where(Producto.slug == legacy))
            producto = result.scalar_one_or_none()
            if producto:
                return producto

        result = await db.execute(select(Producto).where(Producto.id == deterministic_id))
        return result.scalar_one_or_none()

    async def _slug_available(
        self, db: AsyncSession, slug: str, producto_id: UUID
    ) -> bool:
        result = await db.execute(
            select(Producto.id).where(Producto.slug == slug, Producto.id != producto_id)
        )
        return result.scalar_one_or_none() is None

    async def _upsert_producto(
        self,
        db: AsyncSession,
        *,
        canonical_slug: str,
        nombre: str,
        descripcion: str,
        categoria: str,
        imagenes: List[str],
        orden: int,
    ) -> Tuple[Producto, bool]:
        pid = _pid(canonical_slug)
        producto = await self._find_producto(db, canonical_slug, pid)
        descripcion_corta = descripcion[:500] if descripcion else None
        created = False

        if producto:
            if await self._slug_available(db, canonical_slug, producto.id):
                producto.slug = canonical_slug
            producto.nombre = nombre
            producto.descripcion = descripcion
            producto.descripcion_corta = descripcion_corta
            producto.categoria = categoria
            producto.imagenes = imagenes
            producto.activo = True
            producto.orden_display = orden
        else:
            producto = Producto(
                id=pid,
                slug=canonical_slug,
                nombre=nombre,
                descripcion=descripcion,
                descripcion_corta=descripcion_corta,
                categoria=categoria,
                imagenes=imagenes,
                activo=True,
                destacado=False,
                orden_display=orden,
            )
            db.add(producto)
            created = True

        await db.flush()
        return producto, created

    async def _find_variante(
        self, db: AsyncSession, sku: str, deterministic_id: UUID
    ) -> Optional[Variante]:
        result = await db.execute(select(Variante).where(Variante.sku == sku))
        variante = result.scalar_one_or_none()
        if variante:
            return variante
        result = await db.execute(select(Variante).where(Variante.id == deterministic_id))
        return result.scalar_one_or_none()

    async def _upsert_variante(
        self,
        db: AsyncSession,
        *,
        canonical_slug: str,
        producto_id: UUID,
        sku: str,
        precio: float,
        compatible_with: List[str],
    ) -> None:
        vid = _vid(canonical_slug)
        variante = await self._find_variante(db, sku, vid)
        atributos = {"compatible_with": compatible_with}

        if variante:
            variante.producto_id = producto_id
            variante.nombre = "Standard"
            variante.precio = precio
            variante.stock = DEFAULT_STOCK
            variante.stock_minimo = DEFAULT_STOCK_MINIMO
            variante.atributos = atributos
            variante.activo = True
            variante.es_principal = True
        else:
            db.add(
                Variante(
                    id=vid,
                    producto_id=producto_id,
                    nombre="Standard",
                    sku=sku,
                    precio=precio,
                    stock=DEFAULT_STOCK,
                    stock_minimo=DEFAULT_STOCK_MINIMO,
                    atributos=atributos,
                    activo=True,
                    es_principal=True,
                )
            )

        await db.flush()

    async def _seed_group(
        self,
        db: AsyncSession,
        items: list,
        categoria: str,
        slug_prefix: str,
        sku_prefix: str,
        start_order: int,
    ) -> Dict[str, int]:
        created = 0
        updated = 0
        for i, (item_id, nombre, precio, compatible, imagen, descripcion) in enumerate(items, start=1):
            slug = f"{slug_prefix}-{item_id}"
            sku = f"{sku_prefix}-{item_id.upper().replace('-', '_')}"
            producto, is_new = await self._upsert_producto(
                db,
                canonical_slug=slug,
                nombre=nombre,
                descripcion=descripcion,
                categoria=categoria,
                imagenes=[imagen],
                orden=start_order + i,
            )
            if is_new:
                created += 1
            else:
                updated += 1
            await self._upsert_variante(
                db,
                canonical_slug=slug,
                producto_id=producto.id,
                sku=sku,
                precio=float(precio),
                compatible_with=compatible,
            )
        return {"created": created, "updated": updated, "total": len(items)}

    async def sync_catalog(
        self, db: AsyncSession, *, stock_reset: bool = True
    ) -> Dict[str, Any]:
        parts_stats = await self._seed_group(
            db, PARTS, "repuestos", "part", "PART", 100
        )
        acc_stats = await self._seed_group(
            db, ACCESSORIES, "accesorios", "acc", "ACC", 200
        )
        await db.commit()
        await cache_delete_pattern("productos:*")

        return {
            "parts": parts_stats["total"],
            "accessories": acc_stats["total"],
            "total": parts_stats["total"] + acc_stats["total"],
            "created": parts_stats["created"] + acc_stats["created"],
            "updated": parts_stats["updated"] + acc_stats["updated"],
            "stock_reset": stock_reset,
        }


parts_catalog_sync_service = PartsCatalogSyncService()
