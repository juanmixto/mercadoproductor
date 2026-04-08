import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '@mercadoproductor/db'
import { OrderStatus, OrderLineStatus, FulfillmentStatus, CartStatus, ProductStatus, EventTrigger } from '@mercadoproductor/shared'
import { AppError } from '../middlewares/error.middleware'
import { authenticate, isVendor, isAdmin, isCustomer } from '../middlewares/auth.middleware'
import { ok, created } from '../utils/response'
import { formatOrderNumber } from '../utils/orderNumber'

export const orderRouter = Router()

const addressSchema = z.object({
  name: z.string(),
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  province: z.string(),
  postalCode: z.string(),
  country: z.string().default('ES'),
  phone: z.string().optional(),
})

// POST /api/v1/orders — crear pedido desde carrito
orderRouter.post(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { shippingAddress, billingAddress, notesFromCustomer } = z.object({
        shippingAddress: addressSchema,
        billingAddress: addressSchema,
        notesFromCustomer: z.string().optional(),
      }).parse(req.body)

      const cart = await prisma.cart.findFirst({
        where: { customerId: req.auth!.userId, status: CartStatus.ACTIVE },
        include: {
          items: {
            include: {
              product: {
                include: { vendor: { select: { id: true, displayName: true } } },
              },
              variant: true,
            },
          },
        },
      })

      if (!cart || cart.items.length === 0) {
        throw new AppError(400, 'EMPTY_CART', 'El carrito está vacío')
      }

      // Validate stock
      for (const item of cart.items) {
        if (item.product.status !== ProductStatus.ACTIVE) {
          throw new AppError(400, 'PRODUCT_UNAVAILABLE', `Producto no disponible: ${item.product.name}`)
        }
        if (item.product.stock < item.quantity) {
          throw new AppError(400, 'INSUFFICIENT_STOCK', `Stock insuficiente: ${item.product.name}`)
        }
      }

      // Calculate totals
      const subtotal = cart.items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0)
      const taxTotal = cart.items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity * Number(i.product.taxRate), 0)
      const grandTotal = subtotal + taxTotal

      // Generate order number
      const year = new Date().getFullYear()
      const count = await prisma.order.count()
      const orderNumber = formatOrderNumber(year, count + 1)

      // Group items by vendor for fulfillments
      const byVendor = cart.items.reduce<Record<string, typeof cart.items>>((acc, item) => {
        const vid = item.vendorId
        if (!acc[vid]) acc[vid] = []
        acc[vid].push(item)
        return acc
      }, {})

      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            customerId: req.auth!.userId,
            status: OrderStatus.PLACED,
            shippingAddress,
            billingAddress,
            currency: 'EUR',
            subtotal,
            taxTotal,
            grandTotal,
            shippingTotal: 0,
            discountTotal: 0,
            notesFromCustomer,
          },
        })

        // Create fulfillments and lines per vendor
        for (const [vendorId, items] of Object.entries(byVendor)) {
          const fulfillment = await tx.vendorFulfillment.create({
            data: {
              orderId: newOrder.id,
              vendorId,
              status: FulfillmentStatus.PENDING,
            },
          })

          for (const item of items) {
            await tx.orderLine.create({
              data: {
                orderId: newOrder.id,
                vendorId,
                productId: item.productId,
                variantId: item.variantId,
                productSnapshot: {
                  name: item.product.name,
                  imageUrl: item.product.images[0] ?? '',
                  vendorName: item.product.vendor.displayName,
                  description: item.product.description,
                },
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                lineTotal: Number(item.unitPrice) * item.quantity,
                taxRate: item.product.taxRate,
                taxAmount: Number(item.unitPrice) * item.quantity * Number(item.product.taxRate),
                status: OrderLineStatus.PENDING_VENDOR_CONFIRMATION,
                fulfillmentId: fulfillment.id,
              },
            })

            // Decrement stock
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            })
          }
        }

        // Log event
        await tx.orderEvent.create({
          data: {
            orderId: newOrder.id,
            eventType: 'order.placed',
            triggeredBy: EventTrigger.CUSTOMER,
          },
        })

        // Mark cart as converted
        await tx.cart.update({
          where: { id: cart.id },
          data: { status: CartStatus.CONVERTED },
        })

        return newOrder
      })

      created(res, { orderId: order.id, orderNumber: order.orderNumber })
    } catch (err) {
      next(err)
    }
  },
)

