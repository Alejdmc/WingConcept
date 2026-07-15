#!/usr/bin/env bash
# ============================================================
# WingConcept — Despliegue gratuito (un solo servidor + Docker)
#
# Requisitos: Ubuntu 22.04+, Docker, dominio apuntando al servidor
# Costo: $0 (Oracle Cloud Free Tier, Let's Encrypt, Supabase free)
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

DOMAIN="${DOMAIN:-wingconcept.com}"
EMAIL="${CERTBOT_EMAIL:-admin@wingconcept.com}"
COMPOSE="docker compose --env-file ../backend/.env -f docker-compose.yml -f docker-compose.prod.yml"

echo "==> WingConcept deploy — dominio: $DOMAIN"

if [ ! -f ../backend/.env ]; then
  echo "ERROR: Crea backend/.env desde backend/.env.production.example"
  exit 1
fi

if ! grep -q "^REDIS_PASSWORD=.\+" ../backend/.env 2>/dev/null; then
  if [ -z "${REDIS_PASSWORD:-}" ]; then
    echo "ERROR: Define REDIS_PASSWORD en backend/.env o como variable de entorno"
    exit 1
  fi
fi

# ── 1. Bootstrap HTTP (sin SSL) para obtener certificados ─────────────────────
HAS_CERT=false
if $COMPOSE run --rm --entrypoint certbot certbot certificates 2>/dev/null | grep -q "Certificate Name: $DOMAIN"; then
  HAS_CERT=true
fi

if [ "$HAS_CERT" = false ]; then
  echo "==> Primera vez: nginx HTTP (bootstrap) para Certbot..."
  export NGINX_CONF=nginx.bootstrap.conf
  $COMPOSE up -d --build

  echo "==> Esperando servicios..."
  sleep 15

  echo "==> Obteniendo certificado Let's Encrypt..."
  $COMPOSE run --rm --entrypoint certbot certbot certonly --webroot \
    -w /var/www/certbot \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive

  echo "==> Activando nginx con HTTPS..."
  export NGINX_CONF=nginx.conf
  $COMPOSE up -d
else
  echo "==> Certificados existentes — despliegue con HTTPS"
  export NGINX_CONF=nginx.conf
  $COMPOSE up -d --build
fi

echo ""
echo "✅ Despliegue completado"
echo "   Sitio:  https://$DOMAIN"
echo "   API:    https://$DOMAIN/api/v1"
echo "   Health: https://$DOMAIN/health"
echo ""
echo "Comandos útiles:"
echo "  $COMPOSE logs -f"
echo "  $COMPOSE ps"
