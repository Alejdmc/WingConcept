"""contenidos_news

Revision ID: 20260821_0012
Revises: 20260804_0011
Create Date: 2026-08-21

Seed inicial sección news (hero, intro, artículos).
"""
from typing import Sequence, Union
import uuid

from alembic import op

revision: str = "20260821_0012"
down_revision: Union[str, None] = "20260804_0011"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    nw_hero = str(uuid.uuid4())
    nw_intro = str(uuid.uuid4())
    op.execute(f"""
        INSERT INTO contenidos (id, seccion, tipo, titulo, slug, descripcion, imagen, orden, activo)
        VALUES
        ('{nw_hero}', 'news', 'hero', 'W.C News', 'hero',
         'Latest updates from Wing Concept — products, events, and the paramotor community',
         '/images/front1.jpg', 0, true),
        ('{nw_intro}', 'news', 'intro', 'Intro News', 'intro',
         'Stay up to date with product launches, expedition reports, dealer news, and stories from pilots around the world.',
         NULL, 1, true)
        ON CONFLICT (seccion, slug) DO NOTHING
    """)

    articles = [
        ("disruptor-launch", "Disruptor Paramotor & Trike Now Available",
         "August 2026", "Product Launch",
         "The Disruptor line is here — paramotor and paratrike platforms built for pilots who evolve with every flight.",
         "/images/disruptor/paramotor-1.jpg",
         ["/paramotors/disruptor", "Gravity Control System", "Configurable online", "Expedition-ready trike"], 10),
        ("nomadic-trike", "Nomadic Trike — Configure Your Expedition Build",
         "August 2026", "Paratrike",
         "Built for adventure paramotoring in remote environments — tundra wheels, telescopic axles, and multi-engine mounts.",
         "/images/nomadic/2.jpg",
         ["/paratrike/nomadic", "Stainless steel chassis", "45 kg dry weight", "Configure online"], 20),
        ("vanguard-v8", "Vanguard V8.0 — Three Flight Modes in One Trike",
         "August 2026", "Paratrike",
         "Commercial, Adventure, or Reportage — interchangeable mission pods and in-flight center-of-gravity adjustment.",
         "/images/vanguard/1.png",
         ["/paratrike/vanguard", "Commercial / Adventure / Reportage", "17-gallon fuel tank", "Open configurator"], 30),
        ("tourist-flight", "Book a Tourist Flight",
         "August 2026", "Experiences",
         "Experience the freedom of paramotor flight with a certified pilot. Locations in Colombia and the United States.",
         "/images/colombia.jpg",
         ["/tourist-flight", "Colombia & USA locations", "Certified pilots", "Schedule & rates online"], 40),
        ("parts-catalog", "Parts & Accessories Catalog Updated",
         "August 2026", "Shop",
         "Structural parts and optional accessories for Vanguard and Nomadic — now with expandable product photos.",
         "/images/parts/front-axle.png",
         ["/parts", "Vanguard & Nomadic compatible", "Add to cart", "Enlarge photos"], 50),
    ]
    for slug, titulo, fecha, ubicacion, desc, imagen, highlights, orden in articles:
        nid = str(uuid.uuid4())
        link = highlights[0] if highlights and highlights[0].startswith('/') else None
        hl_items = highlights[1:] if link else highlights
        hl = ", ".join(f"'{h}'" for h in hl_items)
        link_sql = f"'{link}'" if link else "NULL"
        desc_esc = desc.replace("'", "''")
        titulo_esc = titulo.replace("'", "''")
        op.execute(f"""
            INSERT INTO contenidos
            (id, seccion, tipo, titulo, slug, descripcion, imagen, ubicacion, fecha, capacidad, highlights, orden, activo)
            VALUES ('{nid}', 'news', 'noticia', '{titulo_esc}', '{slug}', '{desc_esc}', '{imagen}', '{ubicacion}', '{fecha}',
                    {link_sql}, ARRAY[{hl}], {orden}, true)
            ON CONFLICT (seccion, slug) DO NOTHING
        """)


def downgrade() -> None:
    op.execute("DELETE FROM contenidos WHERE seccion = 'news'")
