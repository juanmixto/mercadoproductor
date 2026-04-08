import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UserRole } from '@mercadoproductor/shared'
import { AppError } from './error.middleware'

export interface AuthPayload {
  userId: string
  role: UserRole
  vendorId?: string
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    throw new AppError(401, 'UNAUTHORIZED', 'Token requerido')
  }
  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? '') as AuthPayload
    req.auth = payload
    next()
  } catch {
    throw new AppError(401, 'INVALID_TOKEN', 'Token inválido o expirado')
  }
}

export function requireRoles(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'No autenticado')
    if (!roles.includes(req.auth.role)) {
      throw new AppError(403, 'FORBIDDEN', 'Sin permisos suficientes')
    }
    next()
  }
}

export const isAdmin = requireRoles(
  UserRole.ADMIN_OPS,
  UserRole.ADMIN_CATALOG,
  UserRole.ADMIN_FINANCE,
  UserRole.ADMIN_SUPPORT,
  UserRole.SUPERADMIN,
)

export const isSuperAdmin = requireRoles(UserRole.SUPERADMIN)
export const isVendor = requireRoles(UserRole.VENDOR)
export const isCustomer = requireRoles(UserRole.CUSTOMER)
