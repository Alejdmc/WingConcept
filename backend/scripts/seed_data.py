"""Inserta o actualiza el catálogo alineado con la app (Vanguard, Nomadic, accesorios)."""
import os
import sys
import uuid
from urllib.parse import urlparse

import psycopg2
from dotenv import load_dotenv

load_dotenv()

# ── IDs fijos (deben coincidir con frontend/lib/products.js) ─────────────────
IPRO_ID = "b2c3d4e5-f6a7-4890-b123-456789abcdef"
VANGUARD_ID = "c1a2b3d4-e5f6-7890-1234-567890abcdef"
NOMADIC_ID = "d1e2f3a4-b5c6-7890-1234-567890abcdef"
VANGUARD_VARIANT_ID = "c1a2b3d4-e5f6-7890-abcd-ef1234567890"
NOMADIC_VARIANT_ID = "d1e2f3a4-b5c6-7890-abcd-ef1234567890"

NAMESPACE = uuid.UUID("a1b2c3d4-e5f6-7890-abcd-ef1234567890")


def _pid(slug: str) -> str:
    return str(uuid.uuid5(NAMESPACE, slug))


def _vid(slug: str) -> str:
    return str(uuid.uuid5(NAMESPACE, f"variant-{slug}"))


VANGUARD_ACCESSORIES = [
    ("front-guard", "Front Guard", 150, 12),
    ("sun-shade", "Sun Shade", 90, 15),
    ("cruise-control", "Cruise Control", 250, 8),
    ("ballistic-parachute", "Ballistic Parachute", 1200, 5),
    ("lights", "Lights", 200, 20),
    ("phone-holder", "Phone Holder", 45, 30),
    ("cover", "Cover", 120, 18),
]

NOMADIC_ACCESSORIES = [
    ("prop-guard", "Propeller Guard", 280, 10),
    ("cage-hoop", "Clear Cage Hoop", 150, 14),
    ("lateral-bag", "Expedition Side Bag", 220, 8),
    ("passenger-pad", "Passenger Pads", 95, 16),
    ("nomadic-cover", "Protective Cover", 180, 12),
    ("front-handle", "Front Handling Grip", 60, 25),
]


def _sync_db_url() -> str:
    raw = os.environ.get("DATABASE_URL", "")
    if not raw:
        print("ERROR: DATABASE_URL no configurado en .env")
        sys.exit(1)
    return (
        raw.replace("postgresql+asyncpg://", "postgresql://")
        .replace("postgres://", "postgresql://")
    )


def _upsert_producto(cur, pid, nombre, slug, descripcion, descripcion_corta, categoria, subcategoria, imagenes, orden, destacado=True):
    cur.execute(
        """
        INSERT INTO productos (id, nombre, slug, descripcion, descripcion_corta, categoria, subcategoria, imagenes, activo, destacado, orden_display, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, true, %s, %s, NOW(), NOW())
        ON CONFLICT (slug) DO UPDATE SET
            nombre = EXCLUDED.nombre,
            descripcion = EXCLUDED.descripcion,
            descripcion_corta = EXCLUDED.descripcion_corta,
            categoria = EXCLUDED.categoria,
            subcategoria = EXCLUDED.subcategoria,
            imagenes = EXCLUDED.imagenes,
            activo = true,
            destacado = EXCLUDED.destacado,
            orden_display = EXCLUDED.orden_display,
            updated_at = NOW()
        """,
        (pid, nombre, slug, descripcion, descripcion_corta, categoria, subcategoria, imagenes, destacado, orden),
    )
    cur.execute("SELECT id FROM productos WHERE slug = %s", (slug,))
    row = cur.fetchone()
    return str(row[0]) if row else pid


