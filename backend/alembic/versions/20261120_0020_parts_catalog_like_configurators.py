"""parts_catalog_like_configurators

Revision ID: 20261120_0020
Revises: 20261118_0019
Create Date: 2026-11-20

Parts & Accessories (/parts) igual que los configuradores: mismo nombre,
descripción y fotos (galerías de Drive) para cada accesorio de los configuradores.

- Actualiza nombre / descripción / fotos / compatibilidad de los accesorios que
  están en los configuradores. NO cambia precios.
- Oculta (activo=false) duplicados y placeholders sin foto ni información.
- Agrega los accesorios de los configuradores que faltaban, con el precio del configurador.
- No toca los que se arreglaron a mano con descripción y fotos (KEEP).

Respaldo en parts_catalog_bak_20261120 (con RLS) para el downgrade.
"""
import json
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20261120_0020"
down_revision: Union[str, None] = "20261118_0019"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

BACKUP = "parts_catalog_bak_20261120"

# Arreglados a mano (descripción + fotos): no se tocan
KEEP = [
    "cruise-control",
    "nomadic-protective-cover",
    "rock-guard-nomadic",
    "parachute-container"
]

# slug → (nombre, descripción, fotos, compatible_with) — precio sin cambios
UPDATE = {
    "acc-sun-roof-netting": [
        "Sunshade Net or Sunscreen",
        "Protects the pilot from the sun during sideways descent and prevents lines from tangling with the helmet or trike equipment.",
        [
            "/images/parts/trikes/vanguard/sun-roof-netting-1.jpg",
            "/images/parts/trikes/vanguard/sun-roof-netting-2.jpg",
            "/images/parts/trikes/vanguard/sun-roof-netting-3.jpg",
            "/images/parts/trikes/vanguard/sun-roof-netting-4.jpg"
        ],
        [
            "vanguard",
            "nomadic"
        ]
    ],
    "acc-front-bar-protection": [
        "Padded Roll Bar Protector with Handles",
        "Protects the passenger and provides comfortable handles; front bars are padded for a robust look.",
        [
            "/images/parts/trikes/nomadic/front-bar-protection-1.jpg",
            "/images/parts/trikes/nomadic/front-bar-protection-2.jpg",
            "/images/parts/trikes/nomadic/front-bar-protection-3.jpg",
            "/images/parts/trikes/nomadic/front-bar-protection-4.jpg"
        ],
        [
            "vanguard",
            "nomadic"
        ]
    ],
    "acc-front-brake": [
        "Front Brake",
        "Additional cable brake providing extra braking power — conventional mountain-bike derived system.",
        [
            "/images/parts/trikes/vanguard/front-brake-1.jpg",
            "/images/parts/trikes/vanguard/front-brake-2.jpg",
            "/images/parts/trikes/vanguard/front-brake-3.jpg"
        ],
        [
            "vanguard",
            "nomadic"
        ]
    ],
    "acc-rear-mirror": [
        "Rear Mirror",
        "Essential for viewing wing position during the first quarter of lift on takeoff.",
        [
            "/images/parts/trikes/vanguard/rear-mirror-1.jpg",
            "/images/parts/trikes/vanguard/rear-mirror-2.jpg",
            "/images/parts/trikes/vanguard/rear-mirror-3.jpg",
            "/images/parts/trikes/vanguard/rear-mirror-4.jpg"
        ],
        [
            "vanguard",
            "nomadic"
        ]
    ],
    "vanguard-cover": [
        "Vanguard Protector Cover",
        "Covers essential parts for trailering without creating drag. Does not cover the propeller ring.",
        [
            "/images/parts/trikes/vanguard/cockpit-liner-1.jpg",
            "/images/parts/trikes/vanguard/cockpit-liner-2.jpg",
            "/images/parts/trikes/vanguard/cockpit-liner-3.jpg"
        ],
        [
            "vanguard"
        ]
    ],
    "acc-lateral-bag": [
        "Vanguard Two (2) Side Explorer Cases (L-R)",
        "Aerodynamic side cases with extra straps for rods, tents, fuel, etc. without using internal space.",
        [
            "/images/parts/trikes/vanguard/lateral-bag-1.jpg",
            "/images/parts/trikes/vanguard/lateral-bag-2.jpg",
            "/images/parts/trikes/vanguard/lateral-bag-3.jpg",
            "/images/parts/trikes/vanguard/lateral-bag-4.jpg"
        ],
        [
            "vanguard"
        ]
    ],
    "acc-lateral-bag-explorer": [
        "Nomadic Two (2) Side Explorer Cases (L-R)",
        "Aerodynamic side cases with extra straps for rods, tents, fuel, etc. without using internal space.",
        [
            "/images/parts/lateral-bag-explorer-1.jpg",
            "/images/parts/lateral-bag-explorer-2.png",
            "/images/parts/lateral-bag-explorer-3.png"
        ],
        [
            "nomadic"
        ]
    ],
    "acc-bottom-explorer-bag": [
        "Nomadic Explorer Bag",
        "Designed for the Disruptor paratrike — carry camping gear, sleeping mats, and excursion accessories for adventure flying.",
        [
            "/images/parts/trikes/nomadic/bottom-explorer-bag-1.jpg",
            "/images/parts/trikes/nomadic/bottom-explorer-bag-2.jpg",
            "/images/parts/trikes/nomadic/bottom-explorer-bag-3.jpg",
            "/images/parts/trikes/nomadic/bottom-explorer-bag-4.jpg"
        ],
        [
            "nomadic"
        ]
    ],
    "acc-fuel-gauge-vanguard": [
        "Vanguard Fuel Gauge",
        "Analog gauge for the L-shaped 17-gal tank — when empty, approximately 10 liters remain on reserve.",
        [
            "/images/parts/trikes/vanguard/fuel-gauge-vanguard-1.jpg",
            "/images/parts/trikes/vanguard/fuel-gauge-vanguard-2.jpg",
            "/images/parts/trikes/vanguard/fuel-gauge-vanguard-3.jpg",
            "/images/parts/trikes/vanguard/fuel-gauge-vanguard-4.jpg"
        ],
        [
            "vanguard"
        ]
    ],
    "acc-auxiliary-lights": [
        "Auxiliary Lights Kit",
        "Two UP67 waterproof LED lights (white, yellow, strobe), red/green position indicators, luxury switch, wiring and relay — installed inside the structure. Highly recommended with the electrical installation kit.",
        [
            "/images/parts/trikes/vanguard/auxiliary-lights-1.jpg",
            "/images/parts/trikes/vanguard/auxiliary-lights-2.jpg",
            "/images/parts/trikes/vanguard/auxiliary-lights-3.jpg"
        ],
        [
            "vanguard",
            "nomadic"
        ]
    ],
    "acc-instrument-kit-vanguard": [
        "Basic Instruments Kit (Vanguard)",
        "TTO digital RPM, spark plug temperature, coolant temperature gauges, and 4-port USB charger.",
        [
            "/images/parts/trikes/vanguard/instrument-kit-1.jpg",
            "/images/parts/trikes/vanguard/instrument-kit-2.jpg",
            "/images/parts/trikes/vanguard/instrument-kit-3.jpg"
        ],
        [
            "vanguard"
        ]
    ],
    "acc-instrument-kit-nomadic": [
        "Nomadic Basic Instruments Kit",
        "TTO digital RPM, spark plug temperature, coolant temperature gauges, and 4-port USB charger. Highly recommended with the engine electrical kit.",
        [
            "/images/parts/trikes/nomadic/instrument-kit-1.jpg",
            "/images/parts/trikes/nomadic/instrument-kit-2.jpg",
            "/images/parts/trikes/nomadic/instrument-kit-3.jpg"
        ],
        [
            "nomadic"
        ]
    ],
    "acc-electrical-kit": [
        "Complete Electrical Installation Kit",
        "Regulator/rectifier, relays, starter solenoid, magneto test buttons, master switch, and full wiring harness for the selected engine.",
        [
            "/images/parts/trikes/vanguard/electrical-kit-1.jpg",
            "/images/parts/trikes/vanguard/electrical-kit-2.jpg",
            "/images/parts/trikes/vanguard/electrical-kit-3.jpg",
            "/images/parts/trikes/vanguard/electrical-kit-4.jpg"
        ],
        [
            "vanguard",
            "nomadic"
        ]
    ],
    "acc-carabiners": [
        "Two (2) Carabiners",
        "High-capacity steel carabiners (2.4 kN each) for maximum safety.",
        [
            "/images/parts/trikes/vanguard/carabiners-1.jpg",
            "/images/parts/trikes/vanguard/carabiners-2.jpg",
            "/images/parts/trikes/vanguard/carabiners-3.jpg"
        ],
        [
            "vanguard",
            "nomadic"
        ]
    ],
    "acc-propeller-guard": [
        "External Propeller Guard",
        "Prevents wing or lines from entering the propeller. Ideal for schools and beginners.",
        [
            "/images/parts/pilot-dynamic-cage.png"
        ],
        [
            "vanguard",
            "nomadic"
        ]
    ],
    "vanguard-phone-holder": [
        "New Phone Holder",
        "Compression grip holds any mobile phone firmly — perfect for passenger harness use.",
        [
            "/images/parts/trikes/vanguard/phone-holder-1.jpg",
            "/images/parts/trikes/vanguard/phone-holder-2.jpg",
            "/images/parts/trikes/vanguard/phone-holder-3.jpg",
            "/images/parts/trikes/vanguard/phone-holder-4.jpg"
        ],
        [
            "vanguard",
            "nomadic"
        ]
    ]
}

