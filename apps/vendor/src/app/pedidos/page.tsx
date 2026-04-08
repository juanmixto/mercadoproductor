'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vendorApi } from '@/lib/api'
import { FulfillmentStatus } from '@mercadoproductor/shared'
import { formatDate } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label: string; color: string; next?: FulfillmentStatus; nextLabel?: string }> = {
  PENDING:   { label: 'Pendiente confirmación', color: 'bg-amber-100 text-amber-700', next: FulfillmentStatus.CONFIRMED, nextLabel: 'Confirmar' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700', next: FulfillmentStatus.PREPARING, nextLabel: 'Empezar preparación' },
  PREPARING: { label: 'Preparando', color: 'bg-indigo-100 text-indigo-700', next: FulfillmentStatus.READY, nextLabel: 'Listo para enviar' },
  READY:     { label: 'Listo para enviar', color: 'bg-cyan-100 text-cyan-700', next: FulfillmentStatus.SHIPPED, nextLabel: 'Marcar enviado' },
  SHIPPED:   { label: 'Enviado', color: 'bg-purple-100 text-purple-700' },
  DELIVERED: { label: 'Entregado', color: 'bg-green-100 text-green-700' },
  FAILED:    { label: 'Fallido', color: 'bg-red-100 text-red-700' },
}

export default function PedidosVendorPage() {
  const qc = useQueryClient()

  // Note: In production, add a vendor-specific endpoint
  // For now, we list via the orders endpoint filtered by vendor
  const { data: fulfillments, isLoading } = useQuery({
    queryKey: ['vendor-fulfillments'],
    queryFn: () => vendorApi.get('/orders').then(r => r.data.data),
  })

  const updateFulfillment = useMutation({
    mutationFn: ({ orderId, fulfillmentId, status, trackingNumber, carrier }: {
      orderId: string; fulfillmentId: string; status: FulfillmentStatus; trackingNumber?: string; carrier?: string
    }) => vendorApi.patch(`/orders/${orderId}/fulfillments/${fulfillmentId}`, { status, trackingNumber, carrier }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-fulfillments'] }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis pedidos</h1>
        <p className="text-sm text-gray-500">Líneas de pedido asignadas a tu cuenta</p>
      </div>

      {isLoading && (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-gray-200" />)}
        </div>
      )}

      <div className="space-y-4">
        {(fulfillments as any[] ?? []).map((order: any) =>
          order.fulfillments?.map((f: any) => {
            const sc = STATUS_CONFIG[f.status] ?? STATUS_CONFIG.PENDING
            return (
              <div key={f.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                      <span className={`badge ${sc.color}`}>{sc.label}</span>
                    </div>
                    <p className="text-xs text-gray-400">{formatDate(order.placedAt)}</p>
                  </div>

                  {sc.next && (
                    <div className="flex items-center gap-2">
                      {sc.next === FulfillmentStatus.SHIPPED && (
                        <input
                          id={`tracking-${f.id}`}
                          placeholder="Nº seguimiento"
                          className="input w-40 text-xs"
                        />
                      )}
                      <button
                        onClick={() => {
                          const trackingEl = document.getElementById(`tracking-${f.id}`) as HTMLInputElement | null
                          updateFulfillment.mutate({
                            orderId: order.id,
                            fulfillmentId: f.id,
                            status: sc.next!,
                            trackingNumber: trackingEl?.value,
                          })
                        }}
                        className="btn-primary text-xs"
                      >
                        {sc.nextLabel}
                      </button>
                    </div>
                  )}
                </div>

                {/* Lines */}
                <div className="mt-3 divide-y divide-gray-100">
                  {f.lines?.map((line: any) => (
                    <div key={line.id} className="flex items-center justify-between py-2 text-sm">
                      <div>
                        <p className="font-medium text-gray-800">{(line.productSnapshot as any).name}</p>
                        <p className="text-xs text-gray-400">× {line.quantity}</p>
                      </div>
                      <span className="font-semibold">{Number(line.lineTotal).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      {(!fulfillments || (fulfillments as any[]).length === 0) && !isLoading && (
        <div className="py-20 text-center text-gray-400">Sin pedidos activos</div>
      )}
    </div>
  )
}
