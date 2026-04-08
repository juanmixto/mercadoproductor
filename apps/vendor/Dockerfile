# ═══════════════════════════════════════════════════════════
# apps/vendor/Dockerfile — Portal del productor
# Contexto de build: raíz del monorepo
# ═══════════════════════════════════════════════════════════

FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY packages/shared/package.json  ./packages/shared/
COPY apps/vendor/package.json       ./apps/vendor/

RUN npm ci --ignore-scripts

# ── Builder ──────────────────────────────────────────────────
FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules               ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/apps/vendor/node_modules   ./apps/vendor/node_modules

COPY tsconfig.base.json ./
COPY packages/shared    ./packages/shared
COPY apps/vendor        ./apps/vendor

ARG API_URL=http://api:4000
ENV API_URL=$API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN cd apps/vendor && npm run build

# ── Runner ───────────────────────────────────────────────────
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/vendor/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/vendor/.next/static     ./apps/vendor/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/vendor/public           ./apps/vendor/public 2>/dev/null || true

USER nextjs
EXPOSE 3002
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3002 || exit 1

CMD ["node", "apps/vendor/server.js"]
