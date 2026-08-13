"""
Desactiva solo duplicados junk (vanguard-*, nomadic-*, test-*).
NO desactiva productos válidos creados en admin aunque no estén en el seed.

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

JUNK_PREFIXES = ("vanguard-", "nomadic-", "test-")

DUPLICATE_RULES = [
    (
        "acc-cruise-control",
        "SELECT 1 FROM productos WHERE slug IN ('cruise-control', 'acc-cruise-control') AND activo = true AND slug != %s LIMIT 1",
    ),
    (
        "vanguard-cruise-control",
        "SELECT 1 FROM productos WHERE slug = 'cruise-control' AND activo = true LIMIT 1",
    ),
    (
        "camel-back-for-pilot-hydration",
        "SELECT 1 FROM productos WHERE slug = 'acc-camel-back' AND activo = true LIMIT 1",
    ),
]


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
        print(f"Nota: no se pudo limpiar Redis ({exc}).")


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
        SELECT p.id, p.slug, p.nombre, p.categoria, p.activo
        FROM productos p
        WHERE p.categoria IN ('repuestos', 'accesorios')
        ORDER BY p.categoria, p.nombre
        """
    )
    rows = cur.fetchall()

    to_deactivate: list[tuple] = []

    for pid, slug, nombre, categoria, activo in rows:
        slug = slug or ""
        reason = None

        if any(slug.startswith(prefix) for prefix in JUNK_PREFIXES):
            reason = "prefijo legacy junk"

        if not reason:
            for duplicate_slug, exists_sql in DUPLICATE_RULES:
                if slug == duplicate_slug:
                    cur.execute(exists_sql, (duplicate_slug,))
                    if cur.fetchone():
                        reason = "duplicado"

        if reason and activo:
            to_deactivate.append((slug, nombre, reason))
            if not args.dry_run:
                cur.execute("UPDATE productos SET activo = false WHERE id = %s", (pid,))

    print("=== Desactivados (solo junk/duplicados) ===")
    if not to_deactivate:
        print("  Nada que desactivar.")
    for slug, nombre, reason in to_deactivate:
        print(f"  ✗ {slug:42} {nombre}  [{reason}]")

    if args.dry_run:
        print("\n(dry-run: no se guardaron cambios)")
        conn.rollback()
    else:
        conn.commit()
        _clear_product_cache()
        print(f"\nListo: {len(to_deactivate)} desactivados.")

    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
