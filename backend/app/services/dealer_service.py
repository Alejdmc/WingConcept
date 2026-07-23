"""
WingConcept Backend — Dealer Service
"""
import math
from typing import List, Optional
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import RecursoNoEncontradoError
from app.models.dealer import Dealer
from app.schemas.dealer import DealerCreate, DealerResponse, DealerUpdate


class DealerService:

    async def obtener_por_id(self, db: AsyncSession, dealer_id: UUID) -> Dealer:
        result = await db.execute(select(Dealer).where(Dealer.id == dealer_id))
        dealer = result.scalar_one_or_none()
        if not dealer:
            raise RecursoNoEncontradoError("Dealer")
        return dealer

    async def listar_publico(self, db: AsyncSession) -> List[DealerResponse]:
        query = (
            select(Dealer)
            .where(Dealer.activo == True)
            .order_by(Dealer.orden, Dealer.created_at)
        )
        result = await db.execute(query)
        return [DealerResponse.model_validate(d) for d in result.scalars().all()]

    async def listar_admin(
        self,
        db: AsyncSession,
        pagina: int = 1,
        por_pagina: int = 50,
    ) -> dict:
        query = select(Dealer)

        total = (await db.execute(
            select(func.count()).select_from(query.subquery())
        )).scalar() or 0

        query = (
            query
            .order_by(Dealer.orden, Dealer.created_at)
            .offset((pagina - 1) * por_pagina)
            .limit(por_pagina)
        )
        result = await db.execute(query)
        items = [DealerResponse.model_validate(d) for d in result.scalars().all()]

        return {
            "items": items,
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "paginas": math.ceil(total / por_pagina) if total > 0 else 0,
        }

    async def crear(self, db: AsyncSession, data: DealerCreate) -> DealerResponse:
        dealer = Dealer(**data.model_dump())
        db.add(dealer)
        await db.flush()
        await db.refresh(dealer)
        return DealerResponse.model_validate(dealer)

    async def actualizar(
        self, db: AsyncSession, dealer_id: UUID, data: DealerUpdate
    ) -> DealerResponse:
        dealer = await self.obtener_por_id(db, dealer_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(dealer, key, value)
        await db.flush()
        return DealerResponse.model_validate(dealer)

    async def eliminar(self, db: AsyncSession, dealer_id: UUID, permanente: bool = False) -> None:
        dealer = await self.obtener_por_id(db, dealer_id)
        if permanente:
            await db.delete(dealer)
        else:
            dealer.activo = False
        await db.flush()


dealer_service = DealerService()
