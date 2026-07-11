"""
WingConcept Backend — Contenidos públicos (CMS)
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.contenido import AdventurePageResponse, ContenidoResponse
from app.services.contenido_service import contenido_service

router = APIRouter(prefix="/contenidos", tags=["Contenidos"])


@router.get("/adventure", response_model=AdventurePageResponse)
async def obtener_adventure(db: AsyncSession = Depends(get_db)):
    """Contenido público de la sección Adventure."""
    return await contenido_service.obtener_adventure(db)


@router.get("/{seccion}", response_model=list[ContenidoResponse])
async def listar_contenidos_seccion(seccion: str, db: AsyncSession = Depends(get_db)):
    """Lista contenidos activos de una sección."""
    return await contenido_service.listar_por_seccion(db, seccion.lower(), solo_activos=True)
