"""
Inserta el catálogo de /parts (repuestos + accesorios) con stock inicial 10.
Debe coincidir con frontend/lib/parts.js y frontend/lib/accessories.js.

Uso:
  cd backend && python3 scripts/seed_parts_catalog.py

Re-ejecutar es idempotente (upsert por slug/SKU). Solo resetea stock a 10 si
STOCK_RESET=1 en el entorno.
"""
import json
import os
import sys
import uuid
from typing import Optional
from urllib.parse import urlparse

import psycopg2
from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from app.data.parts_catalog import ACCESSORIES, DEFAULT_STOCK, DEFAULT_STOCK_MINIMO, PARTS  # noqa: E402
STOCK_RESET = os.environ.get("STOCK_RESET", "1") == "1"

NAMESPACE = uuid.UUID("a1b2c3d4-e5f6-7890-abcd-ef1234567890")


def _pid(slug: str) -> str:
    return str(uuid.uuid5(NAMESPACE, slug))


def _vid(slug: str) -> str:
    return str(uuid.uuid5(NAMESPACE, f"variant-{slug}"))


def _sync_db_url() -> str:
    raw = os.environ.get("DATABASE_URL", "")
    if not raw:
        print("ERROR: DATABASE_URL no configurado en .env")
        sys.exit(1)
    return raw.replace("postgresql+asyncpg://", "postgresql://").replace("postgres://", "postgresql://")


def _find_producto_id(cur, slug: str, pid: str) -> Optional[str]:
    """Resolve existing producto row by canonical slug, legacy alias, or deterministic id."""
    cur.execute("SELECT id FROM productos WHERE slug = %s", (slug,))
    row = cur.fetchone()
    if row:
        return str(row[0])

    if slug.startswith("part-"):
        bare = slug[5:]
        cur.execute("SELECT id FROM productos WHERE slug = %s", (bare,))
        row = cur.fetchone()
        if row:
            return str(row[0])

    if slug.startswith("acc-"):
        bare = slug[4:]
        for candidate in (bare, f"vanguard-{bare}", f"nomadic-{bare}"):
            cur.execute("SELECT id FROM productos WHERE slug = %s", (candidate,))
            row = cur.fetchone()
            if row:
                return str(row[0])

    cur.execute("SELECT id FROM productos WHERE id = %s", (pid,))
    row = cur.fetchone()
    if row:
        return str(row[0])

    return None


def _upsert_producto(cur, pid, nombre, slug, descripcion, categoria, imagenes, orden):
    descripcion_corta = descripcion[:500] if descripcion else None
    existing_id = _find_producto_id(cur, slug, pid)

    if existing_id:
        cur.execute(
            """
            UPDATE productos SET
                slug = %s,
                nombre = %s,
                descripcion = %s,
                descripcion_corta = %s,
                categoria = %s,
                imagenes = %s,
                activo = true,
                orden_display = %s,
                updated_at = NOW()
            WHERE id = %s
            """,
            (slug, nombre, descripcion, descripcion_corta, categoria, imagenes, orden, existing_id),
        )
        return existing_id

    cur.execute(
        """
        INSERT INTO productos (id, nombre, slug, descripcion, descripcion_corta, categoria, imagenes, activo, destacado, orden_display, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, true, false, %s, NOW(), NOW())
        """,
        (pid, nombre, slug, descripcion, descripcion_corta, categoria, imagenes, orden),
    )
    return pid


def _find_variante_id(cur, sku: str, vid: str) -> Optional[str]:
    cur.execute("SELECT id FROM variantes WHERE sku = %s", (sku,))
    row = cur.fetchone()
    if row:
        return str(row[0])
    cur.execute("SELECT id FROM variantes WHERE id = %s", (vid,))
    row = cur.fetchone()
    if row:
        return str(row[0])
    return None


def _upsert_variante(cur, vid, producto_id, nombre, sku, precio, stock, stock_minimo, compatible_with):
    atributos = json.dumps({"compatible_with": compatible_with})
    existing_id = _find_variante_id(cur, sku, vid)
    stock_clause = ", stock = %s" if STOCK_RESET else ""

    if existing_id:
        params = [producto_id, nombre, precio, stock_minimo, atributos, existing_id]
        if STOCK_RESET:
            params = [producto_id, nombre, precio, stock, stock_minimo, atributos, existing_id]
        cur.execute(
            f"""
            UPDATE variantes SET
                producto_id = %s,
                nombre = %s,
                precio = %s{stock_clause},
                stock_minimo = %s,
                atributos = %s::jsonb,
                activo = true,
                es_principal = true,
                updated_at = NOW()
            WHERE id = %s
            """,
            tuple(params),
        )
        return

    cur.execute(
        """
        INSERT INTO variantes (id, producto_id, nombre, sku, precio, stock, stock_minimo, atributos, activo, es_principal, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb, true, true, NOW(), NOW())
        """,
        (vid, producto_id, nombre, sku, precio, stock, stock_minimo, atributos),
    )


def _seed_group(cur, items, categoria, slug_prefix, sku_prefix, start_order):
    created = 0
    for i, (item_id, nombre, precio, compatible, imagen, descripcion) in enumerate(items, start=1):
        slug = f"{slug_prefix}-{item_id}"
        sku = f"{sku_prefix}-{item_id.upper().replace('-', '_')}"
        pid = _pid(slug)
        vid = _vid(slug)
        producto_id = _upsert_producto(
            cur, pid, nombre, slug, descripcion, categoria, [imagen], start_order + i,
        )
        _upsert_variante(
            cur, vid, producto_id, "Standard", sku, precio,
            DEFAULT_STOCK, DEFAULT_STOCK_MINIMO, compatible,
        )
        created += 1
        print(f"  ✓ {nombre} → stock {DEFAULT_STOCK} (id {producto_id[:8]}…)")
    return created


def main() -> None:
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

    print(f"Seed parts catalog (stock={DEFAULT_STOCK}, min={DEFAULT_STOCK_MINIMO}, reset={STOCK_RESET})")
    print("— Repuestos —")
    n_parts = _seed_group(cur, PARTS, "repuestos", "part", "PART", 100)
    print("— Accesorios —")
    n_acc = _seed_group(cur, ACCESSORIES, "accesorios", "acc", "ACC", 200)

    conn.commit()
    cur.close()
    conn.close()
    print(f"\nCompletado: {n_parts} partes + {n_acc} accesorios = {n_parts + n_acc} ítems en carrito")
    print("Tip: STOCK_RESET=0 evita resetear stock en re-ejecuciones.")


if __name__ == "__main__":
    main()
