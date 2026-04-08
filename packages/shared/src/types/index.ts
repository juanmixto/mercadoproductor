import {
  VendorStatus,
  ProductStatus,
  OrderStatus,
  OrderLineStatus,
  PaymentStatus,
  FulfillmentStatus,
  IncidentType,
  IncidentStatus,
  IncidentResolution,
  IncidentFundedBy,
  SettlementStatus,
  CommissionType,
  CartStatus,
  UserRole,
  EventTrigger,
} from '../enums'

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ─── API Response ────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

// ─── Address ─────────────────────────────────────────────────────────────────

export interface Address {
  name: string
  line1: string
  line2?: string
  city: string
  province: string
  postalCode: string
  country: string
  phone?: string
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  createdAt: Date
}

// ─── Vendor ──────────────────────────────────────────────────────────────────

export interface Vendor {
  id: string
  userId: string
  slug: string
  displayName: string
  description?: string
  logoUrl?: string
  location?: string
  status: VendorStatus
  taxId?: string
  iban?: string
  commissionRate?: number
  createdAt: Date
  updatedAt: Date
}

export interface VendorPublic {
  id: string
  slug: string
  displayName: string
  description?: string
  logoUrl?: string
  location?: string
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  name: string
  price: number
  compareAtPrice?: number
  stock: number
  weight?: number
  attributes: Record<string, string>
  isActive: boolean
}

export interface Product {
  id: string
  vendorId: string
  categoryId: string
  slug: string
  name: string
  description: string
  images: string[]
  status: ProductStatus
  basePrice: number
  taxRate: number
  unit: string
  minOrderQuantity: number
  stock: number
  variants: ProductVariant[]
  tags: string[]
  certifications: string[]
  originRegion?: string
  createdAt: Date
  updatedAt: Date
}

export interface ProductPublic extends Omit<Product, 'vendorId'> {
  vendor: VendorPublic
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItemPriceSnapshot {
  name: string
  imageUrl: string
  vendorName: string
  price: number
  capturedAt: Date
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  variantId?: string
  vendorId: string
  quantity: number
  unitPrice: number
  priceSnapshot: CartItemPriceSnapshot
  fulfillmentGroup: string
  isAvailable: boolean
  priceChanged: boolean
}

export interface Cart {
  id: string
  customerId?: string
  sessionId: string
  status: CartStatus
  currency: string
  items: CartItem[]
  subtotal: number
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
}

// ─── Order ───────────────────────────────────────────────────────────────────

export interface ProductSnapshot {
  name: string
  imageUrl: string
  vendorName: string
  sku?: string
  description: string
}

export interface OrderLine {
  id: string
  orderId: string
  vendorId: string
  productId: string
  variantId?: string
  productSnapshot: ProductSnapshot
  quantity: number
  unitPrice: number
  lineTotal: number
  taxRate: number
  taxAmount: number
  status: OrderLineStatus
  fulfillmentId?: string
}

export interface VendorFulfillment {
  id: string
  orderId: string
  vendorId: string
  status: FulfillmentStatus
  trackingNumber?: string
  carrier?: string
  vendorNotes?: string
  shippedAt?: Date
  deliveredAt?: Date
  lines: OrderLine[]
}

export interface OrderEvent {
  id: string
  orderId: string
  eventType: string
  triggeredBy: EventTrigger
  metadata?: Record<string, unknown>
  createdAt: Date
}

export interface Order {
  id: string
  customerId: string
  status: OrderStatus
  shippingAddress: Address
  billingAddress: Address
  paymentIntentId?: string
  paymentStatus: PaymentStatus
  currency: string
  subtotal: number
  shippingTotal: number
  discountTotal: number
  taxTotal: number
  grandTotal: number
  notesFromCustomer?: string
  lines: OrderLine[]
  fulfillments: VendorFulfillment[]
  events: OrderEvent[]
  placedAt: Date
  confirmedAt?: Date
  fulfilledAt?: Date
  closedAt?: Date
}

// ─── Commission & Settlement ──────────────────────────────────────────────────

export interface CommissionTier {
  from: number
  to: number | null
  rate: number
}

export interface CommissionRule {
  id: string
  name: string
  type: CommissionType
  appliesTo: 'all' | string
  priority: number
  rate?: number
  tiers?: CommissionTier[]
  includesTax: boolean
  includesShipping: boolean
  validFrom: Date
  validTo?: Date
}

export interface SettlementLine {
  orderLineId: string
  orderId: string
  grossAmount: number
  commissionRate: number
  commissionAmount: number
  netAmount: number
}

export interface Settlement {
  id: string
  vendorId: string
  periodFrom: Date
  periodTo: Date
  status: SettlementStatus
  grossSales: number
  commissionTotal: number
  refundsDeducted: number
  adjustments: number
  adjustmentsNote?: string
  netPayable: number
  paymentReference?: string
  paidAt?: Date
  lines: SettlementLine[]
  createdAt: Date
}

// ─── Incident ────────────────────────────────────────────────────────────────

export interface IncidentMessage {
  id: string
  incidentId: string
  senderType: EventTrigger
  senderId: string
  body: string
  attachments: string[]
  createdAt: Date
}

export interface IncidentRefund {
  id: string
  incidentId: string
  amount: number
  reason: string
  fundedBy: IncidentFundedBy
  paymentMethod: 'original' | 'credit' | 'bank'
  processedAt?: Date
}

export interface Incident {
  id: string
  orderId: string
  orderLineId?: string
  vendorId: string
  customerId: string
  type: IncidentType
  status: IncidentStatus
  resolution?: IncidentResolution
  slaDeadline: Date
  messages: IncidentMessage[]
  refunds: IncidentRefund[]
  openedAt: Date
  resolvedAt?: Date
  closedAt?: Date
}
