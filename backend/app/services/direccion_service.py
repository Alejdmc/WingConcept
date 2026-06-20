"""
WingConcept Backend — DireccionEnvio Service
CRUD de direcciones de envío del usuario autenticado.
"""
import logging
from typing import List
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import RecursoNoEncontradoError
from app.models.direccion_envio import DireccionEnvio
from app.schemas.usuario import DireccionEnvioCreate, DireccionEnvioResponse

logger = logging.getLogger(__name__)


class DireccionService:

    async def listar(
        self, db: AsyncSession, usuario_id: UUID
    ) -> List[DireccionEnvioResponse]:
        result = await db.execute(
            select(DireccionEnvio)
            .where(DireccionEnvio.usuario_id == usuario_id)
            .order_by(DireccionEnvio.es_principal.desc(), DireccionEnvio.created_at.desc())
        )
        return [DireccionEnvioResponse.model_validate(d) for d in result.scalars().all()]

    async def crear(
        self, db: AsyncSession, usuario_id: UUID, data: DireccionEnvioCreate
    ) -> DireccionEnvioResponse:
        if data.es_principal:
            await self._desmarcar_principal(db, usuario_id)

        direccion = DireccionEnvio(usuario_id=usuario_id, **data.model_dump())
        db.add(direccion)
        await db.flush()
        await db.refresh(direccion)
        logger.info(f"Dirección creada para usuario {usuario_id}")
        return DireccionEnvioResponse.model_validate(direccion)

    async def actualizar(
        self,
        db: AsyncSession,
        usuario_id: UUID,
        direccion_id: UUID,
        data: DireccionEnvioCreate,
    ) -> DireccionEnvioResponse:
        direccion = await self._obtener_propia(db, usuario_id, direccion_id)

        if data.es_principal and not direccion.es_principal:
            await self._desmarcar_principal(db, usuario_id)

        for key, value in data.model_dump().items():
            setattr(direccion, key, value)

        await db.flush()
        return DireccionEnvioResponse.model_validate(direccion)

    async def eliminar(
        self, db: AsyncSession, usuario_id: UUID, direccion_id: UUID
    ) -> None:
        direccion = await self._obtener_propia(db, usuario_id, direccion_id)
        await db.delete(direccion)
        await db.flush()
        logger.info(f"Dirección {direccion_id} eliminada")

    async def _obtener_propia(
        self, db: AsyncSession, usuario_id: UUID, direccion_id: UUID
    ) -> DireccionEnvio:
        result = await db.execute(
            select(DireccionEnvio).where(
                DireccionEnvio.id == direccion_id,
                DireccionEnvio.usuario_id == usuario_id,
            )
        )
        direccion = result.scalar_one_or_none()
        if not direccion:
            raise RecursoNoEncontradoError("Dirección")
        return direccion

    async def _desmarcar_principal(self, db: AsyncSession, usuario_id: UUID) -> None:
        await db.execute(
            update(DireccionEnvio)
            .where(DireccionEnvio.usuario_id == usuario_id, DireccionEnvio.es_principal == True)
            .values(es_principal=False)
        )


direccion_service = DireccionService()