# slug → (nombre, precio del configurador, descripción, fotos, compatible_with, sku)
INSERT = {
    "acc-reserve-chute": [
        "Reserve Parachute — APCO Mayday UL28",
        1528.0,
        "Certified for heavy trike flying and light enough for real adventures. APCO has manufactured over 40,000 life-saving devices since 1984. Mayday 28 UL handles loads up to 400 kg (340 kg EN tested).",
        [
            "/images/parts/trikes/vanguard/reserve-chute-1.jpg",
            "/images/parts/trikes/vanguard/reserve-chute-2.jpg",
            "/images/parts/trikes/vanguard/reserve-chute-3.jpg"
        ],
        [
            "vanguard",
            "nomadic"
        ],
        "ACC-RESERVE-CHUTE"
    ],
    "acc-line-protector": [
        "New Wheel Line Protector",
        35.0,
        "While our trikes come with a standard line protection system, pilots may opt to replace it with this new accessory, which mounts to the outside of the rim and attaches to the propeller guard ring.",
        [
            "/images/parts/trikes/vanguard/line-protector-1.jpg",
            "/images/parts/trikes/vanguard/line-protector-2.jpg",
            "/images/parts/trikes/vanguard/line-protector-3.jpg"
        ],
        [
            "vanguard",
            "nomadic"
        ],
        "ACC-LINE-PROTECTOR"
    ],
    "acc-engine-mount": [
        "Vanguard Engine Mount and Electrical Components",
        380.0,
        "This structure is separate from the main chassis, allowing for the installation of various engine types — such as the Rotax 503 and 582, the 110hp Simonini Victor 2 Super, and the Hirth 35 series (64hp and 70hp). It is designed this way to absorb engine vibrations and facilitate easy removal.",
        [
            "/images/parts/trikes/vanguard/engine-mount-1.jpg",
            "/images/parts/trikes/vanguard/engine-mount-2.jpg",
            "/images/parts/trikes/vanguard/engine-mount-3.jpg"
        ],
        [
            "vanguard"
        ],
        "ACC-ENGINE-MOUNT"
    ]
}

