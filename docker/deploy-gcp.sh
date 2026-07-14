#!/usr/bin/env bash
# ============================================================
# WingConcept — Despliegue en Google Cloud e2-micro (1 GB RAM)
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

DOMAIN="${DOMAIN:-wingconcept.com}"
EMAIL="${CERTBOT_EMAIL:-admin@wingconcept.com}"
COMPOSE="docker compose --env-file ../backend/.env \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  -f docker-compose.gcp.yml"

echo "==> WingConcept deploy (GCP e2-micro) — dominio: $DOMAIN"

if [ ! -f ../backend/.env ]; then
  echo "ERROR: Crea backend/.env desde backend/.env.production.example"
  exit 1
fi

# Swap recomendado en 1 GB RAM (build de Docker)
if [ "$(swapon --show | wc -l)" -lt 1 ] && [ ! -f /swapfile ]; then
  echo "==> Creando swap 2G (recomendado en e2-micro)..."
  sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

HAS_CERT=false
if $COMPOSE run --rm certbot certificates 2>/dev/null | grep -q "Certificate Name: $DOMAIN"; then
  HAS_CERT=true
fi

if [ "$HAS_CERT" = false ]; then
  echo "==> Primera vez: nginx HTTP (bootstrap)..."
  export NGINX_CONF=nginx.bootstrap.conf
  $COMPOSE up -d --build

  echo "==> Esperando servicios (e2-micro es lento, ~2-3 min)..."
  sleep 30

  echo "==> Certificado Let's Encrypt..."
  $COMPOSE run --rm certbot certonly --webroot \
    -w /var/www/certbot \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive

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
echo "   Health: https://$DOMAIN/health"
