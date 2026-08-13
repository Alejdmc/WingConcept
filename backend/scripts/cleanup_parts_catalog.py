"""
Desactiva partes/accesorios duplicados o fuera del catálogo oficial de /parts.

Mantiene activos:
  - repuestos con slug part-* (seed_parts_catalog.py)
  - accesorios con slug acc-* (seed)
  - aliases legacy sin prefijo (rear-mirror, cruise-control, etc.)

Desactiva:
  - vanguard-*, nomadic-* (catálogo viejo / pruebas)
  - test-*, slugs sueltos duplicados

Uso:
  cd backend && python3 scripts/cleanup_parts_catalog.py
  cd backend && python3 scripts/cleanup_parts_catalog.py --dry-run
"""
from __future__ import annotations

import argparse
import os
import sys
from urllib.parse import urlparse

import psycopg2
from dotenv import load_dotenv

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from app.data.parts_catalog import (  # noqa: E402
    CANONICAL_ACCESSORY_SLUGS,
    CANONICAL_PART_SLUGS,
    LEGACY_ACCESSORY_ALIASES,
    LEGACY_PART_ALIASES,
)

KEEP_PARTS = CANONICAL_PART_SLUGS | LEGACY_PART_ALIASES
KEEP_ACCESSORIES = CANONICAL_ACCESSORY_SLUGS | LEGACY_ACCESSORY_ALIASES

JUNK_PREFIXES = ("vanguard-", "nomadic-", "test-")


def _clear_product_cache() -> None:
    try:
        import redis
        r = redis.Redis(
            host=os.environ.get("REDIS_HOST", "localhost"),
            port=int(os.environ.get("REDIS_PORT", 6379)),
            db=int(os.environ.get("REDIS_DB", 0)),
            password=os.environ.get("REDIS_PASSWORD") or None,
        )
        keys = list(r.scan_iter("productos:*"))
        if keys:
            r.delete(*keys)
            print(f"Caché Redis limpiada ({len(keys)} claves).")
    except Exception as exc:
        print(f"Nota: no se pudo limpiar Redis ({exc}). Refresca /parts en unos minutos.")


def _sync_db_url() -> str:
    load_dotenv()
    url = os.environ.get("DATABASE_URL", "")
    if not url:
        sys.exit("DATABASE_URL no configurado")
    return url.replace("postgresql+asyncpg://", "postgresql://").replace("postgres://", "postgresql://")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Solo mostrar cambios")
    args = parser.parse_args()

    parsed = urlparse(_sync_db_url())
    conn = psycopg2.connect(
        dbname=parsed.path.lstrip("/"),
        user=parsed.username,
        password=parsed.password,
        host=parsed.hostname,
        port=parsed.port or 5432,
    )
    cur = conn.cursor()

    cur.execute(
        """
        SELECT p.id, p.slug, p.nombre, p.categoria, p.activo, v.precio
        FROM productos p
        LEFT JOIN variantes v ON v.producto_id = p.id AND v.es_principal = true
        WHERE p.categoria IN ('repuestos', 'accesorios')
        ORDER BY p.categoria, p.nombre
        """
    )
    rows = cur.fetchall()

    to_deactivate: list[tuple] = []
    kept: list[tuple] = []

    for pid, slug, nombre, categoria, activo, precio in rows:
        slug = slug or ""
        keep = False
        if categoria == "repuestos" and slug in KEEP_PARTS:
            keep = True
        elif categoria == "accesorios" and slug in KEEP_ACCESSORIES:
            keep = True

        if keep:
            kept.append((slug, nombre, precio, activo))
            if not activo and not args.dry_run:
                cur.execute("UPDATE productos SET activo = true WHERE id = %s", (pid,))
            continue

        reason = "fuera de catálogo"
        if any(slug.startswith(p) for p in JUNK_PREFIXES):
            reason = "prefijo junk"
        to_deactivate.append((slug, nombre, precio, reason, activo))
        if activo and not args.dry_run:
            cur.execute("UPDATE productos SET activo = false WHERE id = %s", (pid,))

    print("=== Se mantienen activos ===")
    for slug, nombre, precio, activo in kept:
        flag = "" if activo else " (reactivado)"
        print(f"  ✓ {precio or '—':>8}  {slug:42} {nombre}{flag}")

    print("\n=== Se desactivan ===")
    for slug, nombre, precio, reason, activo in to_deactivate:
        if not activo:
            print(f"  · ya inactivo  {slug:42} {nombre}")
        else:
            print(f"  ✗ {precio or '—':>8}  {slug:42} {nombre}  [{reason}]")

    if args.dry_run:
        print("\n(dry-run: no se guardaron cambios)")
        conn.rollback()
    else:
        cur.execute(
            """
            UPDATE productos SET activo = false
            WHERE categoria = 'accesorios'
              AND slug IN ('acc-cruise-control', 'vanguard-cruise-control')
              AND EXISTS (SELECT 1 FROM productos WHERE slug = 'cruise-control' AND activo = true)
            """
        )
        cur.execute(
            """
            UPDATE productos SET activo = false
            WHERE slug = 'camel-back-for-pilot-hydration'
              AND EXISTS (SELECT 1 FROM productos WHERE slug = 'acc-camel-back')
            """
        )
        conn.commit()
        _clear_product_cache()
        print(f"\nListo: {sum(1 for *_, a in to_deactivate if a)} desactivados (+ duplicados cruise/camel-back).")

    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
