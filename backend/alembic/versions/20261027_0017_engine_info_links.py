"""engine_info_links

Revision ID: 20261027_0017
Revises: 20261027_0016
Create Date: 2026-10-27

Motores de Vanguard según el doc del cliente ("Arregloswing"): links "More engine
info" (el de Rotax 912 estaba roto y faltaba el del MZ500) y descripciones; la nota
de la fábrica en Rusia va en el RMZ500, no en el Hirth. No toca precios.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20261027_0017"
down_revision: Union[str, None] = "20261027_0016"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

VANGUARD_ID = "c1a2b3d4-e5f6-7890-1234-567890abcdef"

DESCRIPTIONS = {
    'rotax-912': 'The Rotax 912 UL|A|F is an 80-horsepower (59.6 kW), four-cylinder, four-stroke aircraft piston engine featuring a hybrid liquid/air-cooling system, integrated reduction gearbox, and dual electronic ignition. The designation covers uncertified and specific airworthiness-certified variants used widely in light sport and experimental aviation.',
    'simonini-v2': 'A powerful, very reliable and lightweight two-stroke engine weighing 52 kg with an excellent TBO of 1200 hours. Its great power means it is not necessary to run the engine at high RPMs. Its static thrust reaches 160 kg, which makes it very impressive.',
    'RMZ500': 'The RMZ500 (Rotax 503 clone) is a 497 cc, two-stroke, twin-cylinder, air-cooled aircraft engine built in Russia. It serves as a direct, compatible clone of the classic, out-of-production Rotax 503, producing roughly 50 to 52 horsepower at 6,000 rpm and weighing about 34 kg (75 lbs). Note: the factory in Russia may not produce it again due to the war — please confirm availability with Wing Concept.',
    'hirth-3503': 'The 35 Series liquid-cooled two-stroke engines offer the maximum power-to-weight ratios available in the 70-horsepower market — an ideal choice for light and ultralight aviation, hovercraft, gyro and helicopters, and all applications where weight could be an issue. Time between overhauls of 1000 hours at 75% power.',
}

LINKS = {
    "rotax-912": "https://www.flyrotax.com/products/912-uls-s",
    "RMZ500": "https://planeandpilotmag.com/whats-affordable-in-2022-a-new-503-wheeled-carriages-and-two-place-ppgs/",
    "hirth-3503": "https://hirthengines.com/3503-liquid-cooled-70hp-two-stroke-engine/",
}


def upgrade() -> None:
    conn = op.get_bind()
    for slug, url in LINKS.items():
        conn.execute(sa.text("""
            UPDATE configurador_opciones
            SET extra = COALESCE(extra, '{}'::jsonb) || jsonb_build_object('infoUrl', CAST(:url AS text)),
                updated_at = NOW()
            WHERE grupo = 'engine' AND slug = :slug AND producto_id = CAST(:p AS uuid)
        """), {"slug": slug, "url": url, "p": VANGUARD_ID})
    for slug, text in DESCRIPTIONS.items():
        conn.execute(sa.text("""
            UPDATE configurador_opciones
            SET descripcion = :text, updated_at = NOW()
            WHERE grupo = 'engine' AND slug = :slug AND producto_id = CAST(:p AS uuid)
        """), {"slug": slug, "text": text, "p": VANGUARD_ID})


def downgrade() -> None:
    pass
