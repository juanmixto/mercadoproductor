import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '@mercadoproductor/db'
import { VendorStatus, UserRole } from '@mercadoproductor/shared'
import { AppError } from '../middlewares/error.middleware'
import { authenticate, isAdmin, isSuperAdmin } from '../middlewares/auth.middleware'
import { ok, created, paginated } from '../utils/response'

export const vendorRouter = Router()

// ─── Public ──────────────────────────────────────────────────────────────────

// GET /api/v1/vendors — listado público
vendorRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page ?? 1)
    const limit = Math.min(Number(req.query.limit ?? 20), 50)
    const skip = (page - 1) * limit

    const [total, data] = await Promise.all([
      prisma.vendor.count({ where: { status: VendorStatus.ACTIVE } }),
      prisma.vendor.findMany({
        where: { status: VendorStatus.ACTIVE },
        skip,
        take: limit,
        select: {
          id: true, slug: true, displayName: true,
          logoUrl: true, location: true, description: true,
          avgRating: true, totalReviews: true,
        },
        orderBy: { avgRating: 'desc' },
      }),
    ])

    paginated(res, {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/vendors/:slug
vendorRouter.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await prisma.vendor.findFirst({
      where: { slug: req.params.slug, status: VendorStatus.ACTIVE },
      select: {
        id: true, slug: true, displayName: true, description: true,
        logoUrl: true, bannerUrl: true, location: true, originRegion: true,
        avgRating: true, totalReviews: true, website: true, activatedAt: true,
      },
    })
    if (!vendor) throw new AppError(404, 'NOT_FOUND', 'Productor no encontrado')
    ok(res, vendor)
  } catch (err) {
    next(err)
  }
})

// ─── Vendor registration ──────────────────────────────────────────────────────

const applySchema = z.object({
  displayName: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  description: z.string().min(20).optional(),
  location: z.string(),
  originRegion: z.string().optional(),
  taxId: z.string(),
  iban: z.string(),
  bankAccountName: z.string(),
  orderCutoffDays: z.array(z.string()).default(['MON', 'WED', 'FRI']),
  orderCutoffTime: z.string().default('12:00'),
  preparationDays: z.number().int().min(0).default(1),
})

// POST /api/v1/vendors/apply
vendorRouter.post('/apply', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = applySchema.parse(req.body)
    const existing = await prisma.vendor.findUnique({ where: { userId: req.auth!.userId } })
    if (existing) throw new AppError(409, 'ALREADY_APPLIED', 'Ya tienes una solicitud enviada')

    const vendor = await prisma.vendor.create({
      data: {
        ...data,
        userId: req.auth!.userId,
        status: VendorStatus.APPLYING,
      },
    })
    created(res, { id: vendor.id, status: vendor.status })
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/vendors/me — panel del productor
vendorRouter.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.auth!.userId },
      include: {
        _count: { select: { products: true } },
      },
    })
    if (!vendor) throw new AppError(404, 'NOT_FOUND', 'Perfil de productor no encontrado')
    ok(res, vendor)
  } catch (err) {
    next(err)
  }
})

// ─── Admin ───────────────────────────────────────────────────────────────────

// GET /api/v1/vendors/admin/list — lista para admin
vendorRouter.get('/admin/list', authenticate, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as VendorStatus | undefined
    const vendors = await prisma.vendor.findMany({
      where: { ...(status && { status }) },
      include: { user: { select: { email: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    })
    ok(res, vendors)
  } catch (err) {
    next(err)
  }
})

// PATCH /api/v1/vendors/:id/status — admin cambia estado
vendorRouter.patch('/:id/status', authenticate, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, reason } = z.object({
      status: z.nativeEnum(VendorStatus),
      reason: z.string().optional(),
    }).parse(req.body)

    const vendor = await prisma.vendor.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(status === VendorStatus.REJECTED && { rejectionReason: reason }),
        ...(status === VendorStatus.ACTIVE && { activatedAt: new Date() }),
        vendorEvents: {
          create: {
            eventType: `vendor.status.${status.toLowerCase()}`,
            triggeredBy: 'admin',
            metadata: { reason },
          },
        },
      },
    })

    // If activated, update user role to VENDOR
    if (status === VendorStatus.ACTIVE) {
      await prisma.user.update({
        where: { id: vendor.userId },
        data: { role: UserRole.VENDOR },
      })
    }

    ok(res, vendor)
  } catch (err) {
    next(err)
  }
})
