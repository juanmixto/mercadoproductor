import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '@mercadoproductor/db'
import { IncidentType, IncidentStatus, IncidentResolution } from '@mercadoproductor/shared'
import { AppError } from '../middlewares/error.middleware'
import { authenticate, isAdmin } from '../middlewares/auth.middleware'
import { ok, created } from '../utils/response'
import dayjs from 'dayjs'

export const incidentRouter = Router()

const SLA_HOURS: Record<IncidentType, number> = {
  [IncidentType.ITEM_NOT_RECEIVED]: 24,
  [IncidentType.ITEM_DAMAGED]: 24,
  [IncidentType.WRONG_ITEM]: 24,
  [IncidentType.ITEM_NOT_AS_DESCRIBED]: 48,
  [IncidentType.VENDOR_CANCELLED]: 4,
  [IncidentType.QUALITY_COMPLAINT]: 48,
}

// POST /api/v1/incidents — cliente abre incidencia
incidentRouter.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, orderLineId, type, body, attachments } = z.object({
      orderId: z.string(),
      orderLineId: z.string().optional(),
      type: z.nativeEnum(IncidentType),
      body: z.string().min(10),
      attachments: z.array(z.string()).default([]),
    }).parse(req.body)

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order || order.customerId !== req.auth!.userId) {
      throw new AppError(403, 'FORBIDDEN', 'Sin acceso a este pedido')
    }

    const line = orderLineId
      ? await prisma.orderLine.findUnique({ where: { id: orderLineId } })
      : null

    const incident = await prisma.incident.create({
      data: {
        orderId,
        orderLineId,
        vendorId: line?.vendorId ?? '',
        customerId: req.auth!.userId,
        type,
        status: IncidentStatus.OPEN,
        slaDeadline: dayjs().add(SLA_HOURS[type], 'hour').toDate(),
        messages: {
          create: {
            senderType: 'customer',
            senderId: req.auth!.userId,
            body,
            attachments,
          },
        },
      },
      include: { messages: true },
    })
    created(res, incident)
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/incidents — lista del cliente
incidentRouter.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const incidents = await prisma.incident.findMany({
      where: { customerId: req.auth!.userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
      orderBy: { openedAt: 'desc' },
    })
    ok(res, incidents)
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/incidents/:id/messages — añadir mensaje
incidentRouter.post('/:id/messages', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body, attachments } = z.object({
      body: z.string().min(1),
      attachments: z.array(z.string()).default([]),
    }).parse(req.body)

    const incident = await prisma.incident.findUnique({ where: { id: req.params.id } })
    if (!incident) throw new AppError(404, 'NOT_FOUND', 'Incidencia no encontrada')
    if (incident.customerId !== req.auth!.userId) {
      throw new AppError(403, 'FORBIDDEN', 'Sin acceso')
    }

    const message = await prisma.incidentMessage.create({
      data: {
        incidentId: incident.id,
        senderType: 'customer',
        senderId: req.auth!.userId,
        body,
        attachments,
      },
    })

    await prisma.incident.update({
      where: { id: incident.id },
      data: { status: IncidentStatus.AWAITING_ADMIN },
    })

    created(res, message)
  } catch (err) {
    next(err)
  }
})

// PATCH /api/v1/incidents/:id/resolve — admin resuelve
incidentRouter.patch('/:id/resolve', authenticate, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resolution, refundAmount, fundedBy, internalNote } = z.object({
      resolution: z.nativeEnum(IncidentResolution),
      refundAmount: z.number().positive().optional(),
      fundedBy: z.enum(['vendor', 'marketplace', 'split']).optional(),
      internalNote: z.string().optional(),
    }).parse(req.body)

    const incident = await prisma.$transaction(async (tx) => {
      const updated = await tx.incident.update({
        where: { id: req.params.id },
        data: {
          status: IncidentStatus.RESOLVED,
          resolution,
          internalNote,
          resolvedAt: new Date(),
        },
      })

      if (refundAmount && fundedBy) {
        await tx.incidentRefund.create({
          data: {
            incidentId: updated.id,
            amount: refundAmount,
            reason: resolution,
            fundedBy,
            paymentMethod: 'original',
            processedBy: req.auth!.userId,
          },
        })
      }

      return updated
    })

    ok(res, incident)
  } catch (err) {
    next(err)
  }
})
