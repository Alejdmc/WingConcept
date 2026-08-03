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
from urllib.parse import urlparse

import psycopg2
from dotenv import load_dotenv

load_dotenv()

NAMESPACE = uuid.UUID("a1b2c3d4-e5f6-7890-abcd-ef1234567890")
DEFAULT_STOCK = 10
DEFAULT_STOCK_MINIMO = 2
STOCK_RESET = os.environ.get("STOCK_RESET", "1") == "1"

PARTS = [
    ("front-axle", "Front Axle", 75, ["vanguard", "nomadic"], "/images/parts/front-axle.png",
     "Easy-to-assemble aluminum front axle engineered specifically for 20mm bearings."),
    ("front-fork", "Front Fork", 280, ["vanguard", "nomadic"], "/images/parts/front-fork.png",
     "Reinforced front fork assembly weighted for ideal stability."),
    ("front-bar-protection", "Protection with Front Bar Handle", 80, ["vanguard", "nomadic"],
     "/images/parts/front-bar-protection.png", "Structural front protection bar and handgrip."),
    ("parachute-container", "Parachute Container", 55, ["vanguard", "nomadic"],
     "/images/parts/parachute-container.png", "Emergency parachute container for quick mounting."),
    ("pilot-harness", "Pilot Harness", 190, ["vanguard", "nomadic"], "/images/parts/pilot-harness.png",
     "Hanging-style seat harness with passive safety protection."),
    ("passenger-harness", "Passenger Harness", 220, ["vanguard", "nomadic"],
     "/images/parts/passenger-harness.png", "Passenger seat with foam cushion and instrument holder."),
    ("pilot-dynamic-cage", "Pilot Dynamic Cage", 300, ["vanguard"], "/images/parts/pilot-dynamic-cage.png",
     "Aerodynamic engine cage for distance-focused exploration."),
    ("pilot-hunter-cage", "Pilot Hunter Cage", 300, ["vanguard"], "/images/parts/pilot-hunter-cage.png",
     "Heavy-duty utility cage for tactical or media operations."),
    ("back-axle", "Back Axle No Suspension", 95, ["nomadic"], "/images/parts/back-axle.png",
     "Rear axle for Nomadic without integrated suspension."),
    ("rock-guard", "Nomadic Rock Guard", 95, ["nomadic"], "/images/parts/rock-guard.png",
     "Guard to protect the lower trike body from rocks and debris."),
]

ACCESSORIES = [
    ("cruise-control", "Cruise Control", 20, ["vanguard", "nomadic"], "/images/accessories/cruise-control.jpg",
     "Mechanical throttle lock in an ergonomic position."),
    ("camel-back", "Camel Back for Pilot Hydration", 25, ["vanguard", "nomadic"],
     "/images/accessories/camel-back.jpg", "Hydration bladder for long-endurance flights."),
    ("sun-roof-netting", "Sun-Roof Netting", 30, ["vanguard", "nomadic"],
     "/images/parts/sun-roof-netting.png", "Lightweight mesh sun canopy."),
    ("cockpit-liner", "Passenger & Pilot Cockpit Protective Liner", 105, ["vanguard", "nomadic"],
     "/images/parts/cockpit-liner.png", "Protective travel cover for the cockpit area."),
    ("lateral-bag", "Lateral Bag for Vanguard", 90, ["vanguard"], "/images/accessories/lateral-bag.jpg",
     "Side storage bag tailored for the Vanguard frame."),
    ("instrument-kit-vanguard", "Basic Instrument Kit (Vanguard)", 440, ["vanguard"],
     "/images/parts/instrument-kit-vanguard.png", "USB charger, fuel gauge and TTO digital sensors."),
    ("lateral-bag-explorer", "Lateral Bag Explorer", 85, ["nomadic"],
     "/images/parts/lateral-bag-explorer.png", "Side-mounted bag for exploration flights."),
    ("bottom-explorer-bag", "Bottom Explorer Bag", 124.80, ["nomadic"],
     "/images/parts/bottom-explorer-bag.png", "Bottom-mounted adventure bag for long expeditions."),
    ("instrument-kit-nomadic", "Basic Instrument Kit (Nomadic)", 350, ["nomadic"],
     "/images/parts/instrument-kit-nomadic.png", "USB charger and TTO digital sensors."),
    # ballistic-parachute: price on request — omitido del carrito
]


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


def _upsert_producto(cur, pid, nombre, slug, descripcion, categoria, imagenes, orden):
    cur.execute(
        """
        INSERT INTO productos (id, nombre, slug, descripcion, descripcion_corta, categoria, imagenes, activo, destacado, orden_display, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, true, false, %s, NOW(), NOW())
        ON CONFLICT (slug) DO UPDATE SET
            nombre = EXCLUDED.nombre,
            descripcion = EXCLUDED.descripcion,
            descripcion_corta = EXCLUDED.descripcion_corta,
            categoria = EXCLUDED.categoria,
            imagenes = EXCLUDED.imagenes,
            activo = true,
            orden_display = EXCLUDED.orden_display,
            updated_at = NOW()
        RETURNING id
        """,
        (pid, nombre, slug, descripcion, descripcion[:500] if descripcion else None, categoria, imagenes, orden),
    )
    return str(cur.fetchone()[0])


def _upsert_variante(cur, vid, producto_id, nombre, sku, precio, stock, stock_minimo, compatible_with):
    atributos = json.dumps({"compatible_with": compatible_with})
    stock_clause = "stock = EXCLUDED.stock," if STOCK_RESET else ""
    cur.execute(
        f"""
        INSERT INTO variantes (id, producto_id, nombre, sku, precio, stock, stock_minimo, atributos, activo, es_principal, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb, true, true, NOW(), NOW())
        ON CONFLICT (sku) DO UPDATE SET
            producto_id = EXCLUDED.producto_id,
            nombre = EXCLUDED.nombre,
            precio = EXCLUDED.precio,
            {stock_clause}
            stock_minimo = EXCLUDED.stock_minimo,
            atributos = EXCLUDED.atributos,
            activo = true,
            es_principal = true,
            updated_at = NOW()
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
