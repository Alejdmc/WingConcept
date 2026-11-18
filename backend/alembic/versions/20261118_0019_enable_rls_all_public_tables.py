"""enable_rls_all_public_tables

Revision ID: 20261118_0019
Revises: 20261111_0018
Create Date: 2026-11-18

Supabase alertó "rls_disabled_in_public": clearance_listings (0018) y la tabla de
respaldo configurador_opciones_bak_20261026 (0014) se crearon sin Row Level
Security, así que la API pública de Supabase (rol anon) podía leerlas y editarlas.

Activa RLS en toda tabla de `public` que no la tenga y quita los permisos de
anon/authenticated sobre ellas. El backend se conecta como `postgres`, igual que
con el resto de tablas, así que no le afecta. Idempotente.
"""
from typing import Sequence, Union

from alembic import op

revision: str = "20261118_0019"
down_revision: Union[str, None] = "20261111_0018"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        DO $$
        DECLARE t record;
        BEGIN
          FOR t IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                   WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND NOT c.relrowsecurity
          LOOP
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.relname);
            IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
              EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', t.relname);
            END IF;
            IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
              EXECUTE format('REVOKE ALL ON TABLE public.%I FROM authenticated', t.relname);
            END IF;
          END LOOP;
        END $$;
    """)


def downgrade() -> None:
    # No se desactiva RLS: dejar tablas expuestas no es un estado al que volver.
    pass
