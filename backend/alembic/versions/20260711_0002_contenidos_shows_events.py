"""contenidos_shows_events_campos

Revision ID: 20260711_0002
Revises: 20260711_0001
Create Date: 2026-07-11

- Campos extra para shows/eventos: fecha, hora, capacidad, precio
- Seed inicial shows y events
"""
from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa

revision: str = "20260711_0002"
down_revision: Union[str, None] = "20260711_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("contenidos", sa.Column("fecha", sa.String(150), nullable=True))
    op.add_column("contenidos", sa.Column("hora", sa.String(100), nullable=True))
    op.add_column("contenidos", sa.Column("capacidad", sa.String(100), nullable=True))
    op.add_column("contenidos", sa.Column("precio", sa.String(100), nullable=True))

    # ── Shows seed ────────────────────────────────────────────────────
    sh_hero = str(uuid.uuid4())
    sh_intro = str(uuid.uuid4())
    op.execute(f"""
        INSERT INTO contenidos (id, seccion, tipo, titulo, slug, descripcion, imagen, orden, activo)
        VALUES
        ('{sh_hero}', 'shows', 'hero', 'W.C Shows', 'hero',
         'Spectacular aerial demonstrations and paramotor festivals worldwide',
         '/images/front1.jpg', 0, true),
        ('{sh_intro}', 'shows', 'intro', 'Intro Shows', 'intro',
         'Experience the thrill of paramotor shows featuring world-class pilots, stunning formations, and cutting-edge equipment demonstrations.',
         NULL, 1, true)
        ON CONFLICT (seccion, slug) DO NOTHING
    """)

    shows = [
        ("dubai-air-festival", "Dubai Air Festival", "March 15-17, 2025", "Dubai, UAE",
         "Wing Concept presents breathtaking aerial formations and acrobatic demonstrations over the Arabian Gulf.",
         "/images/dubai.jpg",
         ["Formation flying", "Acrobatic routines", "Night light show", "Product showcase"], 10),
        ("european-championship", "European Paramotor Championship", "July 8-14, 2025", "Alps, Switzerland",
         "The pinnacle of paramotor competition featuring precision flying, cross-country racing, and technical challenges.",
         "/images/european.jpg",
         ["Speed racing", "Precision landing", "Cross-country navigation", "Freestyle competition"], 20),
        ("americas-expo", "Americas Paramotor Expo", "September 22-24, 2025", "Miami, USA",
         "The largest paramotor gathering in North America with live demonstrations and workshops.",
         "/images/miami.jpg",
         ["Live demonstrations", "Product launches", "Pilot workshops", "Community gathering"], 30),
        ("medellin-parade", "Medellín Sky Parade", "December 1-3, 2025", "Medellín, Colombia",
         "A celebration of paramotor culture with hundreds of paramotors creating aerial spectacles.",
         "/images/colombia.jpg",
         ["Mass formations", "Cultural celebrations", "Colombian heritage flight", "Community events"], 40),
    ]
    for slug, titulo, fecha, ubicacion, desc, imagen, highlights, orden in shows:
        sid = str(uuid.uuid4())
        hl = ", ".join(f"'{h}'" for h in highlights)
        op.execute(f"""
            INSERT INTO contenidos
            (id, seccion, tipo, titulo, slug, descripcion, imagen, ubicacion, fecha, highlights, orden, activo)
            VALUES ('{sid}', 'shows', 'show', '{titulo}', '{slug}', '{desc}', '{imagen}', '{ubicacion}', '{fecha}',
                    ARRAY[{hl}], {orden}, true)
            ON CONFLICT (seccion, slug) DO NOTHING
        """)

    # ── Events seed ───────────────────────────────────────────────────
    ev_hero = str(uuid.uuid4())
    ev_intro = str(uuid.uuid4())
    op.execute(f"""
        INSERT INTO contenidos (id, seccion, tipo, titulo, slug, descripcion, imagen, orden, activo)
        VALUES
        ('{ev_hero}', 'events', 'hero', 'W.C Events', 'hero',
         'Training, workshops, and community gatherings for paramotor enthusiasts',
         '/images/motor.png', 0, true),
        ('{ev_intro}', 'events', 'intro', 'Intro Events', 'intro',
         'Join our educational events and workshops designed to elevate your paramotor skills, from beginner bootcamps to advanced technical courses.',
         NULL, 1, true)
        ON CONFLICT (seccion, slug) DO NOTHING
    """)

    events = [
        ("beginner-bootcamp", "Beginner Pilot Bootcamp", "February 10-14, 2025", "8:00 AM - 5:00 PM",
         "Bogotá, Colombia", "20 participants", "$1,200",
         "Comprehensive training program for aspiring paramotor pilots.",
         "/images/bootcamp.jpg",
         ["Ground school", "Flight simulator", "Real flight training", "Safety equipment", "Certification"], 10),
        ("acrobatics-workshop", "Advanced Acrobatics Workshop", "March 3-5, 2025", "9:00 AM - 4:00 PM",
         "Medellín, Colombia", "12 participants", "$800",
         "Master advanced acrobatic maneuvers with world-class instructors.",
         "/images/acrobatic.jpg",
         ["Expert coaching", "Video analysis", "Flight log review", "Safety briefings", "Group flights"], 20),
        ("maintenance-course", "Technical Maintenance Course", "May 5-9, 2025", "8:30 AM - 5:00 PM",
         "Bogotá, Colombia", "15 participants", "$600",
         "Learn to maintain, troubleshoot, and service your paramotor.",
         "/images/motor.png",
         ["Engine servicing", "Parts replacement", "Troubleshooting guide", "Tools provided", "Certification"], 30),
        ("navigation-clinic", "Cross-Country Navigation Clinic", "June 2-4, 2025", "7:00 AM - 5:00 PM",
         "Santa Marta, Colombia", "18 participants", "$750",
         "Master long-distance flying and navigation techniques.",
         "/images/santamarta.jpg",
         ["Navigation theory", "Thermal training", "Flight planning", "GPS systems", "Practical cross-country"], 40),
    ]
    for slug, titulo, fecha, hora, ubicacion, capacidad, precio, desc, imagen, includes, orden in events:
        eid = str(uuid.uuid4())
        hl = ", ".join(f"'{h}'" for h in includes)
        op.execute(f"""
            INSERT INTO contenidos
            (id, seccion, tipo, titulo, slug, descripcion, imagen, ubicacion, fecha, hora, capacidad, precio, highlights, orden, activo)
            VALUES ('{eid}', 'events', 'evento', '{titulo}', '{slug}', '{desc}', '{imagen}', '{ubicacion}',
                    '{fecha}', '{hora}', '{capacidad}', '{precio}', ARRAY[{hl}], {orden}, true)
            ON CONFLICT (seccion, slug) DO NOTHING
        """)


def downgrade() -> None:
    op.execute("DELETE FROM contenidos WHERE seccion IN ('shows', 'events')")
    op.drop_column("contenidos", "precio")
    op.drop_column("contenidos", "capacidad")
    op.drop_column("contenidos", "hora")
    op.drop_column("contenidos", "fecha")
