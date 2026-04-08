# ═══════════════════════════════════════════════════════════
# apps/api/Dockerfile
# Contexto de build: raíz del monorepo
# ═══════════════════════════════════════════════════════════

# ── Dependencias ────────────────────────────────────────────
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copia solo los manifiestos para aprovechar caché de capas
COPY package.json package-lock.json turbo.json ./
COPY packages/shared/package.json  ./packages/shared/
COPY packages/db/package.json       ./packages/db/
COPY apps/api/package.json          ./apps/api/

RUN npm ci --ignore-scripts

# ── Builder ──────────────────────────────────────────────────
FROM node:18-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules        ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/db/node_modules     ./packages/db/node_modules
COPY --from=deps /app/apps/api/node_modules        ./apps/api/node_modules

COPY tsconfig.base.json ./
COPY packages/shared    ./packages/shared
COPY packages/db        ./packages/db
COPY apps/api           ./apps/api

# Genera el cliente de Prisma
RUN cd packages/db && npx prisma generate

# Compila shared primero, luego la API
RUN cd packages/shared && npx tsc
RUN cd apps/api && npx tsc

# ── Runner (producción) ──────────────────────────────────────
FROM node:18-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

# Usuario no-root
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 apiuser
USER apiuser

# Solo lo necesario en producción
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/dist          ./dist
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/package.json  ./package.json
COPY --from=builder --chown=apiuser:nodejs /app/packages/db/generated  ./packages/db/generated
COPY --from=builder --chown=apiuser:nodejs /app/packages/shared/dist   ./packages/shared/dist

# Instala solo dependencias de producción
RUN npm ci --only=production --ignore-scripts

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

CMD ["node", "dist/index.js"]
