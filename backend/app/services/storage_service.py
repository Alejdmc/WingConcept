"""
WingConcept Backend — Supabase Storage Service
Subida de imágenes de productos y modelos 3D (.glb/.gltf).

Los archivos NO se almacenan en el contenedor Docker — van directamente a
Supabase Storage vía API REST. Docker solo ejecuta el backend que orquesta
la subida; los buckets se configuran en el panel de Supabase.

Buckets (settings):
  - SUPABASE_BUCKET_PRODUCTOS  → imágenes JPEG/PNG/WebP
  - SUPABASE_BUCKET_MODELOS_3D → modelos GLB/GLTF para el configurador 3D
"""
import logging
import uuid
from typing import Optional

import httpx

from app.config import settings
from app.core.exceptions import ServicioExternoError, ValidacionError

logger = logging.getLogger(__name__)

# Extensiones permitidas por tipo de archivo
EXTENSIONES_IMAGEN = {".jpg", ".jpeg", ".png", ".webp"}
EXTENSIONES_MODELO_3D = {".glb", ".gltf"}


def _validar_extension(filename: str, permitidas: set[str]) -> str:
    """Retorna la extensión en minúsculas o lanza error si no está permitida."""
    ext = ""
    if "." in filename:
        ext = f".{filename.rsplit('.', 1)[-1].lower()}"
    if ext not in permitidas:
        raise ValidacionError(
            f"Extensión '{ext or 'sin extensión'}' no permitida. "
            f"Aceptadas: {', '.join(sorted(permitidas))}"
        )
    return ext


def _validar_tamano(content: bytes, max_mb: int) -> None:
    max_bytes = max_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise ValidacionError(
            f"Archivo demasiado grande ({len(content) / 1024 / 1024:.1f} MB). "
            f"Máximo permitido: {max_mb} MB."
        )


class StorageService:
    """Cliente para subir archivos a Supabase Storage."""

    def _base_url(self) -> str:
        if not settings.SUPABASE_URL:
            raise ServicioExternoError(
                "Supabase Storage",
                "SUPABASE_URL no configurado. Configura las variables de Supabase en .env",
            )
        return settings.SUPABASE_URL.rstrip("/")

    def _headers(self, content_type: str) -> dict:
        if not settings.SUPABASE_SERVICE_KEY:
            raise ServicioExternoError(
                "Supabase Storage",
                "SUPABASE_SERVICE_KEY no configurado",
            )
        return {
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
            "Content-Type": content_type,
            "x-upsert": "true",
        }

    async def subir_archivo(
        self,
        content: bytes,
        filename: str,
        content_type: str,
        bucket: str,
        carpeta: str = "",
    ) -> str:
        """
        Sube un archivo a Supabase Storage y retorna la URL pública.

        Args:
            content: bytes del archivo
            filename: nombre original (solo para extraer extensión)
            content_type: MIME type validado
            bucket: nombre del bucket de Supabase
            carpeta: subcarpeta opcional dentro del bucket
        """
        _validar_tamano(content, settings.MAX_UPLOAD_SIZE_MB)

        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "bin"
        object_name = f"{uuid.uuid4().hex}.{ext}"
        if carpeta:
            object_path = f"{carpeta.strip('/')}/{object_name}"
        else:
            object_path = object_name

        url = f"{self._base_url()}/storage/v1/object/{bucket}/{object_path}"

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    url,
                    content=content,
                    headers=self._headers(content_type),
                )
                if response.status_code not in (200, 201):
                    logger.error(
                        f"Supabase Storage error [{response.status_code}]: {response.text[:200]}"
                    )
                    raise ServicioExternoError(
                        "Supabase Storage",
                        f"Error al subir archivo (HTTP {response.status_code})",
                    )
        except httpx.RequestError as e:
            logger.error(f"Error de conexión con Supabase Storage: {e}")
            raise ServicioExternoError("Supabase Storage", "Error de conexión")

        public_url = (
            f"{self._base_url()}/storage/v1/object/public/{bucket}/{object_path}"
        )
        logger.info(f"Archivo subido: {bucket}/{object_path} ({len(content)} bytes)")
        return public_url

    async def subir_imagen(
        self,
        content: bytes,
        filename: str,
        content_type: str,
        producto_id: Optional[str] = None,
    ) -> str:
        """Sube una imagen de producto al bucket configurado."""
        _validar_extension(filename, EXTENSIONES_IMAGEN)

        if content_type not in settings.get_allowed_image_types():
            raise ValidacionError(
                f"Tipo MIME '{content_type}' no permitido para imágenes. "
                f"Aceptados: {settings.ALLOWED_IMAGE_TYPES}"
            )

        carpeta = f"productos/{producto_id}" if producto_id else "productos"
        return await self.subir_archivo(
            content=content,
            filename=filename,
            content_type=content_type,
            bucket=settings.SUPABASE_BUCKET_PRODUCTOS,
            carpeta=carpeta,
        )

    async def subir_modelo_3d(
        self,
        content: bytes,
        filename: str,
        content_type: str,
        producto_id: Optional[str] = None,
    ) -> str:
        """
        Sube un modelo 3D (.glb/.gltf) al bucket de modelos 3D.
        Usado por el configurador interactivo del frontend (paratrike/configuration).
        """
        _validar_extension(filename, EXTENSIONES_MODELO_3D)

        allowed = settings.get_allowed_model_types()
        if content_type not in allowed:
            raise ValidacionError(
                f"Tipo MIME '{content_type}' no permitido para modelos 3D. "
                f"Aceptados: {settings.ALLOWED_MODEL_TYPES}"
            )

        carpeta = f"modelos/{producto_id}" if producto_id else "modelos"
        return await self.subir_archivo(
            content=content,
            filename=filename,
            content_type=content_type,
            bucket=settings.SUPABASE_BUCKET_MODELOS_3D,
            carpeta=carpeta,
        )

    async def eliminar_archivo(self, bucket: str, object_path: str) -> None:
        """Elimina un archivo de Supabase Storage (best-effort)."""
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
            return

        url = f"{self._base_url()}/storage/v1/object/{bucket}/{object_path}"
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                await client.delete(
                    url,
                    headers={"Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}"},
                )
        except Exception as e:
            logger.warning(f"No se pudo eliminar {bucket}/{object_path}: {e}")


storage_service = StorageService()
