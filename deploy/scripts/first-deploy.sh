#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# first-deploy.sh — Primer despliegue en servidor limpio
# Uso: chmod +x first-deploy.sh && ./first-deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

DOMAIN="${DOMAIN:-mercadoproductor.com}"
EMAIL="${CERTBOT_EMAIL:-admin@mercadoproductor.com}"

echo "▶  Verificando .env..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠  Copia .env.example → .env y rellena las variables antes de continuar"
  exit 1
fi

echo "▶  Arrancando postgres y redis..."
docker compose -f docker-compose.prod.yml up -d postgres redis
sleep 5

echo "▶  Obteniendo certificado SSL (Certbot)..."
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  -d "admin.$DOMAIN" \
  -d "productores.$DOMAIN"

echo "▶  Ejecutando migraciones..."
docker compose -f docker-compose.prod.yml run --rm db-migrate

echo "▶  Arrancando todos los servicios..."
docker compose -f docker-compose.prod.yml up -d

echo "✅  Despliegue completado"
echo ""
echo "  Storefront:  https://$DOMAIN"
echo "  Admin:       https://admin.$DOMAIN"
echo "  Productores: https://productores.$DOMAIN"
