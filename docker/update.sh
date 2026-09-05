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
ENV_FILE="$REPO_ROOT/backend/.env"
COMPOSE=(
  docker compose
  --env-file "$ENV_FILE"
  -f "$REPO_ROOT/docker/docker-compose.yml"
  -f "$REPO_ROOT/docker/docker-compose.prod.yml"
)

echo "==> WingConcept update — rama: $BRANCH"

if [ ! -d .git ]; then
  echo "ERROR: No es un repositorio git ($REPO_ROOT)"
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: Falta backend/.env — créalo antes de desplegar"
  exit 1
fi

ENV_BACKUP="$(mktemp)"
cp "$ENV_FILE" "$ENV_BACKUP"
echo "==> .env respaldado temporalmente"

git fetch origin "$BRANCH"

# Descartar edits locales en archivos tracked (hotfixes manuales en VPS)
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "==> Descartando cambios locales en archivos tracked..."
  git reset --hard HEAD
fi

git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

cp "$ENV_BACKUP" "$ENV_FILE"
rm -f "$ENV_BACKUP"
echo "==> .env restaurado"

export NGINX_CONF=nginx.conf

# shellcheck source=lib/cleanup-stale-containers.sh
source "$SCRIPT_DIR/lib/cleanup-stale-containers.sh"
cleanup_stale_wingconcept_containers

echo "==> Reconstruyendo backend (requerido para migraciones nuevas)..."
"${COMPOSE[@]}" build backend

echo "==> Migraciones Alembic..."
"${COMPOSE[@]}" run --rm --no-deps --entrypoint alembic backend upgrade head

# shellcheck source=lib/run-seeds.sh
source "$SCRIPT_DIR/lib/run-seeds.sh"

echo "==> Reconstruyendo y levantando servicios (sin tocar nginx)..."
"${COMPOSE[@]}" up -d --build backend frontend redis certbot

echo "==> Invalidando caché Redis (productos)..."
if docker inspect wingconcept_backend >/dev/null 2>&1; then
  "${COMPOSE[@]}" exec -T backend python3 -c \
    "from scripts.bootstrap import invalidate_product_cache; invalidate_product_cache()" \
    || echo "  ℹ Caché no invalidada (Redis aún iniciando — expira sola en ~5 min)"
fi

if docker inspect wingconcept_nginx >/dev/null 2>&1; then
  # shellcheck source=lib/reconnect-nginx-network.sh
  source "$SCRIPT_DIR/lib/reconnect-nginx-network.sh"
  echo "==> nginx en producción — reconectar red + reload suave..."
  reload_wingconcept_nginx
else
  echo "==> nginx no existe — creando..."
  "${COMPOSE[@]}" up -d nginx
fi

echo "==> Verificando salud (hasta 120s)..."
ok=false
for i in $(seq 1 24); do
  live=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 3 --max-time 5 http://127.0.0.1/health 2>/dev/null || echo "000")
  api=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 3 --max-time 15 http://127.0.0.1/api/v1/productos/destacados 2>/dev/null || echo "000")
  home=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 3 --max-time 20 http://127.0.0.1/ 2>/dev/null || echo "000")
  echo "  [$i/24] live=$live api=$api home=$home"
  if [ "$live" = "200" ] && [ "$api" = "200" ] && [ "$home" = "200" ]; then
    ok=true
    break
  fi
  sleep 5
done

echo ""
"${COMPOSE[@]}" ps

if [ "$ok" = true ]; then
  echo ""
  echo "✅ Update completado — sitio respondiendo"
else
  echo ""
  echo "⚠️  Update desplegado pero el sitio no respondió OK"
  echo "   Ejecuta: bash docker/diagnose.sh --restart"
  exit 1
fi
