# Base de datos

PostgreSQL 16 con Prisma ORM. 36 modelos organizados en 8 dominios.

## Dominios

### 1. Identidad y Autenticación

```
User
  id            cuid()         PK
  email         String         UNIQUE
  passwordHash  String
  firstName     String
  lastName      String
  role          UserRole       CUSTOMER | VENDOR | ADMIN_* | SUPERADMIN
  isActive      Boolean
  emailVerified Boolean
  deletedAt     DateTime?      soft delete

UserSession
  token         String         UNIQUE  (JWT almacenado para revocación)
  expiresAt     DateTime
```

### 2. Catálogo

```
Vendor
  slug          String         UNIQUE  (URL-friendly)
  displayName   String
  status        VendorStatus   APPLYING → PENDING_DOCS → ACTIVE | REJECTED | SUSPENDED_TEMP
  commissionRate Decimal       % que retiene el marketplace
  avgRating     Decimal?
  orderCutoffTime String?      "14:00"
  preparationDays Int?
  iban          String?        datos bancarios para liquidaciones

Product
  slug          String         UNIQUE
  status        ProductStatus  DRAFT → PENDING_REVIEW → ACTIVE | REJECTED | SUSPENDED
  basePrice     Decimal
  taxRate       Decimal        0.04 (4%), 0.1 (10%), 0.21 (21%)
  stock         Int
  trackStock    Boolean
  certifications String[]      ["ECO-ES", "DOP", "KM0"]
  originRegion  String?

ProductVariant
  sku           String         UNIQUE
  priceModifier Decimal        diferencia sobre basePrice
  stock         Int
```

### 3. Pedidos

```
Order
  orderNumber   String         UNIQUE  formato: "MP-2024-001234"
  status        OrderStatus    PLACED → PAYMENT_CONFIRMED → PROCESSING → SHIPPED → DELIVERED
  grandTotal    Decimal        total final con impuestos y envío
  paymentStatus PaymentStatus  PENDING | SUCCEEDED | FAILED | REFUNDED

OrderLine
  quantity      Int
  unitPrice     Decimal        precio en el momento del pedido (snapshot)
  productSnapshot Json         copia completa del producto al momento de compra

VendorFulfillment
  status        FulfillmentStatus  PENDING → CONFIRMED → PREPARING → READY → SHIPPED → DELIVERED
  trackingNumber String?
  carrier       String?
```

### 4. Pagos

```
Payment
  provider      String         "stripe"
  providerRef   String         ID de la transacción en Stripe
  amount        Decimal
  status        PaymentStatus

Refund
  amount        Decimal
  reason        String
  fundedBy      String         "vendor" | "marketplace" | "split"
```

### 5. Finanzas

```
CommissionRule
  vendorId      String?        null = regla global
  categoryId    String?        null = todas las categorías
  type          CommissionType PERCENTAGE | FIXED | TIERED
  rate          Decimal

Settlement
  periodFrom    DateTime
  periodTo      DateTime
  grossSales    Decimal
  commissions   Decimal
  refunds       Decimal
  adjustments   Decimal
  netPayable    Decimal        lo que recibe el productor
  status        SettlementStatus DRAFT → PENDING_APPROVAL → APPROVED → PAID
```

### 6. Incidencias

```
Incident
  type          IncidentType   ITEM_NOT_RECEIVED | ITEM_DAMAGED | WRONG_ITEM | ...
  status        IncidentStatus OPEN → AWAITING_VENDOR/CUSTOMER/ADMIN → RESOLVED
  slaDeadline   DateTime       fecha límite de resolución
  resolution    IncidentResolution? REFUND_FULL | REFUND_PARTIAL | REPLACEMENT | ...
  fundedBy      String?        quién asume el coste

IncidentMessage
  authorRole    String         "customer" | "vendor" | "admin"
  body          String
  attachments   String[]
```

### 7. Logística

```
ShippingZone
  name          String         "Península", "Islas Baleares"...
  provinces     String[]       códigos de provincia

ShippingRate
  minWeight     Decimal?
  maxWeight     Decimal?
  minOrderAmount Decimal?
  price         Decimal
  freeAbove     Decimal?
```

### 8. Sistema

```
AuditLog
  action        String         "VENDOR_STATUS_CHANGED", "ORDER_CANCELLED"...
  entityType    String         "Vendor", "Order"...
  entityId      String
  before        Json?          estado anterior
  after         Json?          estado nuevo
  actorId       String         quién hizo la acción

MarketplaceConfig
  key           String         UNIQUE  "commission_default", "sla_hours"...
  value         Json
  description   String?
```

## Índices clave

```sql
-- Búsqueda de productos
@@index([status, categoryId])
@@index([vendorId, status])

-- Listados de pedidos
@@index([customerId, status])
@@index([status, placedAt])

-- Incidencias por SLA
@@index([status, slaDeadline])

-- Liquidaciones por período
@@index([vendorId, status])
@@index([periodFrom, periodTo])
```

## Convenciones

- **IDs:** CUID (`@default(cuid())`) en todas las tablas
- **Timestamps:** `createdAt` y `updatedAt` en todos los modelos
- **Soft delete:** `deletedAt DateTime?` en User y Product
- **Snapshots:** `productSnapshot Json` en OrderLine para preservar el estado en el momento de la compra
- **Precios:** `Decimal` (no Float) para evitar errores de precisión monetaria
- **Enums:** valores en UPPERCASE para consistencia con Prisma

## Seeds de demo

```bash
npm run db:seed
```

Crea:
- 1 admin (`admin@mercadoproductor.com` / `admin1234`)
- 1 productor (`productor@test.com` / `productor1234`) con 2 productos activos
- 1 cliente (`cliente@test.com` / `cliente1234`)
- Categorías base
- Regla de comisión del 12%
