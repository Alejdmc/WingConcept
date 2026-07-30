"""
WingConcept Backend — Manuales públicos
"""
import uuid

from fastapi import APIRouter, Depends, Request
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import PermisosDenegadosError, ValidacionError
from app.database import get_db
from app.schemas.manual import ManualPublicResponse
from app.services.manual_service import manual_service
from app.utils.redis_client import check_rate_limit

router = APIRouter(prefix="/manuals", tags=["Manuals"])


@router.get("", response_model=list[ManualPublicResponse])
async def listar_manuales(db: AsyncSession = Depends(get_db)):
    return await manual_service.listar_publico(db)


@router.get("/{manual_id}/download")
async def descargar_manual(
    manual_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Descarga el PDF a través del backend (no expone URL de Supabase al cliente).
    Rate limit: 30 descargas/hora por IP.
    """
    client_ip = request.client.host if request.client else "unknown"
    permitido, _ = await check_rate_limit(
        client_ip, limit=30, window_seconds=3600, prefix="rl:manual-dl"
    )
    if not permitido:
        raise PermisosDenegadosError("Too many download requests. Please try again later.")

    try:
        content, filename, content_type = await manual_service.descargar_archivo(db, manual_id)
    except ValidacionError:
        raise

    safe_filename = filename.replace('"', "")
    return Response(
        content=content,
        media_type=content_type,
        headers={
            "Content-Disposition": f'attachment; filename="{safe_filename}"',
            "Cache-Control": "private, max-age=3600",
            "X-Content-Type-Options": "nosniff",
        },
    )
