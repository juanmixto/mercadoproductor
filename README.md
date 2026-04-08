# Mercado Productor

Marketplace multi-vendedor para pequeños productores locales. Compra directa del campo a la mesa, sin intermediarios.

[![Stack](https://img.shields.io/badge/stack-Next.js%2014%20%7C%20Express%20%7C%20PostgreSQL-informational)](.)
[![License](https://img.shields.io/badge/license-MIT-green)](.)

---

## Índice

- [Visión general](#visión-general)
- [Arquitectura](#arquitectura)
- [Inicio rápido](#inicio-rápido)
- [Apps y puertos](#apps-y-puertos)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos](#base-de-datos)
- [API REST](#api-rest)
- [UX por rol](#ux-por-rol)
- [Docker](#docker)
- [Despliegue en producción](#despliegue-en-producción)
- [Estructura del proyecto](#estructura-del-proyecto)

---

## Visión general

| App | Descripción | Puerto |
|-----|-------------|--------|
| **Web** (`apps/web`) | Tienda pública para compradores | 3000 |
| **Admin** (`apps/admin`) | Panel de administración operacional | 3001 |
| **Vendor** (`apps/vendor`) | Portal del productor | 3002 |
| **API** (`apps/api`) | API REST central (Express + Prisma) | 4000 |

**Stack principal:**
- Frontend: Next.js 14 (App Router), TailwindCSS, TanStack Query
- Backend: Express.js, TypeScript, Prisma ORM
- Base de datos: PostgreSQL 16
- Caché: Redis 7
- Monorepo: npm workspaces + Turborepo

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                        Navegador                        │
├──────────────┬──────────────────┬───────────────────────┤
│  apps/web    │   apps/admin     │   apps/vendor         │
│  :3000       │   :3001          │   :3002               │
│  Comprador   │   Administrador  │   Productor           │
└──────┬───────┴────────┬─────────┴──────────┬────────────┘
       │                │                    │
       └────────────────▼────────────────────┘
                    apps/api :4000
                 (Express + Prisma + JWT)
                        │
              ┌─────────┴──────────┐
              │                    │
         PostgreSQL            Redis
          :5432                :6379
```

### Paquetes compartidos

| Paquete | Contenido |
|---------|-----------|
| `packages/db` | Cliente Prisma + schema + seed |
| `packages/shared` | Enums tipados compartidos entre API y frontends |

---

## Inicio rápido

### Prerrequisitos

- Node.js 18+
- Docker y Docker Compose
- npm 9+

### 1. Clonar e instalar

```bash
git clone https://github.com/juanmixto/mercadoproductor.git
cd mercadoproductor
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example apps/api/.env
# Editar apps/api/.env con tus valores
```

### 3. Levantar infraestructura

```bash
# Solo base de datos y Redis
docker-compose up -d postgres redis

# Esperar que estén healthy
docker-compose ps
```

### 4. Migrar y sembrar la base de datos

```bash
npm run db:migrate
npm run db:seed    # datos de demo
```

### 5. Arrancar en desarrollo

```bash
npm run dev
# Arranca los 4 servicios en paralelo (Turborepo)
```

O individualmente:

```bash
npm run dev --workspace=apps/api
npm run dev --workspace=apps/web
npm run dev --workspace=apps/admin
npm run dev --workspace=apps/vendor
```

### 6. Acceder

| App | URL |
|-----|-----|
| Tienda | http://localhost:3000 |
| Admin | http://localhost:3001 |
| Portal productor | http://localhost:3002 |
| API | http://localhost:4000 |
| Adminer (DB) | http://localhost:8080 |

**Credenciales de demo:**

| Rol | Email | Contraseña |
|-----|-------|------------|
| Cliente | `cliente@test.com` | `cliente1234` |
| Productor | `productor@test.com` | `productor1234` |
| Admin | `admin@mercadoproductor.com` | `admin1234` |

---

## Apps y puertos

### Web — Tienda (`:3000`)

Storefront público para compradores. Server-side rendering con Next.js 14 App Router.

**Rutas principales:**

| Ruta | Descripción |
|------|-------------|
| `/` | Home: hero, categorías, productos destacados, productores |
| `/productos` | Catálogo con filtros (categoría, certificación, orden) |
| `/productos/[slug]` | Detalle de producto |
| `/productores` | Listado de productores |
| `/productores/[slug]` | Perfil de productor |
| `/carrito` | Carrito de compra |
| `/checkout` | Proceso de pago |
| `/auth/login` | Inicio de sesión |
| `/auth/register` | Registro de cuenta |
| `/cuenta` | Área personal |
| `/cuenta/pedidos` | Historial de pedidos |

### Admin — Panel (`localhost:3001`)

Panel operacional para administradores. Requiere autenticación con rol `ADMIN_*` o `SUPERADMIN`.

**Rutas:**

| Ruta | Descripción |
|------|-------------|
| `/dashboard` | Vista general: alertas, KPIs, colas de trabajo |
| `/pedidos` | Gestión de pedidos con filtros y paginación |
| `/productores` | Aprobación, suspensión y gestión de productores |
| `/productos` | Cola de revisión del catálogo |
| `/liquidaciones` | Generación y aprobación de liquidaciones |
| `/incidencias` | Resolución de reclamaciones con seguimiento SLA |
| `/informes` | Informes y métricas |

### Vendor — Portal Productor (`localhost:3002`)

Portal para productores registrados. Requiere autenticación con rol `VENDOR`.

**Rutas:**

| Ruta | Descripción |
|------|-------------|
| `/dashboard` | Resumen: ingresos, pedidos urgentes, checklist onboarding |
| `/pedidos` | Gestión del fulfillment con pipeline de estados |
| `/catalogo` | CRUD de productos con alertas de stock |
| `/liquidaciones` | Historial de liquidaciones y cobros |
| `/perfil` | Configuración pública y operacional |

---

## Variables de entorno

Crear `apps/api/.env` basado en `.env.example`:

```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/mercadoproductor"

# JWT
JWT_SECRET="secreto-muy-seguro"
JWT_EXPIRES_IN="7d"

# App
NODE_ENV="development"
API_PORT=4000
API_URL="http://localhost:4000"
WEB_URL="http://localhost:3000"
ADMIN_URL="http://localhost:3001"
VENDOR_URL="http://localhost:3002"

# Stripe (pagos)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@mercadoproductor.com"

# Almacenamiento (Cloudflare R2 / S3-compatible)
STORAGE_ENDPOINT=""
STORAGE_ACCESS_KEY=""
STORAGE_SECRET_KEY=""
STORAGE_BUCKET="mercadoproductor"
STORAGE_PUBLIC_URL=""
```

---

## Base de datos

### Modelos (36 tablas)

#### Identidad y Autenticación
| Modelo | Descripción |
|--------|-------------|
| `User` | Usuarios del sistema (clientes, productores, admins) |
| `UserSession` | Sesiones JWT activas |

#### Catálogo
| Modelo | Descripción |
|--------|-------------|
| `Vendor` | Perfil del productor / tienda |
| `VendorDocument` | Documentos de verificación del productor |
| `VendorEvent` | Historial de cambios de estado del productor |
| `Category` | Categorías de productos |
| `Product` | Productos del catálogo |
| `ProductVariant` | Variantes (talla, peso, formato...) |
| `ProductReview` | Valoraciones de productos |
| `StockMovement` | Historial de movimientos de stock |

#### Compra y Pedidos
| Modelo | Descripción |
|--------|-------------|
| `Cart` | Carrito activo del usuario |
| `CartItem` | Líneas del carrito |
| `CustomerAddress` | Direcciones de entrega del cliente |
| `Order` | Pedido completo multi-vendedor |
| `OrderLine` | Línea de pedido por producto |
| `OrderEvent` | Historial de eventos del pedido |
| `OrderCounter` | Secuencia de numeración de pedidos |
| `VendorFulfillment` | Estado de preparación por productor |
| `Wishlist` / `WishlistItem` | Lista de deseos |

#### Pagos
| Modelo | Descripción |
|--------|-------------|
| `Payment` | Registro de transacción de pago |
| `Refund` | Devoluciones |

#### Promociones
| Modelo | Descripción |
|--------|-------------|
| `Coupon` | Cupones de descuento |
| `CouponUsage` | Usos de cupones por usuario |

#### Logística
| Modelo | Descripción |
|--------|-------------|
| `ShippingZone` | Zonas de envío |
| `ShippingRate` | Tarifas de envío por zona |

#### Finanzas
| Modelo | Descripción |
|--------|-------------|
| `CommissionRule` | Reglas de comisión por vendedor/categoría |
| `Settlement` | Liquidación periódica a productores |
| `SettlementLine` | Detalle de líneas de la liquidación |
| `SettlementAdjustment` | Ajustes manuales en liquidación |

#### Incidencias
| Modelo | Descripción |
|--------|-------------|
| `Incident` | Reclamación o disputa |
| `IncidentMessage` | Mensajes del hilo de la incidencia |
| `IncidentRefund` | Devolución asociada a incidencia |

#### Sistema
| Modelo | Descripción |
|--------|-------------|
| `AuditLog` | Log de auditoría de acciones críticas |
| `Notification` | Notificaciones en-app |
| `MarketplaceConfig` | Configuración global del marketplace |

### Comandos de base de datos

```bash
# Generar cliente Prisma
npm run db:generate

# Aplicar migraciones
npm run db:migrate

# Abrir Prisma Studio (interfaz visual)
npm run db:studio

# Resetear y resembrar (solo desarrollo)
npm run db:seed
```

---

## API REST

Base URL: `http://localhost:4000/api/v1`

Respuesta estándar:
```json
{
  "success": true,
  "data": { ... }
}
```

Respuesta paginada:
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Autenticación

```http
Authorization: Bearer <jwt_token>
```

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/auth/register` | POST | ❌ | Registro de cuenta |
| `/auth/login` | POST | ❌ | Inicio de sesión → devuelve JWT |
| `/auth/me` | GET | ✅ | Usuario autenticado actual |

**Registro:**
```json
POST /api/v1/auth/register
{
  "email": "usuario@email.com",
  "password": "min8chars",
  "firstName": "Juan",
  "lastName": "García",
  "phone": "+34612345678"
}
```

**Login:**
```json
POST /api/v1/auth/login
{
  "email": "usuario@email.com",
  "password": "contraseña"
}
```

---

### Productos

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/products` | GET | ❌ | Listado con filtros y paginación |
| `/products/:slug` | GET | ❌ | Detalle de producto por slug |
| `/products` | POST | ✅ Vendor | Crear producto |
| `/products/:id` | PATCH | ✅ Vendor | Actualizar producto |
| `/products/:id/review` | PATCH | ✅ Admin | Aprobar/rechazar producto |

**Query params GET `/products`:**
```
?categoria=frutas-verduras
&buscar=tomate
&cert=ECO-ES
&orden=price_asc|price_desc|newest
&pagina=1
&limit=20
```

---

### Vendedores / Productores

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/vendors` | GET | ❌ | Listado público de productores activos |
| `/vendors/:slug` | GET | ❌ | Perfil público del productor |
| `/vendors/apply` | POST | ✅ | Solicitar ser productor |
| `/vendors/me` | GET | ✅ Vendor | Mi perfil de productor |
| `/vendors/me` | PATCH | ✅ Vendor | Actualizar mi perfil |
| `/vendors/admin/list` | GET | ✅ Admin | Listado admin con filtro por estado |
| `/vendors/:id/status` | PATCH | ✅ Admin | Cambiar estado del productor |

---

### Carrito

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/cart` | GET | ✅ | Ver carrito actual |
| `/cart/items` | POST | ✅ | Añadir producto al carrito |
| `/cart/items/:itemId` | PATCH | ✅ | Actualizar cantidad |
| `/cart/items/:itemId` | DELETE | ✅ | Eliminar ítem |

---

### Pedidos

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/orders` | POST | ✅ | Crear pedido desde carrito |
| `/orders` | GET | ✅ Admin | Listado de todos los pedidos |
| `/orders/me` | GET | ✅ | Mis pedidos |
| `/orders/:id` | GET | ✅ | Detalle de pedido |
| `/orders/:id/fulfillments/:fId` | PATCH | ✅ Vendor | Actualizar estado fulfillment |
| `/orders/:id/events` | POST | ✅ Admin | Registrar evento de pedido |

---

### Incidencias

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/incidents` | POST | ✅ | Abrir incidencia |
| `/incidents` | GET | ✅ Admin | Listado de incidencias |
| `/incidents/:id/messages` | POST | ✅ | Añadir mensaje al hilo |
| `/incidents/:id/resolve` | PATCH | ✅ Admin | Resolver incidencia |

---

### Liquidaciones

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/settlements/me` | GET | ✅ Vendor | Mis liquidaciones |
| `/settlements/generate` | POST | ✅ Admin | Generar liquidación para un productor |
| `/settlements/:id/approve` | PATCH | ✅ SuperAdmin | Aprobar liquidación |
| `/settlements/:id/mark-paid` | PATCH | ✅ Admin | Marcar como pagada |

---

### Admin

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/admin/dashboard` | GET | ✅ Admin | KPIs y métricas generales |
| `/admin/products/pending` | GET | ✅ Admin | Cola de productos por revisar |
| `/admin/incidents/overdue` | GET | ✅ Admin | Incidencias con SLA vencido |

---

## UX por rol

### Comprador — Principios

> **Zero fricción.** Del landing al carrito en 3 clics.

| Pantalla | Acción principal | Principio |
|----------|-----------------|-----------|
| Home | Explorar → añadir al carrito | Trust signals siempre visibles |
| Catálogo | Filtrar → comparar | Filtros en sidebar, sort integrado |
| Producto | Ver → añadir | Foto grande, badges ECO/DOP, stock visible |
| Carrito | Revisar → pagar | Sin sorpresas de precio, agrupación por productor |
| Checkout | Datos → pagar | 1 página, progress claro |
| Cuenta | Ver pedidos | Sin ruido, solo lo necesario |

**Errores evitados:**
- Sin modales innecesarios
- Sin registro obligatorio para explorar
- Sin precios sin IVA oculto
- Sin carrito que desaparece al salir

---

### Productor — Principios

> **Guiado y aprendible.** "¿Qué hago hoy?" siempre claro.

| Pantalla | Acción principal | Principio |
|----------|-----------------|-----------|
| Dashboard | Ver pedidos urgentes | Cola de acciones pendientes al tope |
| Dashboard (nuevo) | Checklist de setup | Onboarding progresivo con pasos claros |
| Pedidos | Confirmar → preparar → enviar | Botón de acción único por estado |
| Catálogo | Gestionar stock | Alertas de stock bajo/agotado |
| Perfil | Completar perfil | Barra de progreso con pasos pendientes |
| Liquidaciones | Ver mis ingresos | Transparencia total del desglose |

**Errores evitados:**
- Sin terminología técnica (no "fulfillment", sino "preparar pedido")
- Sin acciones destructivas sin confirmación
- Sin tablas de datos sin contexto
- Sin información financiera confusa

---

### Administrador — Principios

> **Densidad + control.** Alertas arriba, acción inmediata.

| Pantalla | Acción principal | Principio |
|----------|-----------------|-----------|
| Dashboard | Procesar cola de trabajo | Alertas de alta prioridad al tope |
| Productores | Aprobar/rechazar solicitudes | Modales de confirmación con motivo |
| Productos | Revisar cola pendiente | Vista de detalle sin salir de la lista |
| Pedidos | Monitorizar y filtrar | Tabs de prioridad, highlight de urgentes |
| Incidencias | Resolver con SLA | Indicador de vencimiento, resolución guiada |
| Liquidaciones | Aprobar y pagar | Flujo de aprobación en dos pasos |

**Errores evitados:**
- Sin `prompt()` del navegador (modales propios)
- Sin pérdida de contexto al hacer acciones
- Sin recargas de página innecesarias
- Sin datos desactualizados (refetch automático cada 60s)

---

## Docker

### Desarrollo

```bash
# Levantar todo (bases de datos + apps)
docker-compose up -d

# Solo infraestructura
docker-compose up -d postgres redis

# Ver logs
docker-compose logs -f api
docker-compose logs -f web
```

**Servicios incluidos:**

| Servicio | Puerto | Descripción |
|---------|--------|-------------|
| postgres | 5432 | PostgreSQL 16 |
| redis | 6379 | Redis 7 |
| api | 4000 | API Express |
| web | 3000 | Next.js storefront |
| admin | 3001 | Panel admin |
| vendor | 3002 | Portal productor |
| adminer | 8080 | Interfaz visual de DB |

### Producción

```bash
# Build y despliegue con Nginx + SSL
docker-compose -f docker-compose.prod.yml up -d

# Obtener certificado SSL (primera vez)
docker-compose -f docker-compose.prod.yml run --rm certbot \
  certonly --webroot -w /var/www/certbot \
  -d mercadoproductor.com \
  -d admin.mercadoproductor.com \
  -d productores.mercadoproductor.com \
  --email admin@mercadoproductor.com --agree-tos
```

---

## Despliegue en producción

### Opción A: Docker en VPS

1. Clonar repo en el servidor
2. Copiar `.env.production` con valores reales
3. `docker-compose -f docker-compose.prod.yml up -d`
4. Configurar DNS para los 3 subdominios

**Dominios configurados en Nginx:**
- `mercadoproductor.com` → tienda pública (:3000)
- `admin.mercadoproductor.com` → panel admin (:3001)
- `productores.mercadoproductor.com` → portal vendor (:3002)

### Opción B: Railway / Render

Cada app se puede desplegar como servicio independiente:
- Variables de entorno configuradas en el dashboard
- `DATABASE_URL` apunta a PostgreSQL managed
- `REDIS_URL` apunta a Redis managed

---

## Estructura del proyecto

```
mercadoproductor/
├── apps/
│   ├── api/                    # API Express + TypeScript
│   │   └── src/
│   │       ├── routes/         # Rutas por dominio
│   │       ├── middlewares/    # Auth, errors, validación
│   │       └── utils/          # Helpers de respuesta
│   ├── web/                    # Next.js 14 — Tienda
│   │   └── src/
│   │       ├── app/            # App Router (pages)
│   │       ├── components/     # Header, Footer, ProductCard...
│   │       ├── store/          # Zustand (cart, auth)
│   │       ├── hooks/          # useCart, etc.
│   │       └── lib/            # API client, utils
│   ├── admin/                  # Next.js 14 — Panel admin
│   │   └── src/
│   │       ├── app/            # Dashboard, pedidos, productores...
│   │       └── components/     # AdminSidebar, AdminHeader
│   └── vendor/                 # Next.js 14 — Portal productor
│       └── src/
│           ├── app/            # Dashboard, pedidos, catálogo...
│           └── components/     # VendorSidebar, VendorHeader
├── packages/
│   ├── db/                     # Prisma client + schema + seed
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # 36 modelos
│   │   │   └── migrations/
│   │   └── seed.ts             # Datos de demo
│   └── shared/                 # Tipos y enums compartidos
│       └── src/
│           └── enums/          # OrderStatus, VendorStatus...
├── deploy/
│   └── nginx/                  # Config Nginx + Certbot
├── docker-compose.yml          # Desarrollo
├── docker-compose.prod.yml     # Producción
└── turbo.json                  # Turborepo pipeline
```

---

## Scripts disponibles

```bash
# Desde la raíz del monorepo
npm run dev          # Arranca todas las apps en modo desarrollo
npm run build        # Build de producción de todas las apps
npm run lint         # Lint en todo el monorepo
npm run db:generate  # Regenera el cliente Prisma
npm run db:migrate   # Aplica migraciones pendientes
npm run db:studio    # Abre Prisma Studio
```

---

## Tecnologías

| Categoría | Tecnología |
|-----------|------------|
| Frontend | Next.js 14, React 18, TailwindCSS |
| Backend | Express.js, TypeScript, Zod |
| ORM | Prisma 5 |
| Base de datos | PostgreSQL 16 |
| Caché | Redis 7 |
| Autenticación | JWT (jsonwebtoken) |
| Estado cliente | Zustand (carrito, auth) |
| Datos servidor | TanStack Query v5 |
| Formularios | React Hook Form |
| Iconos | Heroicons |
| Monorepo | Turborepo + npm workspaces |
| Contenerización | Docker + Docker Compose |
| Reverse proxy | Nginx |
| SSL | Certbot / Let's Encrypt |

---

## Licencia

MIT © 2025 Mercado Productor
