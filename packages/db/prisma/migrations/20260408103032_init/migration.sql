-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'VENDOR', 'ADMIN_SUPPORT', 'ADMIN_CATALOG', 'ADMIN_FINANCE', 'ADMIN_OPS', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('APPLYING', 'PENDING_DOCS', 'ACTIVE', 'SUSPENDED_TEMP', 'REJECTED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "VendorDocumentType" AS ENUM ('TAX_REGISTRATION', 'FOOD_SAFETY', 'ORGANIC_CERT', 'BANK_STATEMENT', 'ID_DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ShippingMethod" AS ENUM ('STANDARD', 'EXPRESS', 'PICKUP', 'FREIGHT');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'SUSPENDED', 'DISCONTINUED', 'REJECTED');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('INITIAL', 'SALE', 'RETURN', 'ADJUSTMENT', 'DAMAGE', 'PURCHASE', 'RESERVED', 'UNRESERVED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING');

-- CreateEnum
CREATE TYPE "CouponScope" AS ENUM ('ALL', 'VENDOR', 'CATEGORY', 'PRODUCT');

-- CreateEnum
CREATE TYPE "CartStatus" AS ENUM ('ACTIVE', 'ABANDONED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PLACED', 'PAYMENT_PENDING', 'PAYMENT_FAILED', 'PAYMENT_CONFIRMED', 'PROCESSING', 'PARTIALLY_READY', 'READY_TO_SHIP', 'PARTIALLY_SHIPPED', 'SHIPPED', 'PARTIALLY_DELIVERED', 'DELIVERED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "OrderLineStatus" AS ENUM ('PENDING_VENDOR_CONFIRMATION', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED_BY_VENDOR', 'CANCELLED_BY_ADMIN', 'CANCELLED_BY_CUSTOMER');

-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SHIPPED', 'DELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'REDSYS', 'PAYPAL', 'BIZUM', 'MANUAL');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'SEPA_DEBIT', 'PAYPAL', 'BIZUM', 'BANK_TRANSFER', 'WALLET');

