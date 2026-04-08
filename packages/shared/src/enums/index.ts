// Enums alineados con los valores del schema Prisma (UPPERCASE)

// ─── Vendor ───────────────────────────────────────────────────────────────────

export enum VendorStatus {
  APPLYING       = 'APPLYING',
  PENDING_DOCS   = 'PENDING_DOCS',
  ACTIVE         = 'ACTIVE',
  SUSPENDED_TEMP = 'SUSPENDED_TEMP',
  REJECTED       = 'REJECTED',
  DEACTIVATED    = 'DEACTIVATED',
}

// ─── Product ─────────────────────────────────────────────────────────────────

export enum ProductStatus {
  DRAFT          = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  ACTIVE         = 'ACTIVE',
  SUSPENDED      = 'SUSPENDED',
  DISCONTINUED   = 'DISCONTINUED',
  REJECTED       = 'REJECTED',
}

// ─── Order ───────────────────────────────────────────────────────────────────

export enum OrderStatus {
  PLACED               = 'PLACED',
  PAYMENT_PENDING      = 'PAYMENT_PENDING',
  PAYMENT_FAILED       = 'PAYMENT_FAILED',
  PAYMENT_CONFIRMED    = 'PAYMENT_CONFIRMED',
  PROCESSING           = 'PROCESSING',
  PARTIALLY_READY      = 'PARTIALLY_READY',
  READY_TO_SHIP        = 'READY_TO_SHIP',
  PARTIALLY_SHIPPED    = 'PARTIALLY_SHIPPED',
  SHIPPED              = 'SHIPPED',
  PARTIALLY_DELIVERED  = 'PARTIALLY_DELIVERED',
  DELIVERED            = 'DELIVERED',
  COMPLETED            = 'COMPLETED',
  CANCELLED            = 'CANCELLED',
}

export enum OrderLineStatus {
  PENDING_VENDOR_CONFIRMATION = 'PENDING_VENDOR_CONFIRMATION',
  CONFIRMED                   = 'CONFIRMED',
  PREPARING                   = 'PREPARING',
  SHIPPED                     = 'SHIPPED',
  DELIVERED                   = 'DELIVERED',
  COMPLETED                   = 'COMPLETED',
  CANCELLED_BY_VENDOR         = 'CANCELLED_BY_VENDOR',
  CANCELLED_BY_ADMIN          = 'CANCELLED_BY_ADMIN',
  CANCELLED_BY_CUSTOMER       = 'CANCELLED_BY_CUSTOMER',
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export enum PaymentStatus {
  PENDING             = 'PENDING',
  PROCESSING          = 'PROCESSING',
  SUCCEEDED           = 'SUCCEEDED',
  FAILED              = 'FAILED',
  REFUNDED            = 'REFUNDED',
  PARTIALLY_REFUNDED  = 'PARTIALLY_REFUNDED',
}

// ─── Fulfillment ─────────────────────────────────────────────────────────────

export enum FulfillmentStatus {
  PENDING   = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY     = 'READY',
  SHIPPED   = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  FAILED    = 'FAILED',
}

// ─── Incident ────────────────────────────────────────────────────────────────

export enum IncidentType {
  ITEM_NOT_RECEIVED     = 'ITEM_NOT_RECEIVED',
  ITEM_DAMAGED          = 'ITEM_DAMAGED',
  WRONG_ITEM            = 'WRONG_ITEM',
  ITEM_NOT_AS_DESCRIBED = 'ITEM_NOT_AS_DESCRIBED',
  VENDOR_CANCELLED      = 'VENDOR_CANCELLED',
  QUALITY_COMPLAINT     = 'QUALITY_COMPLAINT',
}

export enum IncidentStatus {
  OPEN               = 'OPEN',
  AWAITING_VENDOR    = 'AWAITING_VENDOR',
  AWAITING_CUSTOMER  = 'AWAITING_CUSTOMER',
  AWAITING_ADMIN     = 'AWAITING_ADMIN',
  RESOLVED           = 'RESOLVED',
  CLOSED             = 'CLOSED',
}

export enum IncidentResolution {
  REFUND_FULL       = 'REFUND_FULL',
  REFUND_PARTIAL    = 'REFUND_PARTIAL',
  REPLACEMENT       = 'REPLACEMENT',
  REJECTED          = 'REJECTED',
  GOODWILL_CREDIT   = 'GOODWILL_CREDIT',
}

export enum IncidentFundedBy {
  VENDOR      = 'vendor',
  MARKETPLACE = 'marketplace',
  SPLIT       = 'split',
}

// ─── Settlement ──────────────────────────────────────────────────────────────

export enum SettlementStatus {
  DRAFT             = 'DRAFT',
  PENDING_APPROVAL  = 'PENDING_APPROVAL',
  APPROVED          = 'APPROVED',
  PAID              = 'PAID',
  DISPUTED          = 'DISPUTED',
}

export enum CommissionType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED      = 'FIXED',
  TIERED     = 'TIERED',
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export enum CartStatus {
  ACTIVE    = 'ACTIVE',
  ABANDONED = 'ABANDONED',
  CONVERTED = 'CONVERTED',
}

// ─── User / Admin ────────────────────────────────────────────────────────────

export enum UserRole {
  CUSTOMER       = 'CUSTOMER',
  VENDOR         = 'VENDOR',
  ADMIN_SUPPORT  = 'ADMIN_SUPPORT',
  ADMIN_CATALOG  = 'ADMIN_CATALOG',
  ADMIN_FINANCE  = 'ADMIN_FINANCE',
  ADMIN_OPS      = 'ADMIN_OPS',
  SUPERADMIN     = 'SUPERADMIN',
}

// ─── Event trigger ────────────────────────────────────────────────────────────

export enum EventTrigger {
  CUSTOMER = 'customer',
  VENDOR   = 'vendor',
  ADMIN    = 'admin',
  SYSTEM   = 'system',
}
