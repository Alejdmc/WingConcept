#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
# WingConcept Backend — Script de Inicialización de Migraciones Alembic
# ══════════════════════════════════════════════════════════════════════════════

set -e  # Exit on error

echo "════════════════════════════════════════════════════════════"
echo "   WingConcept — Inicialización de Migraciones Alembic"
echo "════════════════════════════════════════════════════════════"
echo ""

# ── Verificar que estamos en la carpeta correcta
if [ ! -f "alembic.ini" ]; then
    echo "❌ ERROR: Este script debe ejecutarse desde /backend"
    echo "   Uso: cd backend && bash scripts/init_migration.sh"
    exit 1
fi

# ── Verificar que existe .env
if [ ! -f ".env" ]; then
    echo "❌ ERROR: No se encontró el archivo .env"
    echo "   1. Copia .env.example a .env"
    echo "   2. Configura DATABASE_URL con tu BD de Supabase"
    echo "   3. Ejecuta este script nuevamente"
    exit 1
fi

# ── Verificar que DATABASE_URL está configurado
source .env
if [ -z "$DATABASE_URL" ] || [[ "$DATABASE_URL" == *"[PASSWORD]"* ]] || [[ "$DATABASE_URL" == *"[PROJECT_ID]"* ]]; then
    echo "❌ ERROR: DATABASE_URL no está configurado correctamente en .env"
    echo "   Debe ser algo como:"
    echo "   DATABASE_URL=postgresql+asyncpg://postgres:TU_PASSWORD@db.tu-project.supabase.co:5432/postgres"
    exit 1
fi

echo "✅ Archivo .env encontrado"
echo "✅ DATABASE_URL configurado"
echo ""

# ── Verificar si ya existe una migración
VERSIONS_DIR="alembic/versions"
MIGRATION_COUNT=$(find "$VERSIONS_DIR" -name "*.py" ! -name "__pycache__" 2>/dev/null | wc -l | tr -d ' ')

if [ "$MIGRATION_COUNT" -gt 0 ]; then
    echo "⚠️  Ya existen $MIGRATION_COUNT migración(es) en $VERSIONS_DIR"
    echo ""
    read -p "¿Deseas generar una nueva migración? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Operación cancelada"
        exit 0
    fi
fi

# ── Generar la migración
echo ""
echo "📝 Generando migración inicial..."
echo "   (esto puede tomar unos segundos mientras conecta a Supabase)"
echo ""

alembic revision --autogenerate -m "initial_schema"

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Falló la generación de la migración"
    echo "   Verifica que DATABASE_URL sea correcto y que Supabase esté accesible"
    exit 1
fi

echo ""
echo "✅ Migración generada exitosamente"
echo ""

# ── Listar archivos de migración
LATEST_MIGRATION=$(find "$VERSIONS_DIR" -name "*.py" ! -name "__init__.py" -type f -exec ls -t {} + | head -n 1)

if [ -z "$LATEST_MIGRATION" ]; then
    echo "❌ ERROR: No se encontró el archivo de migración generado"
    exit 1
fi

echo "📄 Archivo de migración:"
echo "   $LATEST_MIGRATION"
echo ""

# ── Mostrar preview de la migración
echo "════════════════════════════════════════════════════════════"
echo "PREVIEW DE LA MIGRACIÓN"
echo "════════════════════════════════════════════════════════════"
head -n 50 "$LATEST_MIGRATION"
echo ""
echo "   [...resto del archivo...]"
echo "════════════════════════════════════════════════════════════"
echo ""

# ── Preguntar si aplicar
read -p "¿Deseas aplicar esta migración a la BD ahora? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "ℹ️  Migración generada pero NO aplicada"
    echo "   Para aplicarla manualmente ejecuta:"
    echo "   $ alembic upgrade head"
    echo ""
    exit 0
fi

# ── Aplicar la migración
echo ""
echo "⚡ Aplicando migración a la base de datos..."
echo ""

alembic upgrade head

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ ERROR: Falló la aplicación de la migración"
    echo "   Verifica los errores arriba"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ ¡MIGRACIÓN APLICADA EXITOSAMENTE!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🎉 Tu base de datos ahora tiene el esquema completo de WingConcept"
echo ""
echo "📊 Próximos pasos:"
echo "   1. Verifica las tablas en Supabase → Table Editor"
echo "   2. Opcional: Ejecuta seed_data.py para datos de prueba:"
echo "      $ python scripts/seed_data.py"
echo "   3. Inicia el backend:"
echo "      $ uvicorn app.main:app --reload"
echo ""
echo "📚 Documentación: Lee ALEMBIC_SETUP.md para más detalles"
echo ""

