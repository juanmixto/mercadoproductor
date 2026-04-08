import { Router, Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '@mercadoproductor/db'
import { UserRole } from '@mercadoproductor/shared'
import { AppError } from '../middlewares/error.middleware'
import { authenticate } from '../middlewares/auth.middleware'
import { ok, created } from '../utils/response'

export const authRouter = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

// POST /api/v1/auth/register
authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body)
    const exists = await prisma.user.findUnique({ where: { email: data.email } })
    if (exists) throw new AppError(409, 'EMAIL_IN_USE', 'El email ya está registrado')

    const passwordHash = await bcrypt.hash(data.password, 12)
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: UserRole.CUSTOMER,
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    })

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET ?? '',
      { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' },
    )

    created(res, { user, token })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/auth/login
authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email: data.email } })
    if (!user || !user.isActive) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Credenciales incorrectas')
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash)
    if (!valid) throw new AppError(401, 'INVALID_CREDENTIALS', 'Credenciales incorrectas')

    const vendor = user.role === UserRole.VENDOR
      ? await prisma.vendor.findUnique({ where: { userId: user.id }, select: { id: true } })
      : null

    const token = jwt.sign(
      { userId: user.id, role: user.role, vendorId: vendor?.id },
      process.env.JWT_SECRET ?? '',
      { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' },
    )

    ok(res, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/auth/me
authRouter.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth!.userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
    })
    if (!user) throw new AppError(404, 'NOT_FOUND', 'Usuario no encontrado')
    ok(res, user)
  } catch (err) {
    next(err)
  }
})
