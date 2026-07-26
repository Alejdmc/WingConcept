"""
WingConcept Backend — Manual Service
"""
import math
from typing import List
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import RecursoNoEncontradoError, ValidacionError
from app.models.manual import Manual
from app.schemas.manual import ManualCreate, ManualPublicResponse, ManualResponse, ManualUpdate
from app.services.storage_service import storage_service
from slugify import slugify


class ManualService:

    async def obtener_por_id(self, db: AsyncSession, manual_id: UUID) -> Manual:
        result = await db.execute(select(Manual).where(Manual.id == manual_id))
        manual = result.scalar_one_or_none()
        if not manual:
            raise RecursoNoEncontradoError("Manual")
        return manual

    async def listar_publico(self, db: AsyncSession) -> List[ManualPublicResponse]:
        query = (
            select(Manual)
            .where(Manual.activo == True)
            .order_by(Manual.orden, Manual.created_at)
        )
        result = await db.execute(query)
        return [ManualPublicResponse.from_manual(m) for m in result.scalars().all()]

    async def listar_admin(
        self,
        db: AsyncSession,
        pagina: int = 1,
        por_pagina: int = 50,
    ) -> dict:
        query = select(Manual)

        total = (await db.execute(
            select(func.count()).select_from(query.subquery())
        )).scalar() or 0

        query = (
            query
            .order_by(Manual.orden, Manual.created_at)
            .offset((pagina - 1) * por_pagina)
            .limit(por_pagina)
        )
        result = await db.execute(query)
        items = [ManualResponse.model_validate(m) for m in result.scalars().all()]

        return {
            "items": items,
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "paginas": math.ceil(total / por_pagina) if total > 0 else 0,
        }

    async def crear(self, db: AsyncSession, data: ManualCreate) -> ManualResponse:
        manual = Manual(**data.model_dump())
        db.add(manual)
        await db.flush()
        await db.refresh(manual)
        return ManualResponse.model_validate(manual)

    async def actualizar(
        self, db: AsyncSession, manual_id: UUID, data: ManualUpdate
    ) -> ManualResponse:
        manual = await self.obtener_por_id(db, manual_id)
        update_data = data.model_dump(exclude_unset=True)
        old_archivo = manual.archivo_url
        for key, value in update_data.items():
            setattr(manual, key, value)
        if (
            "archivo_url" in update_data
            and old_archivo
            and update_data["archivo_url"] != old_archivo
        ):
            await storage_service.eliminar_por_referencia(old_archivo)
        await db.flush()
        return ManualResponse.model_validate(manual)

    async def eliminar(self, db: AsyncSession, manual_id: UUID, permanente: bool = False) -> None:
        manual = await self.obtener_por_id(db, manual_id)
        if permanente:
            if manual.archivo_url:
                await storage_service.eliminar_por_referencia(manual.archivo_url)
            await db.delete(manual)
        else:
            manual.activo = False
        await db.flush()


    async def descargar_archivo(
        self, db: AsyncSession, manual_id: UUID
    ) -> tuple[bytes, str, str]:
        """Obtiene bytes del PDF, nombre de archivo sugerido y content-type."""
        manual = await self.obtener_por_id(db, manual_id)
        if not manual.activo:
            raise RecursoNoEncontradoError("Manual")
        if not manual.archivo_url:
            raise ValidacionError("Este manual aún no tiene archivo disponible")

        content, content_type = await storage_service.obtener_archivo(manual.archivo_url)
        filename = f"{slugify(manual.nombre, allow_unicode=False) or 'manual'}.pdf"
        return content, filename, content_type or "application/pdf"


manual_service = ManualService()
