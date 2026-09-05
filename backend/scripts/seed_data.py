"""Inserta o actualiza el catálogo alineado con la app (Vanguard, Nomadic, accesorios)."""
import json
import os
import sys
import uuid
from typing import Optional
from urllib.parse import urlparse

import psycopg2
from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# ── IDs fijos (deben coincidir con frontend/lib/products.js) ─────────────────
IPRO_ID = "b2c3d4e5-f6a7-4890-b123-456789abcdef"
VANGUARD_ID = "c1a2b3d4-e5f6-7890-1234-567890abcdef"
NOMADIC_ID = "d1e2f3a4-b5c6-7890-1234-567890abcdef"
DISRUPTOR_PARAMOTOR_ID = "e1f2a3b4-c5d6-7890-1234-567890abcdef"
DISRUPTOR_TRIKE_ID = "f1e2a3b4-c5d6-7890-1234-567890abcdef"
VANGUARD_VARIANT_ID = "c1a2b3d4-e5f6-7890-abcd-ef1234567890"
NOMADIC_VARIANT_ID = "d1e2f3a4-b5c6-7890-abcd-ef1234567890"
DISRUPTOR_PARAMOTOR_VARIANT_ID = "e1f2a3b4-c5d6-7890-abcd-ef1234567890"
DISRUPTOR_TRIKE_VARIANT_ID = "f1e2a3b4-c5d6-7890-abcd-ef1234567890"
TOURIST_FLIGHT_ID = "a1b2c3d4-e5f6-7890-abcd-123456789abc"
TOURIST_FLIGHT_VARIANT_ID = "a1b2c3d4-e5f6-7890-abcd-ef123456789a"

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


def _find_producto_id(cur, slug: str, pid: str) -> Optional[str]:
    """Resolve an existing row by slug, legacy slug aliases, or deterministic id."""
    cur.execute("SELECT id FROM productos WHERE slug = %s", (slug,))
    row = cur.fetchone()
    if row:
        return str(row[0])

    if slug.startswith("vanguard-"):
        bare = slug[len("vanguard-"):]
        for candidate in (f"acc-{bare}", bare, f"nomadic-{bare}"):
            cur.execute("SELECT id FROM productos WHERE slug = %s", (candidate,))
            row = cur.fetchone()
            if row:
                return str(row[0])
    elif slug.startswith("nomadic-"):
        bare = slug[len("nomadic-"):]
        for candidate in (f"acc-{bare}", bare, f"vanguard-{bare}"):
            cur.execute("SELECT id FROM productos WHERE slug = %s", (candidate,))
            row = cur.fetchone()
            if row:
                return str(row[0])

    cur.execute("SELECT id FROM productos WHERE id = %s::uuid", (pid,))
    row = cur.fetchone()
    if row:
        return str(row[0])

    return None


def _find_variante_id(cur, sku: str, vid: str) -> Optional[str]:
    cur.execute("SELECT id FROM variantes WHERE sku = %s", (sku,))
    row = cur.fetchone()
    if row:
        return str(row[0])
    cur.execute("SELECT id FROM variantes WHERE id = %s::uuid", (vid,))
    row = cur.fetchone()
    if row:
        return str(row[0])
    return None


