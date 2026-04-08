// ─── Vendor (Productor) ──────────────────────────────────────────────────────

export enum VendorStatus {
  APPLYING = 'applying',
  PENDING_DOCS = 'pending_docs',
  ACTIVE = 'active',
  SUSPENDED_TEMP = 'suspended_temp',
  REJECTED = 'rejected',
  DEACTIVATED = 'deactivated',
}

// ─── Product ─────────────────────────────────────────────────────────────────

export enum ProductStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DISCONTINUED = 'discontinued',
  REJECTED = 'rejected',
}

// ─── Order ───────────────────────────────────────────────────────────────────

export enum OrderStatus {
  PLACED = 'placed',
  PAYMENT_PENDING = 'payment_pending',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  PROCESSING = 'processing',
  PARTIALLY_READY = 'partially_ready',
  READY_TO_SHIP = 'ready_to_ship',
  PARTIALLY_SHIPPED = 'partially_shipped',
  SHIPPED = 'shipped',
  PARTIALLY_DELIVERED = 'partially_delivered',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum OrderLineStatus {
  PENDING_VENDOR_CONFIRMATION = 'pending_vendor_confirmation',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED_BY_VENDOR = 'cancelled_by_vendor',
  CANCELLED_BY_ADMIN = 'cancelled_by_admin',
  CANCELLED_BY_CUSTOMER = 'cancelled_by_customer',
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

// ─── Fulfillment ─────────────────────────────────────────────────────────────

export enum FulfillmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

// ─── Incident ────────────────────────────────────────────────────────────────

export enum IncidentType {
  ITEM_NOT_RECEIVED = 'item_not_received',
  ITEM_DAMAGED = 'item_damaged',
  WRONG_ITEM = 'wrong_item',
  ITEM_NOT_AS_DESCRIBED = 'item_not_as_described',
  VENDOR_CANCELLED = 'vendor_cancelled',
  QUALITY_COMPLAINT = 'quality_complaint',
}

export enum IncidentStatus {
  OPEN = 'open',
  AWAITING_VENDOR = 'awaiting_vendor',
  AWAITING_CUSTOMER = 'awaiting_customer',
  AWAITING_ADMIN = 'awaiting_admin',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum IncidentResolution {
  REFUND_FULL = 'refund_full',
  REFUND_PARTIAL = 'refund_partial',
  REPLACEMENT = 'replacement',
  REJECTED = 'rejected',
  GOODWILL_CREDIT = 'goodwill_credit',
}

export enum IncidentFundedBy {
  VENDOR = 'vendor',
  MARKETPLACE = 'marketplace',
  SPLIT = 'split',
}

// ─── Settlement ──────────────────────────────────────────────────────────────

export enum SettlementStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  PAID = 'paid',
  DISPUTED = 'disputed',
}

export enum CommissionType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  TIERED = 'tiered',
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export enum CartStatus {
  ACTIVE = 'active',
  ABANDONED = 'abandoned',
  CONVERTED = 'converted',
}

// ─── User / Admin ────────────────────────────────────────────────────────────

export enum UserRole {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  ADMIN_SUPPORT = 'admin_support',
  ADMIN_CATALOG = 'admin_catalog',
  ADMIN_FINANCE = 'admin_finance',
  ADMIN_OPS = 'admin_ops',
  SUPERADMIN = 'superadmin',
}

// ─── Event triggers ──────────────────────────────────────────────────────────

export enum EventTrigger {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  ADMIN = 'admin',
  SYSTEM = 'system',
}
