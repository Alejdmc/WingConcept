"""manuals_cms

Revision ID: 20260724_0009
Revises: 20260722_0008
Create Date: 2026-07-24

- Tabla manuals (manuales descargables)
- Seed hero/intro CMS para /manuals
- Seed manuales iniciales
"""
from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "20260724_0009"
down_revision: Union[str, None] = "20260722_0008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "manuals",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("nombre", sa.String(255), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=True),
        sa.Column("archivo_url", sa.String(500), nullable=True),
        sa.Column("orden", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("activo", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_manuals_activo", "manuals", ["activo"])

    op.execute("ALTER TABLE manuals ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE manuals FORCE ROW LEVEL SECURITY")

    hero_id = str(uuid.uuid4())
    intro_id = str(uuid.uuid4())
    manual1 = str(uuid.uuid4())
    manual2 = str(uuid.uuid4())
    manual3 = str(uuid.uuid4())

    op.execute(f"""
        INSERT INTO contenidos (
            id, seccion, tipo, titulo, slug, descripcion, imagen, orden, activo
        ) VALUES
        ('{hero_id}', 'manuals', 'hero', 'Download Manuals', 'download-manuals',
         'Owner and Maintenance Manuals', '/images/front1.jpg', 0, true),
        ('{intro_id}', 'manuals', 'intro', 'Manuals Intro', 'manuals-intro',
         'Download owner and maintenance manuals for Wing Concept equipment.', NULL, 1, true)
    """)

    op.execute(f"""
        INSERT INTO manuals (id, nombre, descripcion, archivo_url, orden, activo)
        VALUES
        ('{manual1}', 'Nomadic Paratrike',
         'Owner and maintenance manual for the Nomadic paratrike.', NULL, 10, true),
        ('{manual2}', 'Vanguard Paratrike',
         'Owner and maintenance manual for the Vanguard paratrike.', NULL, 20, true),
        ('{manual3}', 'Paramotors',
         'Owner and maintenance manual for Wing Concept paramotors.', NULL, 30, true)
    """)


def downgrade() -> None:
    op.execute("DELETE FROM contenidos WHERE seccion = 'manuals'")
    op.execute("ALTER TABLE manuals NO FORCE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE manuals DISABLE ROW LEVEL SECURITY")
    op.drop_index("ix_manuals_activo", table_name="manuals")
    op.drop_table("manuals")
