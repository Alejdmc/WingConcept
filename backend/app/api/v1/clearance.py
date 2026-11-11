"""
WingConcept Backend — Clearance (equipo de segunda mano publicado por usuarios)

Público:   GET  /clearance, GET /clearance/{id}
Usuario:   GET  /clearance/mine, POST /clearance, PUT/DELETE /clearance/{id},
           POST /clearance/imagenes (sube una foto; máx. 10 por publicación)
Admin:     GET  /clearance/admin/all, PATCH /clearance/admin/{id}/estado

WingConcept solo es intermediario: no procesa pagos de estas publicaciones.
"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, Query, Request, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_admin, require_verified_email
from app.core.exceptions import PermisosDenegadosError, ValidacionError
from app.database import get_db
from app.schemas.clearance import (
    ClearanceAdminResponse,
    ClearanceCreate,
    ClearanceEstadoAdmin,
    ClearanceResponse,
    ClearanceUpdate,
)
from app.services.clearance_service import clearance_service
from app.services.storage_service import storage_service
from app.utils.redis_client import check_rate_limit
from app.utils.validators import sanitizar_nombre_archivo

router = APIRouter(prefix="/clearance", tags=["Clearance"])

MAX_FOTO_MB = 8


@router.get("")
async def listar(
    categoria: Optional[str] = Query(None, max_length=30),
    q: Optional[str] = Query(None, max_length=80),
    pagina: int = Query(1, ge=1, le=500),
    por_pagina: int = Query(24, ge=1, le=60),
    db: AsyncSession = Depends(get_db),
):
    return await clearance_service.listar_publico(db, categoria=categoria, q=q, pagina=pagina, por_pagina=por_pagina)


@router.get("/mine", response_model=list[ClearanceResponse])
async def mis_publicaciones(
    usuario=Depends(require_verified_email),
    db: AsyncSession = Depends(get_db),
):
    return await clearance_service.listar_de_usuario(db, usuario.id)


@router.get("/admin/all")
async def listar_admin(
    pagina: int = Query(1, ge=1),
    _admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    data = await clearance_service.listar_admin(db, pagina=pagina)
    data["items"] = [ClearanceAdminResponse.model_validate(x) for x in data["items"]]
    return data


@router.patch("/admin/{listing_id}/estado", response_model=ClearanceAdminResponse)
async def cambiar_estado_admin(
    listing_id: UUID,
    data: ClearanceEstadoAdmin,
    _admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    listing = await clearance_service.cambiar_estado_admin(db, listing_id, data.estado)
    return ClearanceAdminResponse.model_validate(listing)


@router.get("/{listing_id}", response_model=ClearanceResponse)
async def obtener(listing_id: UUID, db: AsyncSession = Depends(get_db)):
    return await clearance_service.obtener_publica(db, listing_id)


@router.post("", response_model=ClearanceResponse, status_code=status.HTTP_201_CREATED)
async def crear(
    data: ClearanceCreate,
    usuario=Depends(require_verified_email),
    db: AsyncSession = Depends(get_db),
):
    return await clearance_service.crear(db, usuario, data)


@router.put("/{listing_id}", response_model=ClearanceResponse)
async def actualizar(
    listing_id: UUID,
    data: ClearanceUpdate,
    usuario=Depends(require_verified_email),
    db: AsyncSession = Depends(get_db),
):
    return await clearance_service.actualizar(db, usuario, listing_id, data)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar(
    listing_id: UUID,
    usuario=Depends(require_verified_email),
    db: AsyncSession = Depends(get_db),
):
    await clearance_service.eliminar(db, usuario, listing_id)


@router.post("/imagenes", status_code=status.HTTP_201_CREATED)
async def subir_foto(
    request: Request,
    file: UploadFile = File(...),
    usuario=Depends(require_verified_email),
):
    """Sube una foto (JPEG/PNG/WebP, máx. 8 MB) y devuelve su URL para `imagenes[]`."""
    permitido, _ = await check_rate_limit(str(usuario.id), limit=60, window_seconds=3600, prefix="rl:clearance-img")
    if not permitido:
        raise PermisosDenegadosError("Demasiadas fotos subidas. Intenta más tarde.")
    if not file.filename:
        raise ValidacionError("El archivo debe tener un nombre")
    try:
        nombre = sanitizar_nombre_archivo(file.filename)
    except ValueError as exc:
        raise ValidacionError(str(exc)) from exc
    content = await file.read(MAX_FOTO_MB * 1024 * 1024 + 1)
    if not content:
        raise ValidacionError("El archivo está vacío")
    if len(content) > MAX_FOTO_MB * 1024 * 1024:
        raise ValidacionError(f"Cada foto debe pesar máximo {MAX_FOTO_MB} MB")
    url = await storage_service.subir_imagen(
        content=content,
        filename=nombre,
        content_type=file.content_type or "application/octet-stream",
        carpeta=f"clearance/{usuario.id}",
    )
    return {"url": url}
