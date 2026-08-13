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
    ("cruise-control", "Cruise Control", 25, ["vanguard", "nomadic"], "/images/parts/front-bar-protection.png",
     "For long-distance flights — maintains desired RPM for stable, smooth flight."),
    ("camel-back", "Camel Back for Pilot Hydration", 25, ["vanguard", "nomadic"],
     "/images/parts/passenger-harness.png", "Hydration bladder for long-endurance flights."),
    ("sun-roof-netting", "Sun-Roof Netting", 43, ["vanguard", "nomadic"],
     "/images/parts/sun-roof-netting.png", "Protects the pilot from the sun and prevents line tangles."),
    ("front-bar-protection", "Padded Roll Bar Protector with Handles", 47, ["vanguard", "nomadic"],
     "/images/parts/front-bar-protection.png", "Protects the passenger and provides comfortable handles."),
    ("front-brake", "Front Brake", 120, ["vanguard", "nomadic"], "/images/parts/front-fork.png",
     "Additional cable brake providing extra braking power."),
    ("rear-mirror", "Rear Mirror", 25, ["vanguard", "nomadic"], "/images/parts/instrument-kit-vanguard.png",
     "Essential for viewing wing position during takeoff."),
    ("cockpit-liner", "Passenger & Pilot Cockpit Protective Liner", 105, ["vanguard", "nomadic"],
     "/images/parts/cockpit-liner.png", "Protective travel cover for the cockpit area."),
    ("parachute-container", "Parachute Container", 55, ["vanguard", "nomadic"],
     "/images/parts/parachute-container.png", "Container for mounting on either side of the harnesses."),
    ("lateral-bag", "Two Side Explorer Cases (L-R)", 95, ["vanguard"],
     "/images/parts/lateral-bag-explorer.png", "Pair of aerodynamic side cases with extra straps."),
    ("fuel-gauge-vanguard", "Analog Fuel Gauge (Vanguard)", 119, ["vanguard"],
     "/images/parts/instrument-kit-vanguard.png", "Analog fuel gauge for the Vanguard L-shaped tank."),
    ("auxiliary-lights", "Auxiliary Lights Kit", 187.10, ["vanguard"],
     "/images/parts/instrument-kit-vanguard.png", "LED lights, position indicators, switch and wiring."),
    ("instrument-kit-vanguard", "Basic Instrument Kit (Vanguard)", 340, ["vanguard"],
     "/images/parts/instrument-kit-vanguard.png", "TTO digital gauges and 4-port USB charger."),
    ("electrical-kit", "Complete Electrical Installation Kit", 218.20, ["vanguard", "nomadic"],
     "/images/parts/instrument-kit-vanguard.png", "Full wiring harness for the selected engine."),
    ("carabiners", "Two Carabiners", 90, ["vanguard", "nomadic"], "/images/parts/front-axle.png",
     "High-capacity steel carabiners (2.4 kN each)."),
    ("propeller-guard", "External Propeller Guard", 295, ["vanguard"],
     "/images/parts/pilot-dynamic-cage.png", "Prevents wing or lines from entering the propeller."),
    ("lateral-bag-explorer", "Lateral Bag Explorer", 85, ["nomadic"],
     "/images/parts/lateral-bag-explorer.png", "Side-mounted bag for cross-country exploration."),
    ("bottom-explorer-bag", "Bottom Explorer Bag", 125, ["nomadic"],
     "/images/parts/bottom-explorer-bag.png", "Bottom-mounted adventure bag for long expeditions."),
    ("instrument-kit-nomadic", "Basic Instrument Kit (Nomadic)", 350, ["nomadic"],
     "/images/parts/instrument-kit-nomadic.png", "USB charger and TTO digital sensors."),
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
