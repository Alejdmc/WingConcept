"""Servicio — opciones del configurador (CMS)."""
from __future__ import annotations

import math
import uuid
from typing import Any, Dict, List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.data.accessory_images import resolve_accessory_image
from app.models.configurador_opcion import ConfiguradorOpcion
from app.models.producto import Producto
from app.models.variante import Variante
from app.schemas.configurador_opcion import (
    ConfiguradorCatalogResponse,
    ConfiguradorOpcionCreate,
    ConfiguradorOpcionUpdate,
    PaginatedConfiguradorOpciones,
)

NOMADIC_PRODUCT_ID = uuid.UUID("d1e2f3a4-b5c6-7890-1234-567890abcdef")
DISRUPTOR_PARAMOTOR_PRODUCT_ID = uuid.UUID("e1f2a3b4-c5d6-7890-1234-567890abcdef")
DISRUPTOR_TRIKE_PRODUCT_ID = uuid.UUID("f1e2a3b4-c5d6-7890-1234-567890abcdef")
NOMADIC_DOCUMENT_BASE_PRICE = 4879.5
DISRUPTOR_PARAMOTOR_BASE = 2800.0
DISRUPTOR_TRIKE_BASE = 2500.0


def _normalize_gallery(op: ConfiguradorOpcion) -> List[str]:
    extra = op.extra or {}
    gallery = extra.get("gallery")
    if isinstance(gallery, list):
        urls = [g for g in gallery if isinstance(g, str) and g.strip()]
        if urls:
            return urls[:3]
    return []


def _opcion_to_dict(op: ConfiguradorOpcion) -> Dict[str, Any]:
    base = {
        "id": op.slug,
        "name": op.nombre,
        "description": op.descripcion,
        "price": op.precio,
        "basePrice": op.precio,
        "image": op.imagen,
    }
    if op.extra:
        base.update(op.extra)
    gallery = _normalize_gallery(op)
    if gallery:
        base["gallery"] = gallery
    return base


