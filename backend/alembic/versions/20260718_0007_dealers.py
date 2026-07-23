"""dealers

Revision ID: 20260718_0007
Revises: 20260717_0006
Create Date: 2026-07-18

- Tabla dealers (distribuidores autorizados)
- Seed inicial de dealers
"""
from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "20260718_0007"
down_revision: Union[str, None] = "20260717_0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "dealers",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("nombre", sa.String(255), nullable=False),
        sa.Column("equipo", sa.String(255), nullable=True),
        sa.Column("ubicacion", sa.String(255), nullable=True),
        sa.Column("descripcion", sa.Text(), nullable=True),
        sa.Column("instagram", sa.String(500), nullable=True),
        sa.Column("orden", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("activo", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_dealers_activo", "dealers", ["activo"])

    op.execute("ALTER TABLE dealers ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE dealers FORCE ROW LEVEL SECURITY")

    dealer1 = str(uuid.uuid4())
    dealer2 = str(uuid.uuid4())
    op.execute(f"""
        INSERT INTO dealers (id, nombre, equipo, ubicacion, descripcion, instagram, orden, activo)
        VALUES
        ('{dealer1}', 'Paramotor Flights LLC', 'Team Louish', 'Saratoga Springs, Utah',
         'Authorized Paratrikes dealer serving Utah. Specializing in tandem paramotor flights, professional flight training, pilot support, and high-quality powered paragliding equipment. Dedicated to providing safe, exciting, and unforgettable flying experiences for both new and experienced pilots.',
         NULL, 10, true),
        ('{dealer2}', 'Pukana Adventures', NULL, 'Utah',
         'Authorized Paratrikes dealer offering tandem paramotor flights, certified flight training, a fully equipped paramotor shop, and access to a dedicated flight park. Whether you''re looking to experience your first flight, become a certified pilot, or purchase premium paramotor equipment, Pukana Adventures provides expert guidance and outstanding customer service.',
         'https://www.instagram.com/pukanaadventures?igsh=NXQxcDZtajVmZTEy', 20, true)
    """)


def downgrade() -> None:
    op.execute("ALTER TABLE dealers NO FORCE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE dealers DISABLE ROW LEVEL SECURITY")
    op.drop_index("ix_dealers_activo", table_name="dealers")
    op.drop_table("dealers")