-- CreateEnum
CREATE TYPE "PaymentState" AS ENUM ('PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "RefundState" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "RefundFundedBy" AS ENUM ('VENDOR', 'MARKETPLACE', 'SPLIT');

-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('PERCENTAGE', 'FIXED', 'TIERED');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PAID', 'DISPUTED');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('ITEM_NOT_RECEIVED', 'ITEM_DAMAGED', 'WRONG_ITEM', 'ITEM_NOT_AS_DESCRIBED', 'VENDOR_CANCELLED', 'QUALITY_COMPLAINT', 'LATE_DELIVERY');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'AWAITING_VENDOR', 'AWAITING_CUSTOMER', 'AWAITING_ADMIN', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "IncidentResolution" AS ENUM ('REFUND_FULL', 'REFUND_PARTIAL', 'REPLACEMENT', 'REJECTED', 'GOODWILL_CREDIT', 'NO_ACTION_NEEDED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED', 'BOUNCED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_addresses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'ES',
    "phone" TEXT,
    "lat" DECIMAL(10,7),
    "lng" DECIMAL(10,7),

    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "legalName" TEXT,
    "description" TEXT,
    "shortBio" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "location" TEXT,
    "originRegion" TEXT,
    "address" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "province" TEXT,
    "country" TEXT NOT NULL DEFAULT 'ES',
    "lat" DECIMAL(10,7),
    "lng" DECIMAL(10,7),
    "website" TEXT,
    "publicEmail" TEXT,
    "publicPhone" TEXT,
    "status" "VendorStatus" NOT NULL DEFAULT 'APPLYING',
    "rejectionReason" TEXT,
    "suspendedReason" TEXT,
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "taxId" TEXT,
    "vatRegistered" BOOLEAN NOT NULL DEFAULT false,
    "iban" TEXT,
    "bankAccountName" TEXT,
    "bankName" TEXT,
    "swiftBic" TEXT,
    "orderCutoffDays" TEXT[],
    "orderCutoffTime" TEXT,
    "preparationDays" INTEGER NOT NULL DEFAULT 1,
    "minOrderAmount" DECIMAL(10,2),
    "freeShippingAbove" DECIMAL(10,2),
    "avgRating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "cancellationRate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "totalSales" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "commissionRate" DECIMAL(5,4),
    "activatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_documents" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "type" "VendorDocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_events" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "triggeredBy" TEXT NOT NULL,
    "adminId" TEXT,
    "metadata" JSONB,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_zones" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countries" TEXT[],
    "provinces" TEXT[],
    "postalCodePatterns" TEXT[],
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipping_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_rates" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "method" "ShippingMethod" NOT NULL DEFAULT 'STANDARD',
    "carrier" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "freeAboveAmount" DECIMAL(10,2),
    "minWeight" DECIMAL(8,3),
    "maxWeight" DECIMAL(8,3),
    "minDays" INTEGER NOT NULL DEFAULT 1,
    "maxDays" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipping_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "images" TEXT[],
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "basePrice" DECIMAL(10,2) NOT NULL,
    "compareAtPrice" DECIMAL(10,2),
    "taxRate" DECIMAL(4,3) NOT NULL DEFAULT 0.10,
    "unit" TEXT NOT NULL DEFAULT 'ud',
    "minOrderQuantity" INTEGER NOT NULL DEFAULT 1,
    "maxOrderQuantity" INTEGER,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "lowStockAlert" INTEGER NOT NULL DEFAULT 5,
    "trackStock" BOOLEAN NOT NULL DEFAULT true,
    "weight" DECIMAL(8,3),
    "shelfLifeDays" INTEGER,
    "storageInstructions" TEXT,
    "ingredients" TEXT,
    "allergens" TEXT[],
    "nutritionalInfo" JSONB,
    "tags" TEXT[],
    "certifications" TEXT[],
    "originRegion" TEXT,
    "rejectionReason" TEXT,
    "reviewNote" TEXT,
    "lastPriceChange" TIMESTAMP(3),
    "previousPrice" DECIMAL(10,2),
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "compareAt" DECIMAL(10,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "weight" DECIMAL(8,3),
    "attributes" JSONB NOT NULL,
    "imageUrl" TEXT,
    "barcode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "type" "StockMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "note" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_reviews" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "orderLineId" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "images" TEXT[],
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "adminNote" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlists" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Lista de deseos',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist_items" (
    "id" TEXT NOT NULL,
    "wishlistId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "CouponType" NOT NULL,
    "scope" "CouponScope" NOT NULL DEFAULT 'ALL',
    "scopeVendorId" TEXT,
    "scopeCategoryId" TEXT,
    "scopeProductId" TEXT,
    "value" DECIMAL(10,4) NOT NULL,
    "minOrderAmount" DECIMAL(10,2),
    "maxDiscountAmount" DECIMAL(10,2),
    "usageLimit" INTEGER,
    "usagePerCustomer" INTEGER,
    "currentUsage" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_usages" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "discountApplied" DECIMAL(10,2) NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carts" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "sessionId" TEXT NOT NULL,
    "status" "CartStatus" NOT NULL DEFAULT 'ACTIVE',
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "couponId" TEXT,
    "couponCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "vendorId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "priceSnapshot" JSONB NOT NULL,
    "fulfillmentGroup" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "priceChanged" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_counters" (
    "year" INTEGER NOT NULL,
    "lastSequence" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "order_counters_pkey" PRIMARY KEY ("year")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PLACED',
    "shippingAddress" JSONB NOT NULL,
    "billingAddress" JSONB NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "shippingTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discountTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "taxTotal" DECIMAL(10,2) NOT NULL,
    "grandTotal" DECIMAL(10,2) NOT NULL,
    "refundedTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "couponCode" TEXT,
    "couponDiscount" DECIMAL(10,2),
    "notesFromCustomer" TEXT,
    "cancelReason" TEXT,
    "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "fulfilledAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_lines" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "productSnapshot" JSONB NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "lineTotal" DECIMAL(10,2) NOT NULL,
    "taxRate" DECIMAL(4,3) NOT NULL,
    "taxAmount" DECIMAL(10,2) NOT NULL,
    "status" "OrderLineStatus" NOT NULL DEFAULT 'PENDING_VENDOR_CONFIRMATION',
    "fulfillmentId" TEXT,
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_fulfillments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "status" "FulfillmentStatus" NOT NULL DEFAULT 'PENDING',
    "trackingNumber" TEXT,
    "carrier" TEXT,
    "shippingRateId" TEXT,
    "shippingCost" DECIMAL(10,2),
    "estimatedDeliveryAt" TIMESTAMP(3),
    "vendorNotes" TEXT,
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_fulfillments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_events" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "triggeredBy" TEXT NOT NULL,
    "adminId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'STRIPE',
    "method" "PaymentMethod",
    "providerPaymentId" TEXT,
    "providerChargeId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "state" "PaymentState" NOT NULL DEFAULT 'PENDING',
    "cardLast4" TEXT,
    "cardBrand" TEXT,
    "cardExpMonth" INTEGER,
    "cardExpYear" INTEGER,
    "receiptUrl" TEXT,
    "providerMetadata" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "authorizedAt" TIMESTAMP(3),
    "capturedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderLineId" TEXT,
    "incidentId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "fundedBy" "RefundFundedBy" NOT NULL,
    "splitVendorAmount" DECIMAL(10,2),
    "splitMarketplaceAmount" DECIMAL(10,2),
    "state" "RefundState" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT NOT NULL,
    "providerRefundId" TEXT,
    "providerMetadata" JSONB,
    "processedBy" TEXT,
    "errorMessage" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CommissionType" NOT NULL,
    "vendorId" TEXT,
    "categoryId" TEXT,
    "productId" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "rate" DECIMAL(5,4),
    "tiers" JSONB,
    "includesTax" BOOLEAN NOT NULL DEFAULT false,
    "includesShipping" BOOLEAN NOT NULL DEFAULT false,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commission_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settlements" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "periodFrom" TIMESTAMP(3) NOT NULL,
    "periodTo" TIMESTAMP(3) NOT NULL,
    "status" "SettlementStatus" NOT NULL DEFAULT 'DRAFT',
    "grossSales" DECIMAL(12,2) NOT NULL,
    "commissionTotal" DECIMAL(12,2) NOT NULL,
    "refundsDeducted" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "netPayable" DECIMAL(12,2) NOT NULL,
    "paymentReference" TEXT,
    "invoiceNumber" TEXT,
    "invoiceUrl" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "internalNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settlement_lines" (
    "id" TEXT NOT NULL,
    "settlementId" TEXT NOT NULL,
    "orderLineId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "grossAmount" DECIMAL(10,2) NOT NULL,
    "commissionRate" DECIMAL(5,4) NOT NULL,
    "commissionAmount" DECIMAL(10,2) NOT NULL,
    "refundAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "settlement_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settlement_adjustments" (
    "id" TEXT NOT NULL,
    "settlementId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settlement_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "incidentRef" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderLineId" TEXT,
    "vendorId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "assignedTo" TEXT,
    "type" "IncidentType" NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" "IncidentResolution",
    "slaDeadline" TIMESTAMP(3) NOT NULL,
    "slaBreached" BOOLEAN NOT NULL DEFAULT false,
    "internalNote" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_messages" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "attachments" TEXT[],
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_refunds" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "refundId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "fundedBy" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "processedBy" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "channel" "NotificationChannel" NOT NULL,
    "template" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'QUEUED',
    "externalId" TEXT,
    "metadata" JSONB,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_config" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_config_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_token_key" ON "user_sessions"("token");

-- CreateIndex
CREATE INDEX "user_sessions_token_idx" ON "user_sessions"("token");

-- CreateIndex
CREATE INDEX "user_sessions_userId_idx" ON "user_sessions"("userId");

-- CreateIndex
CREATE INDEX "user_sessions_expiresAt_idx" ON "user_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "customer_addresses_userId_idx" ON "customer_addresses"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_userId_key" ON "vendors"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_slug_key" ON "vendors"("slug");

-- CreateIndex
CREATE INDEX "vendors_slug_idx" ON "vendors"("slug");

-- CreateIndex
CREATE INDEX "vendors_status_idx" ON "vendors"("status");

-- CreateIndex
CREATE INDEX "vendors_city_province_idx" ON "vendors"("city", "province");

-- CreateIndex
CREATE INDEX "vendor_documents_vendorId_idx" ON "vendor_documents"("vendorId");

-- CreateIndex
CREATE INDEX "vendor_documents_status_idx" ON "vendor_documents"("status");

-- CreateIndex
CREATE INDEX "vendor_events_vendorId_idx" ON "vendor_events"("vendorId");

-- CreateIndex
CREATE INDEX "vendor_events_createdAt_idx" ON "vendor_events"("createdAt");

-- CreateIndex
CREATE INDEX "shipping_zones_vendorId_idx" ON "shipping_zones"("vendorId");

-- CreateIndex
CREATE INDEX "shipping_rates_zoneId_idx" ON "shipping_rates"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_parentId_idx" ON "categories"("parentId");

-- CreateIndex
CREATE INDEX "categories_isActive_position_idx" ON "categories"("isActive", "position");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_vendorId_idx" ON "products"("vendorId");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "products_slug_idx" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_status_publishedAt_idx" ON "products"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "products_tags_idx" ON "products"("tags");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_productId_idx" ON "product_variants"("productId");

-- CreateIndex
CREATE INDEX "product_variants_sku_idx" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "stock_movements_productId_idx" ON "stock_movements"("productId");

-- CreateIndex
CREATE INDEX "stock_movements_variantId_idx" ON "stock_movements"("variantId");

-- CreateIndex
CREATE INDEX "stock_movements_createdAt_idx" ON "stock_movements"("createdAt");

-- CreateIndex
CREATE INDEX "stock_movements_referenceType_referenceId_idx" ON "stock_movements"("referenceType", "referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "product_reviews_orderLineId_key" ON "product_reviews"("orderLineId");

-- CreateIndex
CREATE INDEX "product_reviews_productId_idx" ON "product_reviews"("productId");

-- CreateIndex
CREATE INDEX "product_reviews_vendorId_idx" ON "product_reviews"("vendorId");

-- CreateIndex
CREATE INDEX "product_reviews_customerId_idx" ON "product_reviews"("customerId");

-- CreateIndex
CREATE INDEX "product_reviews_status_idx" ON "product_reviews"("status");

-- CreateIndex
CREATE INDEX "wishlists_customerId_idx" ON "wishlists"("customerId");

-- CreateIndex
CREATE INDEX "wishlist_items_wishlistId_idx" ON "wishlist_items"("wishlistId");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_wishlistId_productId_variantId_key" ON "wishlist_items"("wishlistId", "productId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_code_idx" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_isActive_validFrom_validTo_idx" ON "coupons"("isActive", "validFrom", "validTo");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_usages_orderId_key" ON "coupon_usages"("orderId");

-- CreateIndex
CREATE INDEX "coupon_usages_couponId_idx" ON "coupon_usages"("couponId");

-- CreateIndex
CREATE INDEX "coupon_usages_customerId_idx" ON "coupon_usages"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "carts_customerId_key" ON "carts"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "carts_sessionId_key" ON "carts"("sessionId");

-- CreateIndex
CREATE INDEX "carts_sessionId_idx" ON "carts"("sessionId");

-- CreateIndex
CREATE INDEX "carts_customerId_idx" ON "carts"("customerId");

-- CreateIndex
CREATE INDEX "carts_status_expiresAt_idx" ON "carts"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "cart_items_cartId_idx" ON "cart_items"("cartId");

-- CreateIndex
CREATE INDEX "cart_items_productId_idx" ON "cart_items"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cartId_productId_variantId_key" ON "cart_items"("cartId", "productId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_customerId_idx" ON "orders"("customerId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_orderNumber_idx" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_placedAt_idx" ON "orders"("placedAt");

-- CreateIndex
CREATE INDEX "orders_paymentStatus_idx" ON "orders"("paymentStatus");

-- CreateIndex
CREATE INDEX "order_lines_orderId_idx" ON "order_lines"("orderId");

-- CreateIndex
CREATE INDEX "order_lines_vendorId_idx" ON "order_lines"("vendorId");

-- CreateIndex
CREATE INDEX "order_lines_productId_idx" ON "order_lines"("productId");

-- CreateIndex
CREATE INDEX "order_lines_status_idx" ON "order_lines"("status");

-- CreateIndex
CREATE INDEX "vendor_fulfillments_orderId_idx" ON "vendor_fulfillments"("orderId");

-- CreateIndex
CREATE INDEX "vendor_fulfillments_vendorId_idx" ON "vendor_fulfillments"("vendorId");

-- CreateIndex
CREATE INDEX "vendor_fulfillments_status_idx" ON "vendor_fulfillments"("status");

-- CreateIndex
CREATE INDEX "order_events_orderId_idx" ON "order_events"("orderId");

-- CreateIndex
CREATE INDEX "order_events_createdAt_idx" ON "order_events"("createdAt");

-- CreateIndex
CREATE INDEX "payments_orderId_idx" ON "payments"("orderId");

-- CreateIndex
CREATE INDEX "payments_customerId_idx" ON "payments"("customerId");

-- CreateIndex
CREATE INDEX "payments_providerPaymentId_idx" ON "payments"("providerPaymentId");

-- CreateIndex
CREATE INDEX "payments_state_idx" ON "payments"("state");

-- CreateIndex
CREATE INDEX "refunds_paymentId_idx" ON "refunds"("paymentId");

-- CreateIndex
CREATE INDEX "refunds_orderId_idx" ON "refunds"("orderId");

-- CreateIndex
CREATE INDEX "refunds_incidentId_idx" ON "refunds"("incidentId");

-- CreateIndex
CREATE INDEX "refunds_state_idx" ON "refunds"("state");

-- CreateIndex
CREATE INDEX "commission_rules_vendorId_idx" ON "commission_rules"("vendorId");

-- CreateIndex
CREATE INDEX "commission_rules_isActive_validFrom_validTo_idx" ON "commission_rules"("isActive", "validFrom", "validTo");

-- CreateIndex
CREATE INDEX "settlements_vendorId_idx" ON "settlements"("vendorId");

-- CreateIndex
CREATE INDEX "settlements_status_idx" ON "settlements"("status");

-- CreateIndex
CREATE INDEX "settlements_periodFrom_periodTo_idx" ON "settlements"("periodFrom", "periodTo");

-- CreateIndex
CREATE INDEX "settlement_lines_settlementId_idx" ON "settlement_lines"("settlementId");

-- CreateIndex
CREATE INDEX "settlement_lines_orderLineId_idx" ON "settlement_lines"("orderLineId");

-- CreateIndex
CREATE INDEX "settlement_adjustments_settlementId_idx" ON "settlement_adjustments"("settlementId");

-- CreateIndex
CREATE UNIQUE INDEX "incidents_incidentRef_key" ON "incidents"("incidentRef");

-- CreateIndex
CREATE INDEX "incidents_orderId_idx" ON "incidents"("orderId");

-- CreateIndex
CREATE INDEX "incidents_vendorId_idx" ON "incidents"("vendorId");

-- CreateIndex
CREATE INDEX "incidents_customerId_idx" ON "incidents"("customerId");

-- CreateIndex
CREATE INDEX "incidents_status_idx" ON "incidents"("status");

-- CreateIndex
CREATE INDEX "incidents_slaDeadline_status_idx" ON "incidents"("slaDeadline", "status");

-- CreateIndex
CREATE INDEX "incidents_assignedTo_idx" ON "incidents"("assignedTo");

-- CreateIndex
CREATE INDEX "incident_messages_incidentId_idx" ON "incident_messages"("incidentId");

-- CreateIndex
CREATE INDEX "incident_refunds_incidentId_idx" ON "incident_refunds"("incidentId");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "audit_logs_resourceType_resourceId_idx" ON "audit_logs"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_template_idx" ON "notifications"("template");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_documents" ADD CONSTRAINT "vendor_documents_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_events" ADD CONSTRAINT "vendor_events_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_events" ADD CONSTRAINT "vendor_events_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_zones" ADD CONSTRAINT "shipping_zones_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_rates" ADD CONSTRAINT "shipping_rates_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "shipping_zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_orderLineId_fkey" FOREIGN KEY ("orderLineId") REFERENCES "order_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "wishlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_fulfillmentId_fkey" FOREIGN KEY ("fulfillmentId") REFERENCES "vendor_fulfillments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_fulfillments" ADD CONSTRAINT "vendor_fulfillments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_fulfillments" ADD CONSTRAINT "vendor_fulfillments_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_rules" ADD CONSTRAINT "commission_rules_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlement_lines" ADD CONSTRAINT "settlement_lines_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlement_lines" ADD CONSTRAINT "settlement_lines_orderLineId_fkey" FOREIGN KEY ("orderLineId") REFERENCES "order_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlement_adjustments" ADD CONSTRAINT "settlement_adjustments_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "settlements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_orderLineId_fkey" FOREIGN KEY ("orderLineId") REFERENCES "order_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_messages" ADD CONSTRAINT "incident_messages_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_refunds" ADD CONSTRAINT "incident_refunds_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
