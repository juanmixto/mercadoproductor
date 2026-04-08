'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vendorApi } from '@/lib/api'
import { FulfillmentStatus } from '@mercadoproductor/shared'
import { formatDate, formatPrice } from '@/lib/utils'
import { useState } from 'react'
import {
  ClockIcon, CheckCircleIcon, TruckIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

const STATUS_CONFIG: Record<string, {
  label: string; color: string; next?: FulfillmentStatus; nextLabel?: string; icon: any; urgent?: boolean
}> = {
  PENDING:   { label: 'Pendiente confirmación', color: 'bg-amber-100 text-amber-700', next: FulfillmentStatus.CONFIRMED, nextLabel: 'Confirmar pedido', icon: ClockIcon, urgent: true },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700', next: FulfillmentStatus.PREPARING, nextLabel: 'Empezar preparación', icon: CheckCircleIcon },
  PREPARING: { label: 'En preparación', color: 'bg-indigo-100 text-indigo-700', next: FulfillmentStatus.READY, nextLabel: 'Marcar como listo', icon: ClockIcon },
  READY:     { label: 'Listo para enviar', color: 'bg-cyan-100 text-cyan-700', next: FulfillmentStatus.SHIPPED, nextLabel: 'Marcar enviado', icon: TruckIcon, urgent: true },
  SHIPPED:   { label: 'Enviado', color: 'bg-purple-100 text-purple-700', icon: TruckIcon },
  DELIVERED: { label: 'Entregado', color: 'bg-green-100 text-green-700', icon: CheckCircleIcon },
  FAILED:    { label: 'Fallido', color: 'bg-red-100 text-red-700', icon: ExclamationTriangleIcon },
}

const FILTER_TABS = [
  { value: 'active', label: 'Activos' },
  { value: 'urgent', label: 'Urgentes' },
  { value: 'shipped', label: 'Enviados' },
  { value: 'all', label: 'Todos' },
]

export default function PedidosVendorPage() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState('active')
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({})

  const { data: orders, isLoading } = useQuery({
    queryKey: ['vendor-fulfillments'],
    queryFn: () => vendorApi.get('/orders').then(r => r.data.data ?? []),
  })

  const updateFulfillment = useMutation({
    mutationFn: ({ orderId, fulfillmentId, status, trackingNumber }: {
      orderId: string; fulfillmentId: string; status: FulfillmentStatus; trackingNumber?: string
    }) => vendorApi.patch(`/orders/${orderId}/fulfillments/${fulfillmentId}`, { status, trackingNumber }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-fulfillments'] }),
  })

  // Flatten fulfillments
  const allFulfillments = (orders as any[] ?? []).flatMap((o: any) =>
    (o.fulfillments ?? []).map((f: any) => ({ ...f, order: o }))
  )

  const filtered = allFulfillments.filter((f: any) => {
    if (activeTab === 'active') return !['DELIVERED', 'FAILED'].includes(f.status)
    if (activeTab === 'urgent') return f.status === 'PENDING' || f.status === 'READY'
    if (activeTab === 'shipped') return f.status === 'SHIPPED' || f.status === 'DELIVERED'
    return true
  })

  const urgentCount = allFulfillments.filter((f: any) => f.status === 'PENDING' || f.status === 'READY').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis pedidos</h1>
        <p className="text-sm text-gray-500">Gestiona el estado de tus pedidos</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`relative rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              activeTab === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.value === 'urgent' && urgentCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {urgentCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-xl bg-gray-100" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-400">No hay pedidos en esta categoría</p>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((f: any) => {
          const sc = STATUS_CONFIG[f.status] ?? STATUS_CONFIG.PENDING
          const StatusIcon = sc.icon
          const lines = f.lines ?? []

          return (
            <div
              key={f.id}
              className={`card overflow-hidden transition-shadow hover:shadow-md ${sc.urgent ? 'border-amber-300 ring-1 ring-amber-200' : ''}`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between px-5 py-3 ${sc.urgent ? 'bg-amber-50' : 'bg-gray-50'} border-b border-gray-100`}>
                <div className="flex items-center gap-3">
                  <StatusIcon className={`h-4 w-4 ${sc.urgent ? 'text-amber-600' : 'text-gray-400'}`} />
                  <p className="font-semibold text-gray-900 text-sm">{f.order.orderNumber}</p>
                  <span className={`badge ${sc.color}`}>{sc.label}</span>
                </div>
                <p className="text-xs text-gray-400">{formatDate(f.order.placedAt)}</p>
              </div>

              {/* Lines */}
              <div className="divide-y divide-gray-50 px-5">
                {lines.map((line: any) => (
                  <div key={line.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{(line.productSnapshot as any)?.name ?? 'Producto'}</p>
                      <p className="text-xs text-gray-400">
                        {line.quantity} {(line.productSnapshot as any)?.unit ?? 'ud'}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPrice(Number(line.lineTotal))}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action */}
              {sc.next && (
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 flex items-center justify-between gap-3">
                  {sc.next === FulfillmentStatus.SHIPPED ? (
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        type="text"
                        placeholder="Número de seguimiento (opcional)"
                        value={trackingInputs[f.id] ?? ''}
                        onChange={e => setTrackingInputs(prev => ({ ...prev, [f.id]: e.target.value }))}
                        className="input flex-1 text-xs py-2"
                      />
                      <button
                        onClick={() => updateFulfillment.mutate({
                          orderId: f.order.id,
                          fulfillmentId: f.id,
                          status: sc.next!,
                          trackingNumber: trackingInputs[f.id],
                        })}
                        disabled={updateFulfillment.isPending}
                        className="btn-primary text-xs px-4 shrink-0"
                      >
                        <TruckIcon className="h-4 w-4" />
                        {sc.nextLabel}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <p className="text-xs text-gray-500">
                        {sc.urgent ? '⚡ Acción requerida' : 'Siguiente paso'}
                      </p>
                      <button
                        onClick={() => updateFulfillment.mutate({
                          orderId: f.order.id,
                          fulfillmentId: f.id,
                          status: sc.next!,
                        })}
                        disabled={updateFulfillment.isPending}
                        className={`text-sm font-medium px-4 py-2 rounded-lg transition ${
                          sc.urgent
                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                            : 'btn-primary'
                        }`}
                      >
                        {sc.nextLabel}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
