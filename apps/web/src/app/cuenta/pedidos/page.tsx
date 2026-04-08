'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils'
import { ChevronLeftIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PLACED:             { label: 'Recibido', color: 'bg-gray-100 text-gray-700' },
  PAYMENT_PENDING:    { label: 'Pago pendiente', color: 'bg-amber-100 text-amber-700' },
  PAYMENT_CONFIRMED:  { label: 'Pago confirmado', color: 'bg-blue-100 text-blue-700' },
  PROCESSING:         { label: 'En preparación', color: 'bg-indigo-100 text-indigo-700' },
  SHIPPED:            { label: 'Enviado', color: 'bg-purple-100 text-purple-700' },
  DELIVERED:          { label: 'Entregado', color: 'bg-green-100 text-green-700' },
  COMPLETED:          { label: 'Completado', color: 'bg-green-100 text-green-700' },
  CANCELLED:          { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
}

export default function MisPedidosPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) router.replace('/auth/login')
  }, [isAuthenticated, router])

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => apiClient.get('/orders/me').then(r => r.data.data ?? []),
    enabled: isAuthenticated,
  })

  const orders: any[] = data ?? []

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/cuenta" className="rounded-lg p-1.5 hover:bg-gray-100 transition">
          <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis pedidos</h1>
          <p className="text-sm text-gray-500">Historial y seguimiento</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <ShoppingBagIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-gray-500 font-medium">Aún no tienes pedidos</p>
          <p className="text-sm text-gray-400 mt-1">¡Empieza explorando nuestros productos!</p>
          <Link href="/productos" className="btn-primary mt-6 inline-flex">
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => {
            const status = STATUS_MAP[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600' }
            return (
              <div key={order.id} className="card p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                      <span className={`badge ${status.color}`}>{status.label}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                    {order.lines?.length > 0 && (
                      <p className="mt-1.5 text-sm text-gray-600 line-clamp-1">
                        {order.lines.map((l: any) => l.productName).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900">{formatPrice(Number(order.totalAmount))}</p>
                    <p className="text-xs text-gray-400">{order.lines?.length ?? 0} productos</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
