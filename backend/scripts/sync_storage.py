"""
Sube imágenes de frontend/public/images a Supabase Storage y actualiza URLs en PostgreSQL.

Uso:
    cd backend
    python scripts/sync_storage.py

Requiere en .env: SUPABASE_URL, SUPABASE_SERVICE_KEY, DATABASE_URL
"""
from __future__ import annotations

import mimetypes
import os
import sys
from pathlib import Path
from urllib.parse import urlparse

import httpx
import psycopg2
from dotenv import load_dotenv

load_dotenv()

ROOT = Path(__file__).resolve().parents[2]
IMAGES_DIR = ROOT / "frontend" / "public" / "images"

# slug → archivos locales en frontend/public/images
PRODUCT_IMAGES_BY_SLUG: dict[str, list[str]] = {
    "disruptor": ["disruptor_ejemplo.PNG"],
    "i-pro": ["ipro_ejemplo.PNG"],
    "vanguard-v8": [f"{i}vanguard.png" for i in range(1, 11)],
    "nomadic-trike": ["nomadic1.png"],
}

# Archivo local si nomadic1.png no existe en public/images
IMAGE_FALLBACKS: dict[str, str] = {
    "nomadic1.png": "paramotor_trike_ejemplo.PNG",
}

MIME_OVERRIDES = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
}


def _sync_db_url() -> str:
    raw = os.environ.get("DATABASE_URL", "")
    if not raw:
        print("ERROR: DATABASE_URL no configurado en .env")
        sys.exit(1)
    return (
        raw.replace("postgresql+asyncpg://", "postgresql://")
        .replace("postgres://", "postgresql://")
    )


def _mime_for(path: Path) -> str:
    ext = path.suffix.lower()
    if ext in MIME_OVERRIDES:
        return MIME_OVERRIDES[ext]
    guessed, _ = mimetypes.guess_type(str(path))
    return guessed or "application/octet-stream"


def _resolve_local(filename: str) -> Path | None:
    direct = IMAGES_DIR / filename
    if direct.is_file():
        return direct
    fallback = IMAGE_FALLBACKS.get(filename)
    if fallback:
        alt = IMAGES_DIR / fallback
        if alt.is_file():
            print(f"  ↳ {filename} no existe — usando {fallback}")
            return alt
    return None


class SupabaseStorageSync:
    def __init__(self) -> None:
        self.base_url = os.environ.get("SUPABASE_URL", "").rstrip("/")
        self.service_key = os.environ.get("SUPABASE_SERVICE_KEY", "")
        self.bucket_productos = os.environ.get("SUPABASE_BUCKET_PRODUCTOS", "productos")
        if not self.base_url or not self.service_key:
            print("ERROR: SUPABASE_URL y SUPABASE_SERVICE_KEY son requeridos en .env")
            sys.exit(1)

    def public_url(self, object_path: str) -> str:
        return f"{self.base_url}/storage/v1/object/public/{self.bucket_productos}/{object_path}"

    def upload(self, object_path: str, content: bytes, content_type: str) -> str:
        url = f"{self.base_url}/storage/v1/object/{self.bucket_productos}/{object_path}"
        headers = {
            "Authorization": f"Bearer {self.service_key}",
            "Content-Type": content_type,
            "x-upsert": "true",
        }
        with httpx.Client(timeout=60.0) as client:
            response = client.post(url, content=content, headers=headers)
            if response.status_code not in (200, 201):
                raise RuntimeError(
                    f"Error subiendo {object_path} (HTTP {response.status_code}): "
                    f"{response.text[:300]}"
                )
        public = self.public_url(object_path)
        print(f"  ✓ {object_path}")
        return public


def sync_products(storage: SupabaseStorageSync, cur) -> None:
    print("\n── Productos ──")
    for slug, filenames in PRODUCT_IMAGES_BY_SLUG.items():
        cur.execute(
            "SELECT id, nombre FROM productos WHERE slug = %s AND activo = true",
            (slug,),
        )
        row = cur.fetchone()
        if not row:
            print(f"  ✗ {slug} — producto no encontrado en BD, omitido")
            continue
        producto_id, nombre = str(row[0]), row[1]
        urls: list[str] = []
        for filename in filenames:
            local = _resolve_local(filename)
            if not local:
                print(f"  ✗ {filename} — archivo no encontrado, omitido")
                continue
            object_path = f"productos/{producto_id}/{filename}"
            url = storage.upload(object_path, local.read_bytes(), _mime_for(local))
            urls.append(url)
        if urls:
            cur.execute(
                "UPDATE productos SET imagenes = %s, updated_at = NOW() WHERE id = %s",
                (urls, producto_id),
            )
            print(f"  → {nombre} ({slug}): {len(urls)} imagen(es)")


def sync_contenidos(storage: SupabaseStorageSync, cur) -> None:
    print("\n── Contenidos CMS ──")
    cur.execute(
        """
        SELECT id, slug, imagen FROM contenidos
        WHERE imagen IS NOT NULL AND imagen LIKE '/images/%'
        """
    )
    rows = cur.fetchall()
    for contenido_id, slug, imagen in rows:
        filename = imagen.replace("/images/", "")
        local = _resolve_local(filename)
        if not local:
            print(f"  ✗ {slug}: {filename} no encontrado")
            continue
        object_path = f"contenidos/{slug}/{filename}"
        url = storage.upload(object_path, local.read_bytes(), _mime_for(local))
        cur.execute(
            "UPDATE contenidos SET imagen = %s, updated_at = NOW() WHERE id = %s",
            (url, contenido_id),
        )
        print(f"  → {slug}")


def sync_assets(storage: SupabaseStorageSync) -> None:
    """Logo y assets de marca usados en emails (opcional en bucket)."""
    print("\n── Assets de marca ──")
    for filename in ("logo.png",):
        local = IMAGES_DIR / filename
        if not local.is_file():
            print(f"  ✗ {filename} no encontrado")
            continue
        storage.upload(f"assets/{filename}", local.read_bytes(), _mime_for(local))


def main() -> None:
    if not IMAGES_DIR.is_dir():
        print(f"ERROR: No existe {IMAGES_DIR}")
        sys.exit(1)

    storage = SupabaseStorageSync()
    db_url = _sync_db_url()
    parsed = urlparse(db_url)
    conn = psycopg2.connect(
        dbname=parsed.path.lstrip("/"),
        user=parsed.username,
        password=parsed.password,
        host=parsed.hostname,
        port=parsed.port or 5432,
    )
    cur = conn.cursor()

    print(f"Supabase: {storage.base_url}")
    print(f"Bucket:   {storage.bucket_productos}")
    print(f"Origen:   {IMAGES_DIR}")

    sync_products(storage, cur)
    sync_contenidos(storage, cur)
    sync_assets(storage)

    conn.commit()
    cur.close()
    conn.close()
    print("\nSync completado.")


if __name__ == "__main__":
    main()
