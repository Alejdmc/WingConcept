"""
Inserta el catálogo de /paragliders (velas + arneses) con stock inicial 10.

Uso:
  cd backend && python3 scripts/seed_paragliders_catalog.py
  cd backend && python3 -m scripts.seed_paragliders_catalog

Re-ejecutar es idempotente (upsert por slug/SKU).
"""
from __future__ import annotations

import json
import os
import sys
import uuid
from typing import Optional
from urllib.parse import urlparse

import psycopg2
from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from scripts.bootstrap import invalidate_product_cache  # noqa: E402

from app.data.paragliders_catalog import (  # noqa: E402
    DEFAULT_STOCK,
    DEFAULT_STOCK_MINIMO,
    HARNESSES,
    WINGS,
)

load_dotenv()
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
    cur.execute("SELECT id FROM productos WHERE slug = %s", (slug,))
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


def _upsert_variante(cur, vid, producto_id, nombre, sku, precio, stock_minimo):
    atributos = json.dumps({"standalone_paraglider": True})
    existing_id = _find_variante_id(cur, sku, vid)

    if existing_id:
        cur.execute(
            """
            UPDATE variantes SET
                producto_id = %s,
                nombre = %s,
                precio = %s,
                stock = %s,
                stock_minimo = %s,
                atributos = %s::jsonb,
                activo = true,
                es_principal = true,
                updated_at = NOW()
            WHERE id = %s
            """,
            (producto_id, nombre, precio, DEFAULT_STOCK, stock_minimo, atributos, existing_id),
        )
        return

    cur.execute(
        """
        INSERT INTO variantes (id, producto_id, nombre, sku, precio, stock, stock_minimo, atributos, activo, es_principal, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb, true, true, NOW(), NOW())
        """,
        (vid, producto_id, nombre, sku, precio, DEFAULT_STOCK, stock_minimo, atributos),
    )


def _seed_wings(cur, start_order: int = 300) -> int:
    created = 0
    for i, (wing_id, nombre, precio, imagen, descripcion) in enumerate(WINGS, start=1):
        slug = f"vela-{wing_id}"
        sku = f"VELA_{wing_id.upper().replace('-', '_')}"
        pid = _pid(slug)
        vid = _vid(slug)
        producto_id = _upsert_producto(
            cur, pid, nombre, slug, descripcion, "vela", [imagen], start_order + i,
        )
        _upsert_variante(cur, vid, producto_id, "Standard", sku, precio, DEFAULT_STOCK_MINIMO)
        created += 1
        print(f"  ✓ {nombre} → stock {DEFAULT_STOCK} (id {producto_id[:8]}…)")
    return created


def _seed_harnesses(cur, start_order: int = 400) -> int:
    created = 0
    for i, (item_id, nombre, precio, imagen, descripcion) in enumerate(HARNESSES, start=1):
        slug = f"pgl-harness-{item_id}"
        sku = f"PGL_HARNESS_{item_id.upper().replace('-', '_')}"
        pid = _pid(slug)
        vid = _vid(slug)
        producto_id = _upsert_producto(
            cur, pid, nombre, slug, descripcion, "accesorios", [imagen], start_order + i,
        )
        _upsert_variante(cur, vid, producto_id, "Standard", sku, precio, DEFAULT_STOCK_MINIMO)
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

    print(f"Seed paragliders catalog (stock={DEFAULT_STOCK}, min={DEFAULT_STOCK_MINIMO})")
    print("— Velas —")
    n_wings = _seed_wings(cur)
    print("— Arneses —")
    n_harnesses = _seed_harnesses(cur)

    conn.commit()
    cur.close()
    conn.close()
    invalidate_product_cache(quiet=True)
    print(f"\nCompletado: {n_wings} velas + {n_harnesses} arneses = {n_wings + n_harnesses} ítems en carrito")


if __name__ == "__main__":
    main()
