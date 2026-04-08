import { Response } from 'express'
import { ApiResponse, PaginatedResponse } from '@mercadoproductor/shared'

export function ok<T>(res: Response, data: T, status = 200): Response {
  const body: ApiResponse<T> = { success: true, data }
  return res.status(status).json(body)
}

export function created<T>(res: Response, data: T): Response {
  return ok(res, data, 201)
}

export function paginated<T>(res: Response, result: PaginatedResponse<T>): Response {
  return res.status(200).json({ success: true, ...result })
}

export function noContent(res: Response): Response {
  return res.status(204).send()
}
