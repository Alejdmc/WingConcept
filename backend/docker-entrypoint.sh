#!/bin/sh
set -e

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  if [ -n "${DATABASE_URL}" ]; then
    echo "==> Ejecutando migraciones Alembic..."
    if ! alembic upgrade head; then
      echo "ERROR: Alembic falló. Revisa DATABASE_URL y los logs arriba."
      echo "       Para omitir migraciones temporalmente: RUN_MIGRATIONS=false"
      exit 1
    fi
  else
    echo "==> WARN: DATABASE_URL no definido — migraciones omitidas"
  fi
fi

echo "==> Iniciando aplicación..."
exec "$@"
