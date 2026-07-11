#!/bin/sh
set -e

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  if [ -n "${DATABASE_URL}" ]; then
    echo "==> Ejecutando migraciones Alembic..."
    alembic upgrade head
  else
    echo "==> WARN: DATABASE_URL no definido — migraciones omitidas"
  fi
fi

echo "==> Iniciando aplicación..."
exec "$@"
