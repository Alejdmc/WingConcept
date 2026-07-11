"""
WingConcept Backend — Contenido Service (CMS)
"""
import math
import uuid as uuid_module
from typing import List, Optional
from uuid import UUID

from slugify import slugify
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import RecursoNoEncontradoError
from app.models.contenido import Contenido
from app.schemas.contenido import (
    AdventurePageResponse,
    ContenidoCreate,
    ContenidoResponse,
    ContenidoUpdate,
    EventsPageResponse,
    SeccionPageResponse,
    ShowsPageResponse,
)


class ContenidoService:

    async def obtener_por_id(self, db: AsyncSession, contenido_id: UUID) -> Contenido:
        result = await db.execute(select(Contenido).where(Contenido.id == contenido_id))
        contenido = result.scalar_one_or_none()
        if not contenido:
            raise RecursoNoEncontradoError("Contenido")
        return contenido

    async def listar_por_seccion(
        self,
        db: AsyncSession,
        seccion: str,
        solo_activos: bool = True,
    ) -> List[ContenidoResponse]:
        query = select(Contenido).where(Contenido.seccion == seccion)
        if solo_activos:
            query = query.where(Contenido.activo == True)
        query = query.order_by(Contenido.orden, Contenido.created_at)
        result = await db.execute(query)
        items = result.scalars().all()
        return [ContenidoResponse.model_validate(c) for c in items]

    async def obtener_seccion_page(self, db: AsyncSession, seccion: str) -> SeccionPageResponse:
        """Construye respuesta estructurada hero + intro + items de tarjetas."""
        items = await self.listar_por_seccion(db, seccion, solo_activos=True)
        hero = next((c for c in items if c.tipo == "hero"), None)
        intro = next((c for c in items if c.tipo == "intro"), None)
        card_tipos = {"expedicion", "show", "evento"}
        cards = [c for c in items if c.tipo in card_tipos]
        return SeccionPageResponse(hero=hero, intro=intro, items=cards)

    async def obtener_adventure(self, db: AsyncSession) -> AdventurePageResponse:
        data = await self.obtener_seccion_page(db, "adventure")
        return AdventurePageResponse.from_seccion(data)

    async def obtener_shows(self, db: AsyncSession) -> ShowsPageResponse:
        data = await self.obtener_seccion_page(db, "shows")
        return ShowsPageResponse.from_seccion(data)

    async def obtener_events(self, db: AsyncSession) -> EventsPageResponse:
        data = await self.obtener_seccion_page(db, "events")
        return EventsPageResponse.from_seccion(data)

    async def listar_admin(
        self,
        db: AsyncSession,
        seccion: Optional[str] = None,
        pagina: int = 1,
        por_pagina: int = 50,
    ) -> dict:
        query = select(Contenido)
        if seccion:
            query = query.where(Contenido.seccion == seccion)

        total = (await db.execute(
            select(func.count()).select_from(query.subquery())
        )).scalar() or 0

        query = (
            query
            .order_by(Contenido.seccion, Contenido.orden, Contenido.created_at)
            .offset((pagina - 1) * por_pagina)
            .limit(por_pagina)
        )
        result = await db.execute(query)
        items = [ContenidoResponse.model_validate(c) for c in result.scalars().all()]

        return {
            "items": items,
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "paginas": math.ceil(total / por_pagina) if total > 0 else 0,
        }

    async def crear(self, db: AsyncSession, data: ContenidoCreate) -> ContenidoResponse:
        slug = data.slug or slugify(data.titulo, allow_unicode=False)
        existe = await db.execute(
            select(Contenido).where(
                Contenido.seccion == data.seccion,
                Contenido.slug == slug,
            )
        )
        if existe.scalar_one_or_none():
            slug = f"{slug}-{str(uuid_module.uuid4())[:8]}"

        contenido = Contenido(slug=slug, **data.model_dump(exclude={"slug"}))
        db.add(contenido)
        await db.flush()
        await db.refresh(contenido)
        return ContenidoResponse.model_validate(contenido)

    async def actualizar(
        self, db: AsyncSession, contenido_id: UUID, data: ContenidoUpdate
    ) -> ContenidoResponse:
        contenido = await self.obtener_por_id(db, contenido_id)
        update_data = data.model_dump(exclude_unset=True)

        if "slug" in update_data or "titulo" in update_data:
            new_slug = update_data.get("slug") or slugify(
                update_data.get("titulo", contenido.titulo), allow_unicode=False
            )
            existe = await db.execute(
                select(Contenido).where(
                    Contenido.seccion == contenido.seccion,
                    Contenido.slug == new_slug,
                    Contenido.id != contenido_id,
                )
            )
            if existe.scalar_one_or_none():
                new_slug = f"{new_slug}-{str(uuid_module.uuid4())[:8]}"
            update_data["slug"] = new_slug

        for key, value in update_data.items():
            setattr(contenido, key, value)

        await db.flush()
        return ContenidoResponse.model_validate(contenido)

    async def eliminar(self, db: AsyncSession, contenido_id: UUID, permanente: bool = False) -> None:
        contenido = await self.obtener_por_id(db, contenido_id)
        if permanente:
            await db.delete(contenido)
        else:
            contenido.activo = False
        await db.flush()


contenido_service = ContenidoService()
