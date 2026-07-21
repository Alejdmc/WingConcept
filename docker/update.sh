#!/usr/bin/env bash
# ============================================================
# WingConcept — Actualizar VPS desde git (production)
# Preserva backend/.env y descarta cambios locales en código tracked.
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

BRANCH="${DEPLOY_BRANCH:-production}"
COMPOSE="docker compose --env-file backend/.env -f docker/docker-compose.yml -f docker/docker-compose.prod.yml"

echo "==> WingConcept update — rama: $BRANCH"

if [ ! -d .git ]; then
  echo "ERROR: No es un repositorio git ($REPO_ROOT)"
  exit 1
fi

if [ ! -f backend/.env ]; then
  echo "ERROR: Falta backend/.env — créalo antes de desplegar"
  exit 1
fi

ENV_BACKUP="$(mktemp)"
cp backend/.env "$ENV_BACKUP"
echo "==> .env respaldado temporalmente"

git fetch origin "$BRANCH"

# Descartar edits locales en archivos tracked (hotfixes manuales en VPS)
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "==> Descartando cambios locales en archivos tracked..."
  git reset --hard HEAD
fi

git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

cp "$ENV_BACKUP" backend/.env
rm -f "$ENV_BACKUP"
echo "==> .env restaurado"

cd docker
export NGINX_CONF=nginx.conf

echo "==> Reconstruyendo y levantando servicios..."
$COMPOSE up -d --build

echo ""
echo "✅ Update completado"
$COMPOSE ps