class ConfiguradorOpcionService:

    async def listar_admin(
        self,
        db: AsyncSession,
        producto_id: Optional[uuid.UUID] = None,
        grupo: Optional[str] = None,
        pagina: int = 1,
        por_pagina: int = 100,
    ) -> PaginatedConfiguradorOpciones:
        query = select(ConfiguradorOpcion)
        count_query = select(func.count()).select_from(ConfiguradorOpcion)
        if producto_id:
            query = query.where(ConfiguradorOpcion.producto_id == producto_id)
            count_query = count_query.where(ConfiguradorOpcion.producto_id == producto_id)
        if grupo:
            query = query.where(ConfiguradorOpcion.grupo == grupo)
            count_query = count_query.where(ConfiguradorOpcion.grupo == grupo)

        total = (await db.execute(count_query)).scalar() or 0
        paginas = max(1, math.ceil(total / por_pagina)) if por_pagina else 1
        offset = (pagina - 1) * por_pagina
        result = await db.execute(
            query.order_by(ConfiguradorOpcion.grupo, ConfiguradorOpcion.orden, ConfiguradorOpcion.nombre)
            .offset(offset).limit(por_pagina)
        )
        items = result.scalars().all()
        from app.schemas.configurador_opcion import ConfiguradorOpcionResponse
        return PaginatedConfiguradorOpciones(
            items=[ConfiguradorOpcionResponse.model_validate(i) for i in items],
            total=total,
            pagina=pagina,
            por_pagina=por_pagina,
            paginas=paginas,
        )

    async def obtener(self, db: AsyncSession, opcion_id: uuid.UUID) -> ConfiguradorOpcion:
        result = await db.execute(select(ConfiguradorOpcion).where(ConfiguradorOpcion.id == opcion_id))
        op = result.scalar_one_or_none()
        if not op:
            raise RecursoNoEncontradoError("Opción de configurador")
        return op

    async def crear(self, db: AsyncSession, data: ConfiguradorOpcionCreate) -> ConfiguradorOpcion:
        producto = await db.get(Producto, data.producto_id)
        if not producto:
            raise RecursoNoEncontradoError("Producto")
        op = ConfiguradorOpcion(**data.model_dump())
        db.add(op)
        await db.flush()
        await db.refresh(op)
        return op

    async def actualizar(
        self, db: AsyncSession, opcion_id: uuid.UUID, data: ConfiguradorOpcionUpdate
    ) -> ConfiguradorOpcion:
        op = await self.obtener(db, opcion_id)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(op, key, value)
        await db.flush()
        await db.refresh(op)
        return op

    async def eliminar(self, db: AsyncSession, opcion_id: uuid.UUID, permanente: bool = False) -> None:
        op = await self.obtener(db, opcion_id)
        if permanente:
            await db.delete(op)
        else:
            op.activo = False
        await db.flush()

    async def _precio_base(self, db: AsyncSession, producto_id: uuid.UUID) -> Optional[float]:
        if producto_id == NOMADIC_PRODUCT_ID:
            return NOMADIC_DOCUMENT_BASE_PRICE
        if producto_id == DISRUPTOR_PARAMOTOR_PRODUCT_ID:
            return DISRUPTOR_PARAMOTOR_BASE
        if producto_id == DISRUPTOR_TRIKE_PRODUCT_ID:
            return DISRUPTOR_TRIKE_BASE
        result = await db.execute(
            select(Variante)
            .where(Variante.producto_id == producto_id, Variante.activo == True)
            .order_by(Variante.es_principal.desc(), Variante.created_at.asc())
        )
        variante = result.scalars().first()
        return float(variante.precio) if variante else None

    async def catalogo_publico(
        self, db: AsyncSession, producto_id: uuid.UUID
    ) -> ConfiguradorCatalogResponse:
        producto = await db.get(Producto, producto_id)
        if not producto or not producto.activo:
            raise RecursoNoEncontradoError("Producto")

        result = await db.execute(
            select(ConfiguradorOpcion)
            .where(ConfiguradorOpcion.producto_id == producto_id, ConfiguradorOpcion.activo == True)
            .order_by(ConfiguradorOpcion.grupo, ConfiguradorOpcion.orden)
        )
        opciones = result.scalars().all()

        grouped: Dict[str, List[Dict[str, Any]]] = {
            "engines": [],
            "chassis_types": [],
            "finishes": [],
            "propellers": [],
            "colors": [],
            "hand_throttles": [],
            "accessories": [],
        }
        for op in opciones:
            item = _opcion_to_dict(op)
            if op.grupo == "engine":
                grouped["engines"].append(item)
            elif op.grupo == "chassis_type":
                grouped["chassis_types"].append(item)
            elif op.grupo == "finish":
                grouped["finishes"].append(item)
            elif op.grupo == "propeller":
                grouped["propellers"].append(item)
            elif op.grupo == "color":
                extra = op.extra or {}
                grouped["colors"].append({
                    "id": op.slug,
                    "name": extra.get("displayName", op.nombre),
                    "hex": extra.get("hex"),
                    "price": float(op.precio or 0),
                    "accent": extra.get("accent"),
                })
            elif op.grupo == "hand_throttle":
                grouped["hand_throttles"].append(item)
            elif op.grupo == "accessory":
                item["image"] = resolve_accessory_image(op.slug, op.imagen, producto_id)
                grouped["accessories"].append(item)

        grouped["engines"].sort(key=lambda x: (0 if x.get("id") == "no-engine" else 1, x.get("name") or ""))
        grouped["propellers"].sort(key=lambda x: (0 if x.get("id") == "no-propeller" else 1, x.get("name") or ""))

        return ConfiguradorCatalogResponse(
            producto_id=producto_id,
            base_chassis_price=await self._precio_base(db, producto_id),
            **grouped,
        )

    async def build_price_maps(
        self, db: AsyncSession, producto_id: uuid.UUID
    ) -> Optional[Dict[str, Any]]:
        """Mapas slug→precio para cálculo en carrito."""
        result = await db.execute(
            select(ConfiguradorOpcion)
            .where(ConfiguradorOpcion.producto_id == producto_id, ConfiguradorOpcion.activo == True)
        )
        opciones = result.scalars().all()
        if not opciones:
            return None

        catalog: Dict[str, Any] = {
            "engines": {},
            "finishes": {},
            "propellers": {},
            "accessories": {},
            "hand_throttles": {},
            "colors": {},
            "default_engine": None,
        }
        for op in opciones:
            if op.grupo == "engine":
                catalog["engines"][op.slug] = op.precio
            elif op.grupo == "finish":
                catalog["finishes"][op.slug] = op.precio
            elif op.grupo == "propeller":
                catalog["propellers"][op.slug] = op.precio
            elif op.grupo == "accessory":
                catalog["accessories"][op.slug] = op.precio
            elif op.grupo == "hand_throttle":
                catalog["hand_throttles"][op.slug] = op.precio
            elif op.grupo == "color":
                catalog["colors"][op.slug] = op.precio

        if "no-engine" in catalog["engines"]:
            catalog["default_engine"] = "no-engine"
        elif catalog["engines"]:
            catalog["default_engine"] = next(iter(catalog["engines"]))

        if not catalog["engines"]:
            catalog["engines"] = {"no-engine": 0}
            catalog["default_engine"] = "no-engine"

        return catalog


configurador_opcion_service = ConfiguradorOpcionService()
