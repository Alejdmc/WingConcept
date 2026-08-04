"""CMS y configurador — endpoints públicos."""
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.configurador_opcion import ConfiguradorCatalogResponse
from app.schemas.site_block import SiteBlocksPublicResponse
from app.services.configurador_opcion_service import configurador_opcion_service
from app.services.site_block_service import site_block_service

router = APIRouter(prefix="/cms", tags=["CMS"])


@router.get("/site", response_model=SiteBlocksPublicResponse)
async def obtener_bloques_sitio(
    seccion: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Textos e imágenes globales del sitio (homepage, etc.)."""
    blocks = await site_block_service.publico(db, seccion=seccion)
    return SiteBlocksPublicResponse(blocks=blocks)


@router.get("/configurador/{producto_id}", response_model=ConfiguradorCatalogResponse)
async def obtener_catalogo_configurador(
    producto_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Opciones del configurador para un producto (motores, accesorios, etc.)."""
    return await configurador_opcion_service.catalogo_publico(db, producto_id)
