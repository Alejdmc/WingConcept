"""Inserta productos Disruptor Paramotor y Trike Disruptor (IDs fijos)."""
import os
import sys

import psycopg2
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

DISRUPTOR_PARAMOTOR_ID = "e1f2a3b4-c5d6-7890-1234-567890abcdef"
DISRUPTOR_TRIKE_ID = "f1e2a3b4-c5d6-7890-1234-567890abcdef"
DISRUPTOR_PM_VARIANT = "e1f2a3b4-c5d6-7890-abcd-ef1234567890"
DISRUPTOR_TRIKE_VARIANT = "f1e2a3b4-c5d6-7890-abcd-ef1234567891"


def main() -> None:
    raw = os.environ.get("DATABASE_URL", "").replace("postgresql+asyncpg://", "postgresql://")
    p = urlparse(raw)
    conn = psycopg2.connect(
        dbname=p.path.lstrip("/"), user=p.username, password=p.password,
        host=p.hostname, port=p.port or 5432,
    )
    cur = conn.cursor()
    rows = [
        (DISRUPTOR_PARAMOTOR_ID, DISRUPTOR_PM_VARIANT, "Disruptor Paramotor", "disruptor-paramotor",
         "paramotor", 2800.0, 1, "DISR-PM-BASE",
         [f"/images/disruptor/paramotor-{i}.jpg" for i in range(1, 5)]),
        (DISRUPTOR_TRIKE_ID, DISRUPTOR_TRIKE_VARIANT, "Trike Disruptor", "disruptor-trike",
         "paratrike", 2500.0, 12, "DISR-TRIKE-BASE",
         [f"/images/disruptor/trike-{i}.jpg" for i in range(1, 5)]),
    ]
    for pid, vid, nombre, slug, cat, precio, orden, sku, imgs in rows:
        is_featured = slug == "disruptor-paramotor"
        cur.execute(
            """
            INSERT INTO productos (id, nombre, slug, descripcion, descripcion_corta, categoria, subcategoria,
                imagenes, activo, destacado, orden_display, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, 'disruptor', %s, true, %s, %s, NOW(), NOW())
            ON CONFLICT (slug) DO UPDATE SET
                id = EXCLUDED.id, nombre = EXCLUDED.nombre, categoria = EXCLUDED.categoria,
                imagenes = EXCLUDED.imagenes, activo = true,
                destacado = EXCLUDED.destacado, updated_at = NOW()
            """,
            (pid, nombre, slug, f"{nombre} — Wing Concept", nombre, cat, imgs, is_featured, orden),
        )
        cur.execute(
            """
            INSERT INTO variantes (id, producto_id, nombre, sku, precio, stock, stock_minimo, atributos,
                activo, es_principal, created_at, updated_at)
            VALUES (%s, %s, 'Standard', %s, %s, 10, 2, '{}'::jsonb, true, true, NOW(), NOW())
            ON CONFLICT (sku) DO UPDATE SET
                producto_id = EXCLUDED.producto_id, precio = EXCLUDED.precio, activo = true, updated_at = NOW()
            """,
            (vid, pid, sku, precio),
        )
        print(f"  ✓ {nombre} (${precio:,.0f})")
    conn.commit()
    cur.close()
    conn.close()
    print("Disruptor products seed OK")


if __name__ == "__main__":
    main()
