# Configuración de Alembic — WingConcept Backend

## ¿Qué es Alembic y por qué es importante?

**Alembic** es el sistema de migraciones de base de datos para SQLAlchemy. Su propósito es:

### ✅ Control de versiones del esquema de BD
- Cada cambio en la estructura de las tablas queda registrado en un archivo de migración versionado
- Permite reproducir el esquema completo en cualquier servidor (desarrollo, staging, producción)
- Sin migraciones: cada desarrollador o servidor nuevo debe "adivinar" cómo crear las tablas

### ✅ Historial de cambios
- Cada migración documenta QUÉ cambió, CUÁNDO y POR QUÉ
- Ejemplo: "2026-06-10 — Agregar campo `email_verificado` a tabla usuarios"
- En 6 meses, cuando alguien pregunte "¿desde cuándo tenemos este campo?", Alembic tiene la respuesta

### ✅ Rollback seguro
- Si un cambio en producción causa problemas, puedes hacer rollback:
  ```bash
  alembic downgrade -1  # Revertir última migración
  ```
- Sin migraciones: revertir un cambio de BD en producción es manual, riesgoso y propenso a errores

### ✅ Trabajo en equipo
- Desarrollador A agrega una columna → genera migración → hace commit
- Desarrollador B hace pull → ejecuta `alembic upgrade head` → su BD se actualiza automáticamente
- Sin migraciones: cada uno debe comunicar manualmente los cambios de BD (y alguien siempre se olvida)

### ✅ Deploy automatizado
- Tu pipeline CI/CD puede ejecutar `alembic upgrade head` antes de iniciar el backend
- Cada deploy garantiza que la BD está en el estado esperado
- Sin migraciones: cada deploy es manual y arriesgado

---

## El problema actual (SIN migraciones)

En este momento:
- La carpeta `backend/alembic/versions/` está **vacía**
- Si borras la BD de Supabase, no hay forma de recrearla desde el código
- Si un nuevo colaborador clona el repo, no puede crear las 8 tablas del proyecto
- Si necesitas un servidor de staging, debes crear las tablas manualmente
- Si algo sale mal en producción, no hay forma de hacer rollback

**Esto es crítico antes de cualquier lanzamiento a producción.**

---

## Cómo generar la migración inicial

### 1. Verificar que el `.env` tenga `DATABASE_URL` configurado
```bash
cd backend
cat .env | grep DATABASE_URL
```

Debe apuntar a tu BD de Supabase:
```
DATABASE_URL=postgresql+asyncpg://postgres:PASSWORD@db.xxxxxxxxxxxx.supabase.co:5432/postgres
```

### 2. Generar la migración automáticamente
```bash
alembic revision --autogenerate -m "initial_schema"
```

Esto crea un archivo en `backend/alembic/versions/` con un hash único, por ejemplo:
```
abc123def456_initial_schema.py
```

### 3. Revisar el archivo generado
Abre el archivo y verifica que:
- Todas las 8 tablas están en la función `upgrade()`
- Los tipos de columna son correctos (UUID, String, Numeric, JSONB, etc.)
- Las foreign keys apuntan a las tablas correctas
- Los índices están presentes

**Importante:** Alembic NO siempre detecta todo correctamente. Revisa manualmente antes de aplicar.

### 4. Aplicar la migración
```bash
alembic upgrade head
```

Esto ejecuta el SQL generado contra tu BD de Supabase.

### 5. Verificar en Supabase
Entra al panel de Supabase → Table Editor y confirma que las 8 tablas existen:
- usuarios
- productos
- variantes
- configuraciones
- direcciones_envio
- carritos
- items_carrito
- ordenes
- items_orden
- pagos

---

## Flujo de trabajo para cambios futuros

Cada vez que modifiques un modelo en `app/models/`:

1. **Genera la migración:**
   ```bash
   alembic revision --autogenerate -m "descripcion_del_cambio"
   ```
   Ejemplo: `alembic revision --autogenerate -m "add_telefono_to_usuario"`

2. **Revisa el archivo generado** en `alembic/versions/`

3. **Aplica la migración:**
   ```bash
   alembic upgrade head
   ```

4. **Haz commit del archivo de migración:**
   ```bash
   git add alembic/versions/*.py
   git commit -m "migration: descripcion_del_cambio"
   ```

---

## Comandos útiles de Alembic

| Comando | Descripción |
|---------|-------------|
| `alembic current` | Muestra la revisión actual de la BD |
| `alembic history` | Lista todas las migraciones disponibles |
| `alembic upgrade head` | Aplica todas las migraciones pendientes |
| `alembic downgrade -1` | Revierte la última migración |
| `alembic downgrade <revision>` | Revierte hasta una revisión específica |
| `alembic stamp head` | Marca la BD como actualizada sin ejecutar SQL (solo si ya existe el esquema manualmente) |

---

## Caso de uso real: servidor nuevo

Sin Alembic:
1. Clonas el repo ❌
2. Configuras `.env` ❌
3. ?????? (no hay instrucciones de cómo crear las tablas) ❌
4. Intentas arrancar el backend → falla con errores de "tabla no existe" ❌
5. Pasas 2 horas intentando crear las tablas manualmente desde los modelos ❌

Con Alembic:
1. Clonas el repo ✅
2. Configuras `.env` ✅
3. Ejecutas `alembic upgrade head` ✅
4. Arrancas el backend → funciona perfecto ✅
5. Total: 5 minutos ✅

---

## ¿Cuándo ejecutar la migración inicial?

**Ahora mismo.** En cuanto:
- Tengas la BD de Supabase creada
- Tengas `DATABASE_URL` en el `.env`
- Estés listo para empezar a agregar datos de prueba

No esperes a producción. Las migraciones se crean en desarrollo y se aplican en todos los ambientes (dev → staging → producción).

---

## Ejemplo de una migración generada

```python
"""initial_schema

Revision ID: abc123def456
Create Date: 2026-06-10 15:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'abc123def456'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Crear tabla usuarios
    op.create_table('usuarios',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('nombre', sa.String(length=100), nullable=False),
        # ... resto de columnas
        sa.PrimaryKeyConstraint('id')
    )
    # ... resto de tablas


def downgrade():
    # Borrar todas las tablas en orden inverso
    op.drop_table('pagos')
    op.drop_table('items_orden')
    op.drop_table('ordenes')
    # ... resto de tablas
    op.drop_table('usuarios')
```

---

## Checklist antes de aplicar migraciones en producción

- [ ] Todas las migraciones aplicadas y probadas en desarrollo
- [ ] Todas las migraciones aplicadas y probadas en staging
- [ ] Backup completo de la BD de producción
- [ ] Plan de rollback documentado
- [ ] Ventana de mantenimiento programada (si la migración es heavy)
- [ ] Logs de la migración guardados para auditoría

---

**Documentación oficial de Alembic:** https://alembic.sqlalchemy.org/en/latest/tutorial.html

