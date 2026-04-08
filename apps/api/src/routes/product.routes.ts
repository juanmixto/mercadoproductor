import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '@mercadoproductor/db'
import { ProductStatus } from '@mercadoproductor/shared'
import { AppError } from '../middlewares/error.middleware'
import { authenticate, isVendor, isAdmin } from '../middlewares/auth.middleware'
import { ok, created, paginated } from '../utils/response'

export const productRouter = Router()

// ─── Public routes ───────────────────────────────────────────────────────────

// GET /api/v1/products — listado público activo
productRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page ?? 1)
    const limit = Math.min(Number(req.query.limit ?? 20), 100)
    const skip = (page - 1) * limit
    const categoryId = req.query.categoryId as string | undefined
    const search = req.query.search as string | undefined
    const vendorId = req.query.vendorId as string | undefined

    const where = {
      status: ProductStatus.ACTIVE,
      ...(categoryId && { categoryId }),
      ...(vendorId && { vendorId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { tags: { has: search } },
        ],
      }),
    }

    const [total, data] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          vendor: { select: { id: true, slug: true, displayName: true, logoUrl: true, location: true } },
          category: { select: { id: true, slug: true, name: true } },
          variants: { where: { isActive: true } },
        },
      }),
    ])

    paginated(res, {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/products/:slug
productRouter.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: req.params.slug, status: ProductStatus.ACTIVE },
      include: {
        vendor: { select: { id: true, slug: true, displayName: true, logoUrl: true, location: true, description: true } },
        category: true,
        variants: { where: { isActive: true }, orderBy: { position: 'asc' } },
      },
    })
    if (!product) throw new AppError(404, 'NOT_FOUND', 'Producto no encontrado')
    ok(res, product)
  } catch (err) {
    next(err)
  }
})

// ─── Vendor routes ───────────────────────────────────────────────────────────

const createProductSchema = z.object({
  categoryId: z.string(),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  name: z.string().min(3),
  description: z.string().min(10),
  images: z.array(z.string().url()).min(1),
  basePrice: z.number().positive(),
  taxRate: z.number().min(0).max(1).default(0.1),
  unit: z.string().default('ud'),
  minOrderQuantity: z.number().int().positive().default(1),
  stock: z.number().int().min(0),
  tags: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  originRegion: z.string().optional(),
})

// POST /api/v1/products — vendor crea producto
productRouter.post(
  '/',
  authenticate,
  isVendor,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createProductSchema.parse(req.body)
      const vendorId = req.auth!.vendorId
      if (!vendorId) throw new AppError(400, 'NO_VENDOR', 'Sin perfil de productor')

      const product = await prisma.product.create({
        data: {
          ...data,
          vendorId,
          status: ProductStatus.PENDING_REVIEW,
          basePrice: data.basePrice,
          taxRate: data.taxRate,
        },
      })
      created(res, product)
    } catch (err) {
      next(err)
    }
  },
)

// PATCH /api/v1/products/:id — vendor actualiza su producto
productRouter.patch(
  '/:id',
  authenticate,
  isVendor,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await prisma.product.findUnique({ where: { id: req.params.id } })
      if (!product) throw new AppError(404, 'NOT_FOUND', 'Producto no encontrado')
      if (product.vendorId !== req.auth!.vendorId) {
        throw new AppError(403, 'FORBIDDEN', 'No tienes acceso a este producto')
      }

      const allowedFields = ['description', 'images', 'stock', 'tags', 'certifications', 'minOrderQuantity', 'maxOrderQuantity']
      const sensitiveFields = ['basePrice', 'name', 'slug'] // requieren re-revisión

      const updates: Record<string, unknown> = {}
      const requiresReview = sensitiveFields.some(f => req.body[f] !== undefined)

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) updates[field] = req.body[field]
      }
      if (requiresReview) {
        for (const field of sensitiveFields) {
          if (req.body[field] !== undefined) updates[field] = req.body[field]
        }
        if (req.body.basePrice && product.basePrice !== req.body.basePrice) {
          updates.previousPrice = product.basePrice
          updates.lastPriceChange = new Date()
        }
        updates.status = ProductStatus.PENDING_REVIEW
      }

      const updated = await prisma.product.update({ where: { id: req.params.id }, data: updates })
      ok(res, updated)
    } catch (err) {
      next(err)
    }
  },
)

// ─── Admin routes ────────────────────────────────────────────────────────────

// PATCH /api/v1/products/:id/review — admin aprueba/rechaza
productRouter.patch(
  '/:id/review',
  authenticate,
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { action, note } = z.object({
        action: z.enum(['approve', 'reject']),
        note: z.string().optional(),
      }).parse(req.body)

      const status = action === 'approve' ? ProductStatus.ACTIVE : ProductStatus.REJECTED
      const updated = await prisma.product.update({
        where: { id: req.params.id },
        data: {
          status,
          reviewNote: note,
          ...(status === ProductStatus.ACTIVE && { publishedAt: new Date() }),
          ...(status === ProductStatus.REJECTED && { rejectionReason: note }),
        },
      })
      ok(res, updated)
    } catch (err) {
      next(err)
    }
  },
)
