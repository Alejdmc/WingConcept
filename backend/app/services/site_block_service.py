"""Servicio — bloques de contenido del sitio."""
from __future__ import annotations

import math
import uuid
from typing import Dict, List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import RecursoNoEncontradoError
from app.models.site_block import SiteBlock
from app.schemas.site_block import SiteBlockCreate, SiteBlockUpdate


class SiteBlockService:

    async def listar_admin(
        self,
        db: AsyncSession,
        seccion: Optional[str] = None,
        pagina: int = 1,
        por_pagina: int = 200,
    ):
        from app.schemas.site_block import SiteBlockResponse

        query = select(SiteBlock)
        count_query = select(func.count()).select_from(SiteBlock)
        if seccion:
            query = query.where(SiteBlock.seccion == seccion)
            count_query = count_query.where(SiteBlock.seccion == seccion)

        total = (await db.execute(count_query)).scalar() or 0
        paginas = max(1, math.ceil(total / por_pagina)) if por_pagina else 1
        offset = (pagina - 1) * por_pagina
        result = await db.execute(
            query.order_by(SiteBlock.seccion, SiteBlock.orden, SiteBlock.clave)
            .offset(offset).limit(por_pagina)
        )
        items = [SiteBlockResponse.model_validate(b) for b in result.scalars().all()]
        return {"items": items, "total": total, "pagina": pagina, "por_pagina": por_pagina, "paginas": paginas}

    async def obtener(self, db: AsyncSession, block_id: uuid.UUID) -> SiteBlock:
        result = await db.execute(select(SiteBlock).where(SiteBlock.id == block_id))
        block = result.scalar_one_or_none()
        if not block:
            raise RecursoNoEncontradoError("Bloque de sitio")
        return block

    async def crear(self, db: AsyncSession, data: SiteBlockCreate) -> SiteBlock:
        block = SiteBlock(**data.model_dump())
        db.add(block)
        await db.flush()
        await db.refresh(block)
        return block

    async def actualizar(self, db: AsyncSession, block_id: uuid.UUID, data: SiteBlockUpdate) -> SiteBlock:
        block = await self.obtener(db, block_id)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(block, key, value)
        await db.flush()
        await db.refresh(block)
        return block

    async def eliminar(self, db: AsyncSession, block_id: uuid.UUID) -> None:
        block = await self.obtener(db, block_id)
        await db.delete(block)
        await db.flush()

    async def publico(self, db: AsyncSession, seccion: Optional[str] = None) -> Dict[str, str]:
        query = select(SiteBlock).where(SiteBlock.activo == True)
        if seccion:
            query = query.where(SiteBlock.seccion == seccion)
        result = await db.execute(query.order_by(SiteBlock.orden))
        return {b.clave: (b.valor or "") for b in result.scalars().all()}


site_block_service = SiteBlockService()
