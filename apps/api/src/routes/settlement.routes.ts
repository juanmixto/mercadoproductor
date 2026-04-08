import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '@mercadoproductor/db'
import { SettlementStatus } from '@mercadoproductor/shared'
import { AppError } from '../middlewares/error.middleware'
import { authenticate, isAdmin, isSuperAdmin, isVendor } from '../middlewares/auth.middleware'
import { ok, created } from '../utils/response'

export const settlementRouter = Router()

// GET /api/v1/settlements/me — vendor ve sus liquidaciones
settlementRouter.get('/me', authenticate, isVendor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settlements = await prisma.settlement.findMany({
      where: { vendorId: req.auth!.vendorId },
      orderBy: { periodFrom: 'desc' },
      include: { lines: true },
    })
    ok(res, settlements)
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/settlements/generate — admin genera liquidación para un vendor
settlementRouter.post('/generate', authenticate, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vendorId, periodFrom, periodTo } = z.object({
      vendorId: z.string(),
      periodFrom: z.string().datetime(),
      periodTo: z.string().datetime(),
    }).parse(req.body)

    // Fetch completed order lines in period
    const lines = await prisma.orderLine.findMany({
      where: {
        vendorId,
        status: 'COMPLETED',
        createdAt: { gte: new Date(periodFrom), lte: new Date(periodTo) },
      },
      include: { order: true },
    })

    if (lines.length === 0) {
      throw new AppError(400, 'NO_LINES', 'Sin líneas completadas en este período')
    }

    // Find commission rule for vendor
    const rule = await prisma.commissionRule.findFirst({
      where: {
        isActive: true,
        OR: [{ vendorId }, { vendorId: null, appliesTo: 'all' }],
        validFrom: { lte: new Date() },
        OR: [{ validTo: null }, { validTo: { gte: new Date() } }] as never,
      },
      orderBy: { priority: 'desc' },
    })

    const defaultRate = rule?.rate ? Number(rule.rate) : 0.12

    const settlementLines = lines.map(line => {
      const gross = Number(line.lineTotal)
      const commission = gross * defaultRate
      return {
        orderLineId: line.id,
        orderId: line.orderId,
        grossAmount: gross,
        commissionRate: defaultRate,
        commissionAmount: commission,
        netAmount: gross - commission,
      }
    })

    const grossSales = settlementLines.reduce((s, l) => s + l.grossAmount, 0)
    const commissionTotal = settlementLines.reduce((s, l) => s + l.commissionAmount, 0)
    const netPayable = grossSales - commissionTotal

    const settlement = await prisma.settlement.create({
      data: {
        vendorId,
        periodFrom: new Date(periodFrom),
        periodTo: new Date(periodTo),
        status: SettlementStatus.DRAFT,
        grossSales,
        commissionTotal,
        refundsDeducted: 0,
        adjustments: 0,
        netPayable,
        lines: { create: settlementLines },
      },
      include: { lines: true },
    })

    created(res, settlement)
  } catch (err) {
    next(err)
  }
})

// PATCH /api/v1/settlements/:id/approve — superadmin aprueba
settlementRouter.patch('/:id/approve', authenticate, isSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settlement = await prisma.settlement.update({
      where: { id: req.params.id },
      data: {
        status: SettlementStatus.APPROVED,
        approvedBy: req.auth!.userId,
        approvedAt: new Date(),
      },
    })
    ok(res, settlement)
  } catch (err) {
    next(err)
  }
})

// PATCH /api/v1/settlements/:id/mark-paid — finance marca como pagado
settlementRouter.patch('/:id/mark-paid', authenticate, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentReference } = z.object({ paymentReference: z.string() }).parse(req.body)

    const settlement = await prisma.settlement.update({
      where: { id: req.params.id },
      data: {
        status: SettlementStatus.PAID,
        paymentReference,
        paidAt: new Date(),
      },
    })
    ok(res, settlement)
  } catch (err) {
    next(err)
  }
})
