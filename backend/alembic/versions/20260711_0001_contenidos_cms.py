"""contenidos_cms

Revision ID: 20260711_0001
Revises: 20260704_0001
Create Date: 2026-07-11

- Tabla contenidos para CMS (adventure, events, shows)
- RLS en contenidos
- Seed inicial de contenido Adventure
"""
from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ARRAY, UUID

revision: str = "20260711_0001"
down_revision: Union[str, None] = "20260704_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "contenidos",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("seccion", sa.String(50), nullable=False),
        sa.Column("tipo", sa.String(50), nullable=False),
        sa.Column("titulo", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(300), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=True),
        sa.Column("imagen", sa.String(500), nullable=True),
        sa.Column("ubicacion", sa.String(255), nullable=True),
        sa.Column("duracion", sa.String(100), nullable=True),
        sa.Column("dificultad", sa.String(50), nullable=True),
        sa.Column("participantes", sa.Integer(), nullable=True),
        sa.Column("highlights", ARRAY(sa.String()), nullable=True),
        sa.Column("orden", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("activo", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("seccion", "slug", name="uq_contenidos_seccion_slug"),
    )
    op.create_index("ix_contenidos_seccion", "contenidos", ["seccion"])
    op.create_index("ix_contenidos_tipo", "contenidos", ["tipo"])
    op.create_index("ix_contenidos_activo", "contenidos", ["activo"])

    op.execute("ALTER TABLE contenidos ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE contenidos FORCE ROW LEVEL SECURITY")

    # Seed Adventure
    hero_id = str(uuid.uuid4())
    intro_id = str(uuid.uuid4())
    exp1 = str(uuid.uuid4())
    exp2 = str(uuid.uuid4())
    exp3 = str(uuid.uuid4())
    exp4 = str(uuid.uuid4())

    op.execute(f"""
        INSERT INTO contenidos (id, seccion, tipo, titulo, slug, descripcion, imagen, orden, activo)
        VALUES
        ('{hero_id}', 'adventure', 'hero', 'W.C Adventure',
         'hero', 'Extraordinary Flying Experiences Around the World',
         '/images/front1.jpg', 0, true),
        ('{intro_id}', 'adventure', 'intro', 'Intro',
         'intro',
         'Join us on unforgettable paramotor expeditions to the world''s most stunning destinations. From tropical rainforests to alpine peaks, every adventure is meticulously planned for safety, education, and pure flying joy.',
         NULL, 1, true)
    """)

    op.execute(f"""
        INSERT INTO contenidos
        (id, seccion, tipo, titulo, slug, descripcion, imagen, ubicacion, duracion, dificultad, participantes, highlights, orden, activo)
        VALUES
        ('{exp1}', 'adventure', 'expedicion', 'Colombian Amazon Expedition', 'colombian-amazon',
         'Fly over the world''s largest rainforest and experience biodiversity like never before. Land on remote strips and connect with indigenous communities.',
         '/images/leticia.jpg', 'Leticia, Colombia', '10 days', 'Advanced', 8,
         ARRAY['Remote jungle airstrips', 'Wildlife photography from the sky', 'Cultural immersion with local pilots', 'Advanced navigation techniques'],
         10, true),
        ('{exp2}', 'adventure', 'expedicion', 'Alps High-Altitude Challenge', 'alps-challenge',
         'Challenge yourself with high-altitude flying across the European Alps. Experience world-class thermal conditions and breathtaking mountain scenery.',
         '/images/suiza.jpg', 'Switzerland & France', '7 days', 'Expert', 6,
         ARRAY['Altitude flying (up to 4000m)', 'Thermal ridge soaring', 'Cross-border navigation', 'High-altitude safety protocols'],
         20, true),
        ('{exp3}', 'adventure', 'expedicion', 'Desert Nomad Safari', 'desert-nomad',
         'Explore vast deserts and witness the raw beauty of Africa from above. Land at remote spots and experience true adventure flying.',
         '/images/african.jpg', 'Namibia, Africa', '12 days', 'Intermediate', 10,
         ARRAY['Vast desert landscapes', 'Wildlife observation flights', 'Off-grid camping experience', 'Emergency landing procedures'],
         30, true),
        ('{exp4}', 'adventure', 'expedicion', 'Tropical Paradise Tour', 'tropical-paradise',
         'Perfect for new pilots. Fly over rainforests, beaches, and volcanoes in a paradise setting with ideal flying conditions year-round.',
         '/images/costarica.jpg', 'Costa Rica', '5 days', 'Beginner', 12,
         ARRAY['Scenic coastal flights', 'Volcano observation', 'Beach landing practice', 'Tropical weather mastery'],
         40, true)
    """)


def downgrade() -> None:
    op.execute("ALTER TABLE contenidos NO FORCE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE contenidos DISABLE ROW LEVEL SECURITY")
    op.drop_index("ix_contenidos_activo", table_name="contenidos")
    op.drop_index("ix_contenidos_tipo", table_name="contenidos")
    op.drop_index("ix_contenidos_seccion", table_name="contenidos")
    op.drop_table("contenidos")
