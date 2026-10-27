"""trike_accessories_client_order

Revision ID: 20261026_0014
Revises: 20260826_0013
Create Date: 2026-10-26

Accesorios de Vanguard y Nomadic en el orden del cliente (carpetas de Drive
"ACCESORIOS PARA TRIKES", doc "Arregloswing" sep 2026): orden, nombre y
descripción. Los precios existentes NO se tocan (solo filas nuevas usan el precio de la lista). Las filas que no están en la lista (duplicados como "Mirror",
"Engine wiring kit", pedales sin precio…) se desactivan, no se borran.
La lista debe coincidir con frontend/lib/trikeConfiguratorAccessories.js.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20261026_0014"
down_revision: Union[str, None] = "20260826_0013"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

BACKUP = "configurador_opciones_bak_20261026"

VANGUARD_ID = "c1a2b3d4-e5f6-7890-1234-567890abcdef"
NOMADIC_ID = "d1e2f3a4-b5c6-7890-1234-567890abcdef"

# (slug, nombre, precio, descripcion) — en orden de visualización
NOMADIC = [
    ('reserve-chute', 'Reserve Parachute — APCO Mayday UL28', 1528.0, 'Certified for heavy trike flying and light enough for real adventures. APCO has manufactured over 40,000 life-saving devices since 1984. Mayday 28 UL handles loads up to 400 kg (340 kg EN tested).'),
    ('parachute-container', 'Parachute Container', 65.0, 'Highly resistant to sunlight and abrasion. Mounts on the right or left side of the pilot harness for easy deployment.'),
    ('rock-guard', 'Nomadic Rock Guard', 85.0, '1/2-inch U-shaped stainless steel tube with laser-cut side plates and mesh — protects propeller tips from stones, sand, and branches during takeoff, taxiing, and landing.'),
    ('sun-roof-netting', 'Sunshade Net or Sunscreen', 43.0, 'Protects the pilot from the sun during sideways descent and prevents lines from tangling with the helmet or trike equipment.'),
    ('front-bar-protection', 'Padded Roll Bar Protector with Handles', 47.0, 'Protects the passenger and provides comfortable handles; front bars are padded for a robust look.'),
    ('front-brake', 'Front Brake', 120.0, 'Additional cable brake providing extra braking power — conventional mountain-bike derived system.'),
    ('rear-mirror', 'Rear Mirror', 25.0, 'Essential for viewing wing position during the first quarter of lift on takeoff.'),
    ('cockpit-liner', 'Nomadic Protective Cover', 105.0, 'Covers essential parts like the passenger/pilot cabin and engine for trailering without creating drag. Does not cover the propeller ring.'),
    ('bottom-explorer-bag', 'Nomadic Explorer Bag', 125.0, 'Designed for the Disruptor paratrike — carry camping gear, sleeping mats, and excursion accessories for adventure flying.'),
    ('lateral-bag-explorer', 'Nomadic Two (2) Side Explorer Cases (L-R)', 95.0, 'Aerodynamic side cases with extra straps for rods, tents, fuel, etc. without using internal space.'),
    ('auxiliary-lights', 'Auxiliary Lights Kit', 187.1, 'Two UP67 waterproof LED lights (white, yellow, strobe), red/green position indicators, luxury switch, wiring and relay — installed inside the structure. Highly recommended with the electrical installation kit.'),
    ('instrument-kit', 'Nomadic Basic Instruments Kit', 340.0, 'TTO digital RPM, spark plug temperature, coolant temperature gauges, and 4-port USB charger. Highly recommended with the engine electrical kit.'),
    ('electrical-kit', 'Complete Electrical Installation Kit (Vittorazi Zeus & Simonini Victor 1 Super)', 218.0, 'Regulator/rectifier, relays, starter solenoid, magneto test buttons, master switch, wiring harness and connectors for the selected engine.'),
    ('carabiners', 'Two (2) Carabiners', 90.0, 'High-capacity steel carabiners (2.4 kN each — over two tons) for maximum safety.'),
    ('propeller-guard', 'Nomadic External Propeller Guard', 295.0, 'Prevents wing or lines from entering the propeller. Ideal for schools and pilots learning wing control.'),
    ('phone-holder', 'New Phone Holder', 35.0, 'Compression grip holds any mobile phone firmly — perfect for passenger harness use with tether loop for security.'),
    ('line-protector', 'New Wheel Line Protector', 35.0, 'While our trikes come with a standard line protection system, pilots may opt to replace it with this new accessory, which mounts to the outside of the rim and attaches to the propeller guard ring.'),
]

VANGUARD = [
    ('reserve-chute', 'Reserve Parachute — APCO Mayday UL28', 1528.0, 'Certified for heavy trike flying and light enough for real adventures. APCO has manufactured over 40,000 life-saving devices since 1984. Mayday 28 UL handles loads up to 400 kg (340 kg EN tested).'),
    ('parachute-container', 'Parachute Container', 65.0, 'Highly resistant to sunlight and abrasion. Mounts on the right or left side of the pilot harness for easy deployment.'),
    ('sun-roof-netting', 'Vanguard Sunshade Net or Sunscreen', 43.0, 'Protects the pilot from the sun during sideways descent and prevents lines from tangling with the helmet or trike equipment.'),
    ('front-bar-protection', 'Padded Roll Bar Protector with Handles', 47.0, 'Protects the passenger and provides comfortable handles; front bars are padded for a robust look.'),
    ('front-brake', 'Front Brake', 120.0, 'Additional cable brake providing extra braking power — conventional mountain-bike derived system.'),
    ('rear-mirror', 'Rear Mirror', 25.0, 'Essential for viewing wing position during the first quarter of lift on takeoff.'),
    ('cockpit-liner', 'Vanguard Protector Cover', 105.0, 'Covers essential parts for trailering without creating drag. Does not cover the propeller ring.'),
    ('lateral-bag', 'Vanguard Two (2) Side Explorer Cases (L-R)', 95.0, 'Aerodynamic side cases with extra straps for rods, tents, fuel, etc. without using internal space.'),
    ('cruise-control', 'Cruise Control', 25.0, 'Maintains desired RPM for stable, smooth long-distance flight.'),
    ('fuel-gauge-vanguard', 'Vanguard Fuel Gauge', 114.5, 'Analog gauge for the L-shaped 17-gal tank — when empty, approximately 10 liters remain on reserve.'),
    ('auxiliary-lights', 'Auxiliary Lights Kit', 187.1, 'Two UP67 waterproof LED lights, position indicators, luxury switch, wiring and relay. Highly recommended with the electrical installation kit.'),
    ('instrument-kit', 'Basic Instruments Kit', 340.0, 'TTO digital RPM, spark plug temperature, coolant temperature gauges, and 4-port USB charger.'),
    ('electrical-kit', 'Complete Electrical Installation Kit', 218.2, 'Regulator/rectifier, relays, starter solenoid, magneto test buttons, master switch, and full wiring harness for the selected engine.'),
    ('carabiners', 'Two (2) Carabiners', 90.0, 'High-capacity steel carabiners (2.4 kN each) for maximum safety.'),
    ('propeller-guard', 'External Propeller Guard', 295.0, 'Prevents wing or lines from entering the propeller. Ideal for schools and beginners.'),
    ('phone-holder', 'New Phone Holder', 35.0, 'Compression grip holds any mobile phone firmly — perfect for passenger harness use.'),
    ('line-protector', 'New Wheel Line Protector', 35.0, 'While our trikes come with a standard line protection system, pilots may opt to replace it with this new accessory, which mounts to the outside of the rim and attaches to the propeller guard ring.'),
]


def _sync(conn, producto_id: str, items) -> None:
    exists = conn.execute(sa.text("SELECT 1 FROM productos WHERE id = CAST(:p AS uuid)"), {"p": producto_id}).first()
    if not exists:
        return
    slugs = [slug for slug, *_ in items]
    for orden, (slug, nombre, precio, descripcion) in enumerate(items, start=1):
        params = {"p": producto_id, "slug": slug, "nombre": nombre, "precio": precio, "descripcion": descripcion, "orden": orden}
        updated = conn.execute(sa.text("""
            UPDATE configurador_opciones
            SET nombre = :nombre, descripcion = :descripcion,
                orden = :orden, activo = true, updated_at = NOW()
            WHERE producto_id = CAST(:p AS uuid) AND grupo = 'accessory' AND slug = :slug
        """), params)
        if updated.rowcount == 0:
            conn.execute(sa.text("""
                INSERT INTO configurador_opciones
                    (id, producto_id, grupo, slug, nombre, descripcion, precio, orden, activo, created_at, updated_at)
                VALUES (gen_random_uuid(), CAST(:p AS uuid), 'accessory', :slug, :nombre, :descripcion, :precio, :orden, true, NOW(), NOW())
            """), params)
    conn.execute(sa.text("""
        UPDATE configurador_opciones
        SET activo = false, updated_at = NOW()
        WHERE producto_id = CAST(:p AS uuid) AND grupo = 'accessory' AND NOT (slug = ANY(:slugs))
    """), {"p": producto_id, "slugs": slugs})


def upgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text(f"""
        CREATE TABLE IF NOT EXISTS {BACKUP} AS
        SELECT * FROM configurador_opciones
        WHERE grupo = 'accessory' AND producto_id IN ('{VANGUARD_ID}'::uuid, '{NOMADIC_ID}'::uuid)
    """))
    _sync(conn, VANGUARD_ID, VANGUARD)
    _sync(conn, NOMADIC_ID, NOMADIC)


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text(f"""
        DELETE FROM configurador_opciones c
        WHERE c.grupo = 'accessory' AND c.producto_id IN (CAST(:v AS uuid), CAST(:n AS uuid))
          AND NOT EXISTS (SELECT 1 FROM {BACKUP} b WHERE b.id = c.id)
    """), {"v": VANGUARD_ID, "n": NOMADIC_ID})
    conn.execute(sa.text(f"""
        UPDATE configurador_opciones c
        SET nombre = b.nombre, precio = b.precio, descripcion = b.descripcion,
            orden = b.orden, activo = b.activo, updated_at = NOW()
        FROM {BACKUP} b WHERE b.id = c.id
    """))
    conn.execute(sa.text(f"DROP TABLE IF EXISTS {BACKUP}"))
