import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '@mercadoproductor/db'
import { OrderStatus, ProductStatus, VendorStatus, IncidentStatus } from '@mercadoproductor/shared'
import { authenticate, isAdmin } from '../middlewares/auth.middleware'
import { ok } from '../utils/response'

export const adminRouter = Router()

// GET /api/v1/admin/dashboard — métricas globales
adminRouter.get('/dashboard', authenticate, isAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      activeVendors,
      pendingVendors,
      pendingProducts,
      openIncidents,
      todayRevenue,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: OrderStatus.PROCESSING } }),
      prisma.vendor.count({ where: { status: VendorStatus.ACTIVE } }),
      prisma.vendor.count({ where: { status: VendorStatus.APPLYING } }),
      prisma.product.count({ where: { status: ProductStatus.PENDING_REVIEW } }),
      prisma.incident.count({ where: { status: { in: [IncidentStatus.OPEN, IncidentStatus.AWAITING_ADMIN] } } }),
      prisma.order.aggregate({
        where: {
          placedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          paymentStatus: 'SUCCEEDED',
        },
        _sum: { grandTotal: true },
      }),
    ])

    ok(res, {
      orders: { total: totalOrders, pending: pendingOrders },
      vendors: { active: activeVendors, pending: pendingVendors },
      products: { pendingReview: pendingProducts },
      incidents: { open: openIncidents },
      revenue: { today: Number(todayRevenue._sum.grandTotal ?? 0) },
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/admin/products/pending — cola de revisión
adminRouter.get('/products/pending', authenticate, isAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: ProductStatus.PENDING_REVIEW },
      include: { vendor: { select: { displayName: true, slug: true } }, category: true },
      orderBy: { updatedAt: 'asc' },
    })
    ok(res, products)
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/admin/incidents/overdue — incidencias fuera de SLA
adminRouter.get('/incidents/overdue', authenticate, isAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const incidents = await prisma.incident.findMany({
      where: {
        status: { notIn: [IncidentStatus.RESOLVED, IncidentStatus.CLOSED] },
        slaDeadline: { lt: new Date() },
      },
      include: {
        order: { select: { orderNumber: true } },
        customer: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { slaDeadline: 'asc' },
    })
    ok(res, incidents)
  } catch (err) {
    next(err)
  }
})
