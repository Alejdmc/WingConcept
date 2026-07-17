#!/usr/bin/env bash
# ============================================================
# WingConcept — Arrancar stack en Mac (sin SSL local)
# Cloudflare Tunnel termina HTTPS → localhost:80
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f ../backend/.env ]; then
  echo "ERROR: Crea backend/.env (copia desde backend/.env.production.example)"
  exit 1
fi

export NGINX_CONF=nginx.bootstrap.conf

echo "==> Construyendo y levantando Docker (nginx HTTP :80)..."
docker compose --env-file ../backend/.env \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  up -d --build

echo ""
echo "✅ Stack local listo en http://localhost:80"
echo ""
echo "Prueba:"
echo "  curl -s http://localhost/health"
echo ""
echo "Siguiente paso — Cloudflare Tunnel (en otra terminal):"
echo "  cloudflared tunnel run wingconcept"
echo ""
echo "Sitio: https://wingconcept.com (requiere cloudflared + DNS)"