def _upsert_producto(cur, pid, nombre, slug, descripcion, descripcion_corta, categoria, subcategoria, imagenes, orden, destacado=True):
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
                subcategoria = %s,
                imagenes = %s,
                activo = true,
                destacado = %s,
                orden_display = %s,
                updated_at = NOW()
            WHERE id = %s::uuid
            """,
            (
                slug,
                nombre,
                descripcion,
                descripcion_corta,
                categoria,
                subcategoria,
                imagenes,
                destacado,
                orden,
                existing_id,
            ),
        )
        return existing_id

    cur.execute(
        """
        INSERT INTO productos (id, nombre, slug, descripcion, descripcion_corta, categoria, subcategoria, imagenes, activo, destacado, orden_display, created_at, updated_at)
        VALUES (%s::uuid, %s, %s, %s, %s, %s, %s, %s, true, %s, %s, NOW(), NOW())
        """,
        (pid, nombre, slug, descripcion, descripcion_corta, categoria, subcategoria, imagenes, destacado, orden),
    )
    return pid


def _upsert_variante(cur, vid, producto_id, nombre, sku, precio, stock, atributos=None, es_principal=True):
    attrs = atributos if isinstance(atributos, str) else json.dumps(atributos or {})
    existing_id = _find_variante_id(cur, sku, vid)

    if existing_id:
        cur.execute(
            """
            UPDATE variantes SET
                producto_id = %s::uuid,
                nombre = %s,
                precio = %s,
                stock = %s,
                atributos = %s::jsonb,
                activo = true,
                es_principal = %s,
                updated_at = NOW()
            WHERE id = %s::uuid
            """,
            (producto_id, nombre, precio, stock, attrs, es_principal, existing_id),
        )
        return

    cur.execute(
        """
        INSERT INTO variantes (id, producto_id, nombre, sku, precio, stock, stock_minimo, atributos, activo, es_principal, created_at, updated_at)
        VALUES (%s::uuid, %s::uuid, %s, %s, %s, %s, 1, %s::jsonb, true, %s, NOW(), NOW())
        """,
        (vid, producto_id, nombre, sku, precio, stock, attrs, es_principal),
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
    cur.execute("UPDATE productos SET activo = false, destacado = false WHERE slug = 'i-pro'")
    cur.execute("UPDATE productos SET destacado = false WHERE slug = 'disruptor-trike'")

    # ── Paramotors ────────────────────────────────────────────────────
    disruptor_pm_id = _upsert_producto(
        cur, DISRUPTOR_PARAMOTOR_ID, "Disruptor Paramotor", "disruptor-paramotor",
        "The Disruptor breaks the status quo with in-flight CG correction, Spar Connectors, and patented tilting arms.",
        "Evolve with every flight", "paramotor", "disruptor",
        [f"/images/disruptor/paramotor-{i}.jpg" for i in range(1, 5)], 1, True,
    )
    _upsert_variante(
        cur, DISRUPTOR_PARAMOTOR_VARIANT_ID, disruptor_pm_id, "Disruptor Paramotor Base", "DISR-PM-BASE",
        2800.00, 10, '{"peso_kg": 26}', True,
    )

    ipro_id = _upsert_producto(
        cur, IPRO_ID, "I-Pro", "i-pro",
        "El I-Pro redefine lo que significa volar ligero.",
        "Next-gen lightweight design", "paramotor", "lightweight",
        ["/images/ipro_ejemplo.PNG"], 2, False,
    )
    _upsert_variante(cur, _vid("ipro-standard"), ipro_id, "I-Pro Standard", "IPRO-STD-001", 5950.00, 3,
                     '{"motor": "Vittorazi Moster 185 Plus", "peso_kg": 26, "empuje_kg": 90}')

    # ── Paratrike — Vanguard V8.0 ─────────────────────────────────────
    vanguard_id = _upsert_producto(
        cur, VANGUARD_ID, "Vanguard V8.0", "vanguard-v8",
        "High-performance trike developed with pilots and engineers. Benchmark in adventure flying.",
        "The benchmark in high-performance trikes", "paratrike", "vanguard",
        [f"/images/vanguard/{i}.png" for i in range(1, 11)], 10, True,
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
        [f"/images/nomadic/{i}.jpg" for i in range(2, 7)], 11, True,
    )
    _upsert_variante(
        cur, NOMADIC_VARIANT_ID, nomadic_id, "Nomadic Chassis Base", "NOM-BASE-001",
        4879.50, 4, '{"peso_kg": 42, "empuje_kg": 110}', True,
    )

    # ── Paratrike — Trike Disruptor ───────────────────────────────────
    disruptor_trike_id = _upsert_producto(
        cur, DISRUPTOR_TRIKE_ID, "Trike Disruptor", "disruptor-trike",
        "Disruptor paratrike with Tundra wheels, stainless chassis, and Gravity Control System.",
        "Designed for the Disruptor paramotor", "paratrike", "disruptor",
        [f"/images/disruptor/trike-{i}.jpg" for i in range(1, 5)], 12, False,
    )
    _upsert_variante(
        cur, DISRUPTOR_TRIKE_VARIANT_ID, disruptor_trike_id, "Trike Disruptor Base", "DISR-TRIKE-BASE",
        2500.00, 10, '{"peso_kg": 35}', True,
    )

    # ── Experiences — Tourist Flight reservation deposit ───────────────
    tourist_id = _upsert_producto(
        cur, TOURIST_FLIGHT_ID, "Tourist Flight Reservation", "tourist-flight-reservation",
        "Reservation deposit for a tandem tourist flight with a certified Wing Concept pilot.",
        "Book your tourist flight experience", "experiences", "tourist-flight",
        ["/images/colombia.jpg"], 50, False,
    )
    _upsert_variante(
        cur, TOURIST_FLIGHT_VARIANT_ID, tourist_id, "Flight Reservation Deposit", "TOUR-FLIGHT-DEP",
        round(20000 / 3218.44, 2), 999, '{"deposit_cop": 20000}', True,
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
    print("Seed completado: Disruptor Paramotor, Disruptor Trike, I-Pro, Vanguard, Nomadic + accesorios")
    print(f"  Disruptor Paramotor ID: {disruptor_pm_id}")
    print(f"  Disruptor Trike ID:     {disruptor_trike_id}")
    print(f"  Vanguard ID: {vanguard_id}")
    print(f"  Nomadic ID:  {nomadic_id}")

    try:
        from scripts.bootstrap import invalidate_product_cache

        invalidate_product_cache(quiet=True)
    except Exception:
        pass


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: seed_data falló: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc
