#!/usr/bin/env bash
# ============================================================
# WingConcept — Diagnóstico y recuperación rápida en VPS
# Uso: bash docker/diagnose.sh [--restart]
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

ENV_FILE="$REPO_ROOT/backend/.env"
COMPOSE=(
  docker compose
  --env-file "$ENV_FILE"
  -f "$REPO_ROOT/docker/docker-compose.yml"
  -f "$REPO_ROOT/docker/docker-compose.prod.yml"
)
RESTART=false

if [[ "${1:-}" == "--restart" ]]; then
  RESTART=true
fi

echo "==> WingConcept diagnose — $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo ""

echo "── Recursos del host ──"
free -h 2>/dev/null || true
df -h / /var/lib/docker 2>/dev/null || df -h /
echo ""

echo "── Puertos 80/443 ──"
ss -tlnp 2>/dev/null | grep -E ':80|:443' || echo "⚠️  80/443 NO escuchando — nginx probablemente caído"
echo ""

echo "── Estado Docker ──"
export NGINX_CONF=nginx.conf
"${COMPOSE[@]}" ps 2>/dev/null || { echo "ERROR: docker compose ps falló"; exit 1; }
echo ""

echo "── Health interno ──"
for url in \
  "http://127.0.0.1/health" \
  "http://127.0.0.1/health/ready" \
  "http://127.0.0.1/api/v1/productos/destacados" \
  "http://127.0.0.1/"
do
  code=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 15 "$url" 2>/dev/null || echo "000")
  echo "  $url → HTTP $code"
done
echo ""

echo "── Últimos logs (backend) ──"
"${COMPOSE[@]}" logs --tail=30 backend 2>/dev/null || true
echo ""

echo "── Últimos logs (frontend) ──"
"${COMPOSE[@]}" logs --tail=20 frontend 2>/dev/null || true
echo ""

echo "── Últimos logs (nginx) ──"
"${COMPOSE[@]}" logs --tail=15 nginx 2>/dev/null || true
echo ""

if $RESTART; then
  echo "==> Reiniciando stack..."
  export NGINX_CONF=nginx.conf
  # shellcheck source=lib/cleanup-stale-containers.sh
  source "$SCRIPT_DIR/lib/cleanup-stale-containers.sh"
  cleanup_stale_wingconcept_containers
  "${COMPOSE[@]}" up -d --build
  "${COMPOSE[@]}" up -d --force-recreate nginx
  echo "==> Esperando servicios (90s max)..."
  for i in $(seq 1 18); do
    live=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 3 --max-time 5 http://127.0.0.1/health 2>/dev/null || echo "000")
    api=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 3 --max-time 10 http://127.0.0.1/api/v1/productos/destacados 2>/dev/null || echo "000")
    home=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 3 --max-time 15 http://127.0.0.1/ 2>/dev/null || echo "000")
    echo "  intento $i: live=$live api=$api home=$home"
    if [[ "$live" == "200" && "$api" == "200" && "$home" == "200" ]]; then
      echo "✅ Stack recuperado"
      exit 0
    fi
    sleep 5
  done
  echo "⚠️  El stack no respondió OK — revisa logs arriba"
  exit 1
fi

echo "Tip: bash docker/diagnose.sh --restart"
