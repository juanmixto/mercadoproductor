'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { adminApi } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const STATUS_LABELS: Record<string, { label: string; color: string; priority?: boolean }> = {
  PLACED:            { label: 'Recibido',      color: 'bg-gray-100 text-gray-700' },
  PAYMENT_PENDING:   { label: 'Pago pendiente', color: 'bg-yellow-100 text-yellow-700', priority: true },
  PAYMENT_CONFIRMED: { label: 'Pago OK',        color: 'bg-blue-100 text-blue-700' },
  PROCESSING:        { label: 'Procesando',     color: 'bg-indigo-100 text-indigo-700' },
  PARTIALLY_READY:   { label: 'Parcial listo',  color: 'bg-cyan-100 text-cyan-700' },
  READY_TO_SHIP:     { label: 'Listo envío',    color: 'bg-cyan-100 text-cyan-800', priority: true },
  SHIPPED:           { label: 'Enviado',        color: 'bg-purple-100 text-purple-700' },
  DELIVERED:         { label: 'Entregado',      color: 'bg-green-100 text-green-700' },
  COMPLETED:         { label: 'Completado',     color: 'bg-green-200 text-green-800' },
  CANCELLED:         { label: 'Cancelado',      color: 'bg-red-100 text-red-700' },
  PAYMENT_FAILED:    { label: 'Pago fallido',   color: 'bg-red-100 text-red-700', priority: true },
}

const PAYMENT_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Pendiente', color: 'text-amber-600' },
  SUCCEEDED: { label: 'Cobrado',   color: 'text-green-600' },
  FAILED:    { label: 'Fallido',   color: 'text-red-600' },
  REFUNDED:  { label: 'Devuelto',  color: 'text-indigo-600' },
}

const FILTER_TABS = [
  { value: '', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'PAYMENT_PENDING,PAYMENT_FAILED', label: 'Pago 🔴' },
  { value: 'SHIPPED', label: 'Enviados' },
  { value: 'CANCELLED', label: 'Cancelados' },
]

export default function PedidosPage() {
  const [search, setSearch] = useState('')
  const [tabFilter, setTabFilter] = useState('')
  const [page, setPage] = useState(1)

  const statusParam = tabFilter === 'active'
    ? 'PLACED,PAYMENT_CONFIRMED,PROCESSING,PARTIALLY_READY,READY_TO_SHIP'
    : tabFilter

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusParam, search, page],
    queryFn: () => {
      const params = new URLSearchParams()
      if (statusParam) params.set('status', statusParam)
      if (search) params.set('search', search)
      params.set('page', String(page))
      params.set('limit', '25')
      return adminApi.get(`/orders?${params}`).then(r => r.data)
    },
    keepPreviousData: true,
  })

  const orders = Array.isArray(data?.data) ? data.data : (data?.data?.data ?? [])
  const meta = data?.meta ?? {}

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        {meta.total > 0 && <p className="text-sm text-gray-500">{meta.total} pedidos en total</p>}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-xs">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar pedido, cliente..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input pl-9"
          />
        </div>
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1 w-fit overflow-x-auto">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => { setTabFilter(tab.value); setPage(1) }}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                tabFilter === tab.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                {['Nº Pedido', 'Cliente', 'Estado', 'Pago', 'Total', 'Fecha', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-gray-100 animate-pulse" /></td>
                    ))}</tr>
                  ))
                : orders.length === 0
                ? <tr><td colSpan={7} className="py-14 text-center text-sm text-gray-400">Sin pedidos con estos filtros</td></tr>
                : orders.map((order: any) => {
                    const st = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-700' }
                    const pt = PAYMENT_LABELS[order.paymentStatus] ?? { label: order.paymentStatus, color: 'text-gray-500' }
                    return (
                      <tr key={order.id} className={`transition hover:bg-gray-50 ${st.priority ? 'bg-amber-50/40' : ''}`}>
                        <td className="px-4 py-3 font-mono text-sm font-semibold text-indigo-600">
                          {order.orderNumber}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {order.customer?.firstName} {order.customer?.lastName}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${st.color}`}>{st.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium ${pt.color}`}>{pt.label}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {formatPrice(Number(order.grandTotal ?? order.totalAmount))}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {formatDate(order.placedAt ?? order.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/pedidos/${order.id}`} className="btn-secondary text-xs px-3 py-1.5">
                            Ver
                          </Link>
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-400">
              Página {meta.page} de {meta.totalPages}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={!meta.hasPrev}
                className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
              >
                ← Anterior
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!meta.hasNext}
                className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
