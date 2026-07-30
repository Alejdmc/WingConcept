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
from io import BytesIO
from typing import Optional

import httpx
from PIL import Image

from app.config import settings
from app.core.exceptions import ServicioExternoError, ValidacionError
from app.utils.validators import sanitizar_nombre_archivo

logger = logging.getLogger(__name__)

# Extensiones permitidas por tipo de archivo
EXTENSIONES_IMAGEN = {".jpg", ".jpeg", ".png", ".webp"}
EXTENSIONES_MODELO_3D = {".glb", ".gltf"}
EXTENSIONES_MANUAL = {".pdf"}


def _parse_supabase_storage_error(status: int, body: str, bucket: str) -> str:
    """Traduce errores comunes de Supabase Storage a mensajes accionables."""
    lower = body.lower()
    if status in (401, 403) or "invalid jwt" in lower or "invalid api key" in lower:
        return (
            "Clave SUPABASE_SERVICE_KEY inválida. "
            "Usa la service_role de Supabase → Settings → API (eyJ... o sb_secret_...)."
        )
    if status == 404 or "bucket not found" in lower or "not found" in lower:
        return (
            f"Bucket '{bucket}' no existe en Supabase Storage. "
            f"Crea el bucket '{bucket}' en el panel y márcalo como público."
        )
    if "row-level security" in lower or "policy" in lower:
        return (
            f"Storage bloqueó la subida al bucket '{bucket}'. "
            "Si el bucket es público, suele ser que SUPABASE_SERVICE_KEY y "
            "SUPABASE_ANON_KEY están intercambiadas en .env — SERVICE_KEY debe "
            "ser la clave service_role, no la anon."
        )
    if status == 400 and "duplicate" not in lower:
        return (
            f"Supabase rechazó la subida (HTTP 400). "
            f"Verifica SUPABASE_SERVICE_KEY y que el bucket '{bucket}' exista. Detalle: {body[:180]}"
        )
    return f"Error al subir archivo (HTTP {status}): {body[:180]}"


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


def _validar_contenido_imagen(content: bytes) -> None:
    """Verifica magic bytes reales — no confiar solo en Content-Type del cliente."""
    try:
        with Image.open(BytesIO(content)) as img:
            img.verify()
        # Reabrir tras verify() — verify() deja el stream en estado inconsistente
        with Image.open(BytesIO(content)) as img:
            if img.format not in ("JPEG", "PNG", "WEBP"):
                raise ValidacionError("Formato de imagen no permitido")
    except ValidacionError:
        raise
    except Exception as exc:
        logger.warning(f"Imagen rechazada por validación binaria: {exc}")
        raise ValidacionError("El archivo no es una imagen válida (JPEG, PNG o WebP)")


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
        retornar_referencia: bool = False,
        max_mb: int | None = None,
    ) -> str:
        """
        Sube un archivo a Supabase Storage.

        Por defecto retorna URL pública. Con retornar_referencia=True retorna
        'bucket/path' para servir descargas vía backend (sin exponer Supabase).
        """
        _validar_tamano(content, max_mb or settings.MAX_UPLOAD_SIZE_MB)

        safe_filename = sanitizar_nombre_archivo(filename)
        ext = safe_filename.rsplit(".", 1)[-1].lower() if "." in safe_filename else "bin"
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
                    body = response.text[:500]
                    logger.error(
                        f"Supabase Storage error [{response.status_code}] bucket={bucket}: {body}"
                    )
                    hint = _parse_supabase_storage_error(response.status_code, body, bucket)
                    raise ServicioExternoError("Supabase Storage", hint)
        except httpx.RequestError as e:
            logger.error(f"Error de conexión con Supabase Storage: {e}")
            raise ServicioExternoError("Supabase Storage", "Error de conexión")

        logger.info(f"Archivo subido: {bucket}/{object_path} ({len(content)} bytes)")
        if retornar_referencia:
            return f"{bucket}/{object_path}"
        return f"{self._base_url()}/storage/v1/object/public/{bucket}/{object_path}"

    def resolve_storage_ref(self, storage_ref: str) -> tuple[str, str]:
        """
        Convierte referencia interna (bucket/path) o URL legacy de Supabase a (bucket, path).
        """
        if not storage_ref or not str(storage_ref).strip():
            raise ValidacionError("Archivo no configurado")

        ref = str(storage_ref).strip()

        if ref.startswith("http://") or ref.startswith("https://"):
            for marker in ("/storage/v1/object/public/", "/storage/v1/object/sign/", "/storage/v1/object/"):
                if marker in ref:
                    rest = ref.split(marker, 1)[1].split("?", 1)[0]
                    bucket, _, path = rest.partition("/")
                    if bucket and path:
                        return bucket, path
            raise ValidacionError("URL de archivo no reconocida")

        if "/" not in ref:
            return settings.SUPABASE_BUCKET_MANUALS, ref

        bucket, _, path = ref.partition("/")
        return bucket, path

    async def obtener_archivo(self, storage_ref: str) -> tuple[bytes, str]:
        """Descarga un archivo de Supabase Storage usando service_role (bucket privado OK)."""
        bucket, object_path = self.resolve_storage_ref(storage_ref)
        url = f"{self._base_url()}/storage/v1/object/{bucket}/{object_path}"

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.get(
                    url,
                    headers={"Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}"},
                )
                if response.status_code != 200:
                    body = response.text[:300]
                    logger.error(f"Supabase download error [{response.status_code}]: {body}")
                    raise ServicioExternoError(
                        "Supabase Storage",
                        f"No se pudo obtener el archivo (HTTP {response.status_code})",
                    )
                content_type = response.headers.get("content-type", "application/octet-stream")
                return response.content, content_type.split(";")[0].strip()
        except httpx.RequestError as e:
            logger.error(f"Error de conexión descargando de Supabase Storage: {e}")
            raise ServicioExternoError("Supabase Storage", "Error de conexión")

    async def subir_imagen(
        self,
        content: bytes,
        filename: str,
        content_type: str,
        producto_id: Optional[str] = None,
    ) -> str:
        """Sube una imagen de producto al bucket configurado."""
        _validar_extension(filename, EXTENSIONES_IMAGEN)
        _validar_contenido_imagen(content)

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

    async def subir_manual(
        self,
        content: bytes,
        filename: str,
        content_type: str,
    ) -> str:
        """Sube un manual PDF al bucket de manuales."""
        _validar_extension(filename, EXTENSIONES_MANUAL)
        _validar_tamano(content, settings.MAX_MANUAL_UPLOAD_SIZE_MB)

        if content[:4] != b"%PDF":
            raise ValidacionError("El archivo no es un PDF válido")

        allowed = settings.get_allowed_manual_types()
        if content_type not in allowed:
            raise ValidacionError(
                f"Tipo MIME '{content_type}' no permitido para manuales. "
                f"Aceptados: {settings.ALLOWED_MANUAL_TYPES}"
            )

        return await self.subir_archivo(
            content=content,
            filename=filename,
            content_type=content_type,
            bucket=settings.SUPABASE_BUCKET_MANUALS,
            carpeta="pdfs",
            retornar_referencia=True,
            max_mb=settings.MAX_MANUAL_UPLOAD_SIZE_MB,
        )

    async def eliminar_por_referencia(self, storage_ref: str) -> None:
        """Elimina un archivo a partir de referencia interna o URL legacy (best-effort)."""
        try:
            bucket, object_path = self.resolve_storage_ref(storage_ref)
        except ValidacionError:
            return
        await self.eliminar_archivo(bucket, object_path)

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
