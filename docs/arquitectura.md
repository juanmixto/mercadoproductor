# Arquitectura del sistema

## Diagrama de servicios

```
                        Internet
                           │
                    ┌──────▼──────┐
                    │    Nginx    │  (producción)
                    │  + Certbot  │
                    └──────┬──────┘
              ┌────────────┼────────────┐
              │            │            │
        :3000 │      :3001 │      :3002 │
         ┌────▼────┐  ┌────▼────┐  ┌───▼─────┐
         │  Web    │  │  Admin  │  │ Vendor  │
         │Next.js  │  │Next.js  │  │Next.js  │
         └────┬────┘  └────┬────┘  └───┬─────┘
              └────────────┼────────────┘
                           │ HTTP / fetch
                    ┌──────▼──────┐
                    │   API :4000 │
                    │  Express.js │
                    │  + Prisma   │
                    └──────┬──────┘
              ┌────────────┴────────────┐
         ┌────▼────┐              ┌─────▼────┐
         │Postgres │              │  Redis   │
         │  :5432  │              │  :6379   │
         └─────────┘              └──────────┘
```

## Flujo de una petición

### Server-side (Next.js → API)
```
Browser → Next.js Server → fetch(API:4000) → Prisma → PostgreSQL
                                                     ← datos
                        ← HTML renderizado
Browser ← HTML ←────────────────────────────────────
```

### Client-side (TanStack Query → API)
```
Browser → TanStack Query → fetch(API:4000/api/v1/...) → Prisma → PostgreSQL
                                                                ← JSON
        ← React re-render ← state update ← JSON ←─────────────
```

## Autenticación y autorización

```
POST /api/v1/auth/login
  └─► Valida credenciales
  └─► Genera JWT firmado con JWT_SECRET
  └─► Responde { user, token }

Petición autenticada:
  Header: Authorization: Bearer <token>
  └─► middleware authenticate() decodifica JWT
  └─► req.user = { id, email, role }
  └─► middleware isAdmin() / isVendor() verifica rol
```

### Roles del sistema

| Rol | Acceso |
|-----|--------|
| `CUSTOMER` | Tienda, carrito, pedidos propios |
| `VENDOR` | Portal productor, sus productos y pedidos |
| `ADMIN_SUPPORT` | Incidencias y atención al cliente |
| `ADMIN_CATALOG` | Revisión y moderación de productos |
| `ADMIN_FINANCE` | Liquidaciones y finanzas |
| `ADMIN_OPS` | Operaciones y logística |
| `SUPERADMIN` | Acceso total |

## Modelo de dominio simplificado

```
User ──────────────── Vendor
 │                      │
 │                      ├── Product ─── ProductVariant
 │                      │       │
 │                      │       └── StockMovement
 │                      │
 ├── Cart ─── CartItem  ├── VendorFulfillment
 │                      │
 └── Order ─────────────┘
       │
       ├── OrderLine ── Payment
       │                  └── Refund
       ├── OrderEvent
       │
       └── Incident ─── IncidentMessage
                    └── IncidentRefund

Settlement ─── SettlementLine ─── SettlementAdjustment
```

## Comunicación entre frontends y API

Los tres frontends (web, admin, vendor) se comunican con la misma API:

**Web (Next.js):**
- Rutas de catálogo: `serverFetch()` — SSR con revalidación cada 60s
- Acciones del usuario: `apiClient` (axios) con token JWT en header
- Estado del carrito: Zustand persistido en localStorage

**Admin / Vendor (Next.js):**
- Todo via TanStack Query + axios (`adminApi` / `vendorApi`)
- Token JWT inyectado automáticamente en interceptor axios
- Refetch automático cada 60s para datos en tiempo real

## Estructura de respuestas API

```typescript
// Éxito singular
{ success: true, data: T }

// Éxito plural/paginado
{ success: true, data: T[], meta: {
    total: number, page: number, limit: number,
    totalPages: number, hasNext: boolean, hasPrev: boolean
}}

// Error
{ success: false, error: { code: string, message: string, details?: any }}
```

## Pipeline de CI/CD (Turborepo)

```json
// turbo.json
{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**"] },
    "dev":   { "cache": false, "persistent": true },
    "lint":  {}
  }
}
```

El orden de build garantizado es:
```
packages/shared → packages/db → apps/*
```
