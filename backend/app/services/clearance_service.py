"""
WingConcept Backend — Clearance Service (equipo de segunda mano)
"""
import math
from typing import Optional
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import PermisosDenegadosError, RecursoNoEncontradoError, ValidacionError
from app.models.clearance import ClearanceListing
from app.schemas.clearance import ClearanceCreate, ClearanceResponse, ClearanceUpdate, clearance_image_prefix

# Límite de publicaciones visibles por usuario (evita spam)
MAX_PUBLICACIONES_ACTIVAS = 10
ESTADOS_PUBLICOS = ("activo", "vendido")


def _verificar_fotos_propias(imagenes: list[str], usuario) -> None:
    """Cada usuario solo puede usar fotos que subió él mismo (clearance/<usuario_id>/...)."""
    if usuario.rol == "admin":
        return
    propio = f"{clearance_image_prefix()}{usuario.id}/"
    if any(not url.startswith(propio) for url in imagenes):
        raise ValidacionError("Solo puedes usar fotos que subiste tú")


class ClearanceService:

    async def obtener(self, db: AsyncSession, listing_id: UUID) -> ClearanceListing:
        result = await db.execute(select(ClearanceListing).where(ClearanceListing.id == listing_id))
        listing = result.scalar_one_or_none()
        if not listing:
            raise RecursoNoEncontradoError("Publicación")
        return listing

    async def obtener_publica(self, db: AsyncSession, listing_id: UUID) -> ClearanceResponse:
        listing = await self.obtener(db, listing_id)
        if listing.estado not in ESTADOS_PUBLICOS:
            raise RecursoNoEncontradoError("Publicación")
        return ClearanceResponse.model_validate(listing)

    async def listar_publico(
        self,
        db: AsyncSession,
        categoria: Optional[str] = None,
        q: Optional[str] = None,
        pagina: int = 1,
        por_pagina: int = 24,
    ) -> dict:
        query = select(ClearanceListing).where(ClearanceListing.estado.in_(ESTADOS_PUBLICOS))
        if categoria:
            query = query.where(ClearanceListing.categoria == categoria)
        if q:
            patron = f"%{q.strip()[:80]}%"
            query = query.where(or_(ClearanceListing.titulo.ilike(patron), ClearanceListing.descripcion.ilike(patron)))

        total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
        # Disponibles primero, luego vendidos; los más nuevos arriba
        query = (
            query.order_by((ClearanceListing.estado == "vendido"), ClearanceListing.created_at.desc())
            .offset((pagina - 1) * por_pagina)
            .limit(por_pagina)
        )
        result = await db.execute(query)
        return {
            "items": [ClearanceResponse.model_validate(x) for x in result.scalars().all()],
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "paginas": math.ceil(total / por_pagina) if total else 0,
        }

    async def listar_de_usuario(self, db: AsyncSession, usuario_id: UUID) -> list[ClearanceResponse]:
        result = await db.execute(
            select(ClearanceListing)
            .where(ClearanceListing.usuario_id == usuario_id)
            .order_by(ClearanceListing.created_at.desc())
        )
        return [ClearanceResponse.model_validate(x) for x in result.scalars().all()]

    async def crear(self, db: AsyncSession, usuario, data: ClearanceCreate) -> ClearanceResponse:
        activas = (await db.execute(
            select(func.count()).select_from(ClearanceListing).where(
                ClearanceListing.usuario_id == usuario.id,
                ClearanceListing.estado == "activo",
            )
        )).scalar() or 0
        if activas >= MAX_PUBLICACIONES_ACTIVAS:
            raise ValidacionError(
                f"Puedes tener máximo {MAX_PUBLICACIONES_ACTIVAS} publicaciones activas. Marca alguna como vendida."
            )
        _verificar_fotos_propias(data.imagenes, usuario)
        listing = ClearanceListing(usuario_id=usuario.id, **data.model_dump())
        db.add(listing)
        await db.commit()
        await db.refresh(listing)
        return ClearanceResponse.model_validate(listing)

    def _verificar_dueno(self, listing: ClearanceListing, usuario) -> None:
        if listing.usuario_id != usuario.id and usuario.rol != "admin":
            raise PermisosDenegadosError("Solo el autor puede modificar esta publicación")

    async def actualizar(self, db: AsyncSession, usuario, listing_id: UUID, data: ClearanceUpdate) -> ClearanceResponse:
        listing = await self.obtener(db, listing_id)
        self._verificar_dueno(listing, usuario)
        if listing.estado == "oculto" and usuario.rol != "admin":
            raise PermisosDenegadosError("Esta publicación fue ocultada por un administrador")
        if data.imagenes is not None and usuario.rol != "admin":
            nuevas = [u for u in data.imagenes if u not in (listing.imagenes or [])]
            _verificar_fotos_propias(nuevas, usuario)
        for campo, valor in data.model_dump(exclude_unset=True).items():
            if valor is None and campo not in ("ubicacion", "contacto_telefono"):
                continue
            setattr(listing, campo, valor)
        await db.commit()
        await db.refresh(listing)
        return ClearanceResponse.model_validate(listing)

    async def eliminar(self, db: AsyncSession, usuario, listing_id: UUID) -> None:
        listing = await self.obtener(db, listing_id)
        self._verificar_dueno(listing, usuario)
        await db.delete(listing)
        await db.commit()

    async def cambiar_estado_admin(self, db: AsyncSession, listing_id: UUID, estado: str) -> ClearanceListing:
        listing = await self.obtener(db, listing_id)
        listing.estado = estado
        await db.commit()
        await db.refresh(listing)
        return listing

    async def listar_admin(self, db: AsyncSession, pagina: int = 1, por_pagina: int = 50) -> dict:
        query = select(ClearanceListing)
        total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
        result = await db.execute(
            query.order_by(ClearanceListing.created_at.desc()).offset((pagina - 1) * por_pagina).limit(por_pagina)
        )
        return {"items": list(result.scalars().all()), "total": total, "pagina": pagina, "por_pagina": por_pagina}


clearance_service = ClearanceService()
