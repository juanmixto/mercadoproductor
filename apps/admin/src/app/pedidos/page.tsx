'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { adminApi } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PLACED:               { label: 'Recibido',     color: 'bg-gray-100 text-gray-700' },
  PAYMENT_PENDING:      { label: 'Pago pendiente', color: 'bg-yellow-100 text-yellow-700' },
  PAYMENT_CONFIRMED:    { label: 'Pago OK',       color: 'bg-blue-100 text-blue-700' },
  PROCESSING:           { label: 'Procesando',    color: 'bg-indigo-100 text-indigo-700' },
  SHIPPED:              { label: 'Enviado',        color: 'bg-purple-100 text-purple-700' },
  DELIVERED:            { label: 'Entregado',     color: 'bg-green-100 text-green-700' },
  COMPLETED:            { label: 'Completado',    color: 'bg-green-200 text-green-800' },
  CANCELLED:            { label: 'Cancelado',     color: 'bg-red-100 text-red-700' },
  PAYMENT_FAILED:       { label: 'Pago fallido',  color: 'bg-red-100 text-red-700' },
}

export default function PedidosPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', statusFilter, search],
    queryFn: () => {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (search) params.set('search', search)
      return adminApi.get(`/orders?${params}`).then(r => r.data.data)
    },
  })

  const orders = Array.isArray(data) ? data : (data?.data ?? [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Buscar por número de pedido..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="input max-w-xs"
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              {['Nº Pedido', 'Cliente', 'Estado', 'Pago', 'Total', 'Fecha', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-gray-100 animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">Sin pedidos</td></tr>
            ) : (
              orders.map((order: any) => {
                const st = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-700' }
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono font-semibold text-indigo-600">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {order.customer?.firstName} {order.customer?.lastName}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${order.paymentStatus === 'SUCCEEDED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(order.grandTotal)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(order.placedAt)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/pedidos/${order.id}`} className="btn-secondary text-xs">Ver</Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