def _upsert_variante(cur, vid, producto_id, nombre, sku, precio, stock, atributos=None, es_principal=True):
    cur.execute(
        """
        INSERT INTO variantes (id, producto_id, nombre, sku, precio, stock, stock_minimo, atributos, activo, es_principal, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, 1, %s::jsonb, true, %s, NOW(), NOW())
        ON CONFLICT (sku) DO UPDATE SET
            producto_id = EXCLUDED.producto_id,
            nombre = EXCLUDED.nombre,
            precio = EXCLUDED.precio,
            stock = EXCLUDED.stock,
            atributos = EXCLUDED.atributos,
            activo = true,
            es_principal = EXCLUDED.es_principal,
            updated_at = NOW()
        """,
        (vid, producto_id, nombre, sku, precio, stock, atributos or "{}", es_principal),
    )


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

    # Desactivar productos que aún no están en catálogo
    cur.execute("UPDATE productos SET activo = false, destacado = false WHERE slug = 'paramotor-trike'")
    cur.execute("UPDATE productos SET activo = false, destacado = false WHERE slug = 'disruptor'")

    # ── Paramotors ────────────────────────────────────────────────────
    # Disruptor: omitido — producto aún no disponible
    ipro_id = _upsert_producto(
        cur, IPRO_ID, "I-Pro", "i-pro",
        "El I-Pro redefine lo que significa volar ligero.",
        "Next-gen lightweight design", "paramotor", "lightweight",
        ["/images/ipro_ejemplo.PNG"], 2,
    )
    _upsert_variante(cur, _vid("ipro-standard"), ipro_id, "I-Pro Standard", "IPRO-STD-001", 5950.00, 3,
                     '{"motor": "Vittorazi Moster 185 Plus", "peso_kg": 26, "empuje_kg": 90}')

    # ── Paratrike — Vanguard V8.0 ─────────────────────────────────────
    vanguard_id = _upsert_producto(
        cur, VANGUARD_ID, "Vanguard V8.0", "vanguard-v8",
        "High-performance trike developed with pilots and engineers. Benchmark in adventure flying.",
        "The benchmark in high-performance trikes", "paratrike", "vanguard",
        ["/images/1vanguard.png"], 10, True,
    )
    _upsert_variante(
        cur, VANGUARD_VARIANT_ID, vanguard_id, "Vanguard Chassis Base", "VANG-BASE-001",
        5950.00, 6, '{"peso_kg": 38, "empuje_kg": 112}', True,
    )

    # ── Paratrike — Nomadic Trike ─────────────────────────────────────
    nomadic_id = _upsert_producto(
        cur, NOMADIC_ID, "Nomadic Trike", "nomadic-trike",
        "Ultimate off-grid adventure machine. Stainless steel chassis built for expedition flying.",
        "The Ultimate Off-Grid Adventure Machine", "paratrike", "nomadic",
        ["/images/nomadic1.png"], 11, True,
    )
    _upsert_variante(
        cur, NOMADIC_VARIANT_ID, nomadic_id, "Nomadic Chassis Base", "NOM-BASE-001",
        8950.00, 4, '{"peso_kg": 42, "empuje_kg": 110}', True,
    )

    # ── Accesorios Vanguard ───────────────────────────────────────────
    for i, (acc_id, nombre, precio, stock) in enumerate(VANGUARD_ACCESSORIES, start=1):
        slug = f"vanguard-{acc_id}"
        pid = _pid(slug)
        producto_id = _upsert_producto(
            cur, pid, nombre, slug,
            f"Accesorio opcional para Vanguard V8.0 — {nombre}.",
            f"Vanguard accessory — {nombre}", "accesorios", "vanguard",
            None, 20 + i, False,
        )
        _upsert_variante(cur, _vid(slug), producto_id, nombre, f"VANG-ACC-{acc_id.upper()}", precio, stock, es_principal=True)

    # ── Accesorios Nomadic ────────────────────────────────────────────
    for i, (acc_id, nombre, precio, stock) in enumerate(NOMADIC_ACCESSORIES, start=1):
        slug = f"nomadic-{acc_id}"
        pid = _pid(slug)
        producto_id = _upsert_producto(
            cur, pid, nombre, slug,
            f"Accesorio opcional para Nomadic Trike — {nombre}.",
            f"Nomadic accessory — {nombre}", "accesorios", "nomadic",
            None, 30 + i, False,
        )
        _upsert_variante(cur, _vid(slug), producto_id, nombre, f"NOM-ACC-{acc_id.upper()}", precio, stock, es_principal=True)

    conn.commit()
    cur.close()
    conn.close()
    print("Seed completado: I-Pro, Vanguard, Nomadic + 13 accesorios")
    print(f"  Vanguard ID: {vanguard_id}")
    print(f"  Nomadic ID:  {nomadic_id}")


if __name__ == "__main__":
    main()
