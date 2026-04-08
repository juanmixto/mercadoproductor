#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# update.sh — Actualización sin downtime (rolling update)
# Uso: ./update.sh [servicio]  → si no se especifica servicio, actualiza todo
# ─────────────────────────────────────────────────────────────────────────────
set -e

SERVICE="${1:-}"

echo "▶  Pulling latest code..."
git pull origin main

if [ -n "$SERVICE" ]; then
  echo "▶  Rebuilding $SERVICE..."
  docker compose -f docker-compose.prod.yml build "$SERVICE"
  echo "▶  Restarting $SERVICE..."
  docker compose -f docker-compose.prod.yml up -d --no-deps "$SERVICE"
else
  echo "▶  Running migrations..."
  docker compose -f docker-compose.prod.yml run --rm db-migrate

  echo "▶  Rebuilding all services..."
  docker compose -f docker-compose.prod.yml build api web admin vendor

  echo "▶  Restarting services..."
  docker compose -f docker-compose.prod.yml up -d --no-deps api web admin vendor
fi

echo "▶  Cleaning unused images..."
docker image prune -f

echo "✅  Actualización completada"