// GET /api/v1/orders — lista pedidos del cliente
orderRouter.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await prisma.order.findMany({
        where: { customerId: req.auth!.userId },
        orderBy: { placedAt: 'desc' },
        include: {
          lines: {
            select: {
              id: true,
              productSnapshot: true,
              quantity: true,
              unitPrice: true,
              status: true,
            },
          },
        },
      })
      ok(res, orders)
    } catch (err) {
      next(err)
    }
  },
)

// GET /api/v1/orders/:id — detalle pedido
orderRouter.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await prisma.order.findUnique({
        where: { id: req.params.id },
        include: {
          lines: true,
          fulfillments: { include: { lines: true } },
          events: { orderBy: { createdAt: 'asc' } },
        },
      })
      if (!order) throw new AppError(404, 'NOT_FOUND', 'Pedido no encontrado')
      // Customers can only see their own orders
      if (order.customerId !== req.auth!.userId && !['ADMIN_OPS', 'SUPERADMIN'].includes(req.auth!.role)) {
        throw new AppError(403, 'FORBIDDEN', 'Sin acceso a este pedido')
      }
      ok(res, order)
    } catch (err) {
      next(err)
    }
  },
)

// ─── Vendor: confirmar / actualizar fulfillment ───────────────────────────────

// PATCH /api/v1/orders/:id/fulfillments/:fulfillmentId — vendor actualiza su fulfillment
orderRouter.patch(
  '/:id/fulfillments/:fulfillmentId',
  authenticate,
  isVendor,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, trackingNumber, carrier, vendorNotes } = z.object({
        status: z.nativeEnum(FulfillmentStatus),
        trackingNumber: z.string().optional(),
        carrier: z.string().optional(),
        vendorNotes: z.string().optional(),
      }).parse(req.body)

      const fulfillment = await prisma.vendorFulfillment.findUnique({
        where: { id: req.params.fulfillmentId },
      })
      if (!fulfillment || fulfillment.vendorId !== req.auth!.vendorId) {
        throw new AppError(403, 'FORBIDDEN', 'Sin acceso a este envío')
      }

      const updated = await prisma.vendorFulfillment.update({
        where: { id: fulfillment.id },
        data: {
          status,
          trackingNumber,
          carrier,
          vendorNotes,
          ...(status === FulfillmentStatus.SHIPPED && { shippedAt: new Date() }),
          ...(status === FulfillmentStatus.DELIVERED && { deliveredAt: new Date() }),
        },
      })

      // Update line statuses
      const lineStatus = {
        [FulfillmentStatus.CONFIRMED]: OrderLineStatus.CONFIRMED,
        [FulfillmentStatus.PREPARING]: OrderLineStatus.PREPARING,
        [FulfillmentStatus.SHIPPED]: OrderLineStatus.SHIPPED,
        [FulfillmentStatus.DELIVERED]: OrderLineStatus.DELIVERED,
      }[status]

      if (lineStatus) {
        await prisma.orderLine.updateMany({
          where: { fulfillmentId: fulfillment.id },
          data: { status: lineStatus },
        })
      }

      ok(res, updated)
    } catch (err) {
      next(err)
    }
  },
)

// ─── Admin: cancelar pedido ────────────────────────────────────────────────────

orderRouter.post(
  '/:id/cancel',
  authenticate,
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reason } = z.object({ reason: z.string().min(5) }).parse(req.body)

      const order = await prisma.order.update({
        where: { id: req.params.id },
        data: {
          status: OrderStatus.CANCELLED,
          cancelReason: reason,
          events: {
            create: {
              eventType: 'order.cancelled',
              triggeredBy: EventTrigger.ADMIN,
              adminId: req.auth!.userId,
              metadata: { reason },
            },
          },
        },
      })
      ok(res, order)
    } catch (err) {
      next(err)
    }
  },
)
