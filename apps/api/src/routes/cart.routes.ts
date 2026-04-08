import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '@mercadoproductor/db'
import { CartStatus, ProductStatus } from '@mercadoproductor/shared'
import { AppError } from '../middlewares/error.middleware'
import { ok, created } from '../utils/response'
import dayjs from 'dayjs'

export const cartRouter = Router()

async function getOrCreateCart(sessionId: string, customerId?: string) {
  const existing = await prisma.cart.findFirst({
    where: {
      status: CartStatus.ACTIVE,
      OR: [
        { sessionId },
        ...(customerId ? [{ customerId }] : []),
      ],
    },
    include: { items: true },
  })
  if (existing) return existing

  return prisma.cart.create({
    data: {
      sessionId,
      customerId,
      currency: 'EUR',
      expiresAt: dayjs().add(7, 'day').toDate(),
    },
    include: { items: true },
  })
}

// GET /api/v1/cart
cartRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.headers['x-session-id'] as string
    if (!sessionId) throw new AppError(400, 'SESSION_REQUIRED', 'x-session-id requerido')

    const cart = await prisma.cart.findFirst({
      where: { sessionId, status: CartStatus.ACTIVE },
      include: {
        items: {
          include: {
            product: { select: { name: true, images: true, status: true, basePrice: true } },
          },
        },
      },
    })

    if (!cart) {
      ok(res, { items: [], subtotal: 0 })
      return
    }

    // Check availability and price changes
    const items = cart.items.map(item => ({
      ...item,
      isAvailable: item.product.status === ProductStatus.ACTIVE && item.product !== null,
      priceChanged: Number(item.unitPrice) !== Number(item.product.basePrice),
    }))

    const subtotal = items
      .filter(i => i.isAvailable)
      .reduce((sum, i) => sum + Number(i.unitPrice) * i.quantity, 0)

    ok(res, { ...cart, items, subtotal })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/cart/items
cartRouter.post('/items', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.headers['x-session-id'] as string
    if (!sessionId) throw new AppError(400, 'SESSION_REQUIRED', 'x-session-id requerido')

    const { productId, variantId, quantity } = z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      quantity: z.number().int().positive(),
    }).parse(req.body)

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { vendor: { select: { id: true, displayName: true } } },
    })
    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new AppError(404, 'NOT_FOUND', 'Producto no disponible')
    }
    if (product.stock < quantity) {
      throw new AppError(400, 'INSUFFICIENT_STOCK', `Stock disponible: ${product.stock}`)
    }

    const cart = await getOrCreateCart(sessionId)

    const priceSnapshot = {
      name: product.name,
      imageUrl: product.images[0] ?? '',
      vendorName: product.vendor.displayName,
      price: Number(product.basePrice),
      capturedAt: new Date(),
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, variantId: variantId ?? null },
    })

    if (existingItem) {
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      })
      ok(res, updated)
    } else {
      const item = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId,
          vendorId: product.vendorId,
          quantity,
          unitPrice: product.basePrice,
          priceSnapshot,
          fulfillmentGroup: product.vendorId,
        },
      })
      created(res, item)
    }
  } catch (err) {
    next(err)
  }
})

// PATCH /api/v1/cart/items/:itemId
cartRouter.patch('/items/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quantity } = z.object({ quantity: z.number().int().min(0) }).parse(req.body)
    const sessionId = req.headers['x-session-id'] as string

    const item = await prisma.cartItem.findUnique({
      where: { id: req.params.itemId },
      include: { cart: true },
    })
    if (!item || item.cart.sessionId !== sessionId) {
      throw new AppError(404, 'NOT_FOUND', 'Item no encontrado')
    }

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: item.id } })
      ok(res, { deleted: true })
    } else {
      const updated = await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity },
      })
      ok(res, updated)
    }
  } catch (err) {
    next(err)
  }
})

// DELETE /api/v1/cart/items/:itemId
cartRouter.delete('/items/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.headers['x-session-id'] as string
    const item = await prisma.cartItem.findUnique({
      where: { id: req.params.itemId },
      include: { cart: true },
    })
    if (!item || item.cart.sessionId !== sessionId) {
      throw new AppError(404, 'NOT_FOUND', 'Item no encontrado')
    }
    await prisma.cartItem.delete({ where: { id: item.id } })
    ok(res, { deleted: true })
  } catch (err) {
    next(err)
  }
})
