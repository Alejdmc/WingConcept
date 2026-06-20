"""
WingConcept Backend — Upload Endpoints (Admin)
POST /api/v1/admin/uploads/imagen
POST /api/v1/admin/uploads/modelo-3d

Los archivos se suben a Supabase Storage — no pasan por volúmenes Docker.
Solo administradores pueden subir archivos.
"""
import logging
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, UploadFile, status

from app.core.dependencies import get_current_admin
from app.core.exceptions import ValidacionError
from app.services.storage_service import storage_service

router = APIRouter(prefix="/admin/uploads", tags=["Uploads"])
logger = logging.getLogger(__name__)

MAX_FILENAME_LENGTH = 255


async def _leer_archivo(file: UploadFile) -> tuple[bytes, str, str]:
    """Lee y valida un archivo subido."""
    if not file.filename:
        raise ValidacionError("El archivo debe tener un nombre")

    if len(file.filename) > MAX_FILENAME_LENGTH:
        raise ValidacionError("Nombre de archivo demasiado largo")

    content = await file.read()
    if not content:
        raise ValidacionError("El archivo está vacío")

    content_type = file.content_type or "application/octet-stream"
    return content, file.filename, content_type


@router.post("/imagen", status_code=status.HTTP_201_CREATED)
async def subir_imagen(
    file: UploadFile = File(...),
    producto_id: Optional[UUID] = Form(None),
    _admin=Depends(get_current_admin),
):
    """
    Sube una imagen de producto a Supabase Storage.
    Retorna la URL pública para usar en `imagenes[]` del producto.
    """
    content, filename, content_type = await _leer_archivo(file)
    url = await storage_service.subir_imagen(
        content=content,
        filename=filename,
        content_type=content_type,
        producto_id=str(producto_id) if producto_id else None,
    )
    return {"url": url, "tipo": "imagen"}


@router.post("/modelo-3d", status_code=status.HTTP_201_CREATED)
async def subir_modelo_3d(
    file: UploadFile = File(...),
    producto_id: Optional[UUID] = Form(None),
    _admin=Depends(get_current_admin),
):
    """
    Sube un modelo 3D (.glb/.gltf) para el configurador interactivo.
    Retorna la URL pública para asignar a `modelo_3d_url` del producto.
    """
    content, filename, content_type = await _leer_archivo(file)
    url = await storage_service.subir_modelo_3d(
        content=content,
        filename=filename,
        content_type=content_type,
        producto_id=str(producto_id) if producto_id else None,
    )
    return {"url": url, "tipo": "modelo_3d"}