# Duplicados o placeholders sin foto/descripción
HIDE = [
    "acc-cruise-control",
    "nomadic-nomadic-cover",
    "vanguard-sun-shade",
    "nomadic-prop-guard",
    "vanguard-lights",
    "nomadic-lateral-bag",
    "vanguard-ballistic-parachute",
    "part-rock-guard",
    "part-parachute-container",
    "part-front-bar-protection",
    "vanguard-front-guard",
    "nomadic-cage-hoop",
    "nomadic-passenger-pad",
    "nomadic-front-handle",
    "acc-camel-back"
]


def upgrade() -> None:
    conn = op.get_bind()
    slugs = [s for s in list(UPDATE) + HIDE if s not in KEEP]
    conn.execute(sa.text(f"""
        CREATE TABLE IF NOT EXISTS {BACKUP} AS
        SELECT p.id, p.slug, p.nombre, p.descripcion, p.descripcion_corta, p.imagenes, p.activo,
               (SELECT json_agg(json_build_object('id', v.id, 'atributos', v.atributos))
                  FROM variantes v WHERE v.producto_id = p.id) AS variantes
        FROM productos p WHERE p.slug = ANY(:slugs)
    """).bindparams(sa.bindparam("slugs", value=slugs, type_=sa.ARRAY(sa.String))))
    conn.execute(sa.text(f"ALTER TABLE {BACKUP} ENABLE ROW LEVEL SECURITY"))

    for slug, (nombre, desc, fotos, compat) in UPDATE.items():
        if slug in KEEP:
            continue
        pid = conn.execute(sa.text("SELECT id FROM productos WHERE slug = :s"), {"s": slug}).scalar()
        if not pid:
            continue
        conn.execute(sa.text("""
            UPDATE productos SET nombre = :n, descripcion = :d, descripcion_corta = :dc,
                   imagenes = :img, activo = true, updated_at = NOW()
            WHERE id = :id
        """).bindparams(sa.bindparam("img", type_=sa.ARRAY(sa.String))),
            {"n": nombre, "d": desc, "dc": desc[:500], "img": fotos, "id": pid})
        conn.execute(sa.text("""
            UPDATE variantes SET nombre = :n,
                   atributos = COALESCE(atributos, '{}'::jsonb) || jsonb_build_object('compatible_with', CAST(:c AS jsonb)),
                   updated_at = NOW()
            WHERE producto_id = :id
        """), {"n": nombre, "c": json.dumps(compat), "id": pid})

    for slug, (nombre, precio, desc, fotos, compat, sku) in INSERT.items():
        if conn.execute(sa.text("SELECT 1 FROM productos WHERE slug = :s"), {"s": slug}).scalar():
            continue
        pid = conn.execute(sa.text("""
            INSERT INTO productos (id, nombre, slug, descripcion, descripcion_corta, categoria, imagenes,
                                   activo, destacado, orden_display, created_at, updated_at)
            VALUES (gen_random_uuid(), :n, :s, :d, :dc, 'accesorios', :img, true, false, 0, NOW(), NOW())
            RETURNING id
        """).bindparams(sa.bindparam("img", type_=sa.ARRAY(sa.String))),
            {"n": nombre, "s": slug, "d": desc, "dc": desc[:500], "img": fotos}).scalar()
        conn.execute(sa.text("""
            INSERT INTO variantes (id, producto_id, nombre, sku, precio, stock, stock_minimo, atributos,
                                   activo, es_principal, created_at, updated_at)
            VALUES (gen_random_uuid(), :pid, :n, :sku, :p, 10, 2, jsonb_build_object('compatible_with', CAST(:c AS jsonb)),
                    true, true, NOW(), NOW())
        """), {"pid": pid, "n": nombre, "sku": sku, "p": precio, "c": json.dumps(compat)})

    conn.execute(sa.text("""
        UPDATE productos SET activo = false, updated_at = NOW()
        WHERE slug = ANY(:slugs) AND activo = true
    """).bindparams(sa.bindparam("slugs", value=[s for s in HIDE if s not in KEEP], type_=sa.ARRAY(sa.String))))


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("""
        DELETE FROM variantes WHERE producto_id IN (SELECT id FROM productos WHERE slug = ANY(:slugs));
    """).bindparams(sa.bindparam("slugs", value=list(INSERT), type_=sa.ARRAY(sa.String))))
    conn.execute(sa.text("DELETE FROM productos WHERE slug = ANY(:slugs)")
                 .bindparams(sa.bindparam("slugs", value=list(INSERT), type_=sa.ARRAY(sa.String))))
    exists = conn.execute(sa.text("SELECT to_regclass(:t)"), {"t": BACKUP}).scalar()
    if not exists:
        return
    conn.execute(sa.text(f"""
        UPDATE productos p SET nombre = b.nombre, descripcion = b.descripcion, descripcion_corta = b.descripcion_corta,
               imagenes = b.imagenes, activo = b.activo, updated_at = NOW()
        FROM {BACKUP} b WHERE b.id = p.id
    """))
    conn.execute(sa.text(f"""
        UPDATE variantes v SET atributos = (x->>'atributos')::jsonb, updated_at = NOW()
        FROM {BACKUP} b, json_array_elements(b.variantes) x
        WHERE (x->>'id')::uuid = v.id
    """))
    conn.execute(sa.text(f"DROP TABLE IF EXISTS {BACKUP}"))
