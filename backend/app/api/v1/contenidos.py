"""
WingConcept Backend — Contenidos públicos (CMS)
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.contenido import (
    AdventurePageResponse,
    ContenidoResponse,
    EventsPageResponse,
    ShowsPageResponse,
)
from app.services.contenido_service import contenido_service

router = APIRouter(prefix="/contenidos", tags=["Contenidos"])


@router.get("/adventure", response_model=AdventurePageResponse)
async def obtener_adventure(db: AsyncSession = Depends(get_db)):
    return await contenido_service.obtener_adventure(db)


@router.get("/shows", response_model=ShowsPageResponse)
async def obtener_shows(db: AsyncSession = Depends(get_db)):
    return await contenido_service.obtener_shows(db)


@router.get("/events", response_model=EventsPageResponse)
async def obtener_events(db: AsyncSession = Depends(get_db)):
    return await contenido_service.obtener_events(db)


@router.get("/seccion/{seccion}", response_model=list[ContenidoResponse])
async def listar_contenidos_seccion(seccion: str, db: AsyncSession = Depends(get_db)):
    return await contenido_service.listar_por_seccion(db, seccion.lower(), solo_activos=True)
