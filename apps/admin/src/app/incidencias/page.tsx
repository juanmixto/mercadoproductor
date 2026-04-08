'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { adminApi } from '@/lib/api'
import { formatDate, formatPrice } from '@/lib/utils'
import { IncidentResolution } from '@mercadoproductor/shared'
import { XMarkIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const TYPE_LABELS: Record<string, string> = {
  ITEM_NOT_RECEIVED:     'No recibido',
  ITEM_DAMAGED:          'Producto dañado',
  WRONG_ITEM:            'Producto incorrecto',
  ITEM_NOT_AS_DESCRIBED: 'No coincide descripción',
  VENDOR_CANCELLED:      'Cancelado por productor',
  QUALITY_COMPLAINT:     'Queja de calidad',
  LATE_DELIVERY:         'Entrega tardía',
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  OPEN:              { label: 'Abierta',        color: 'bg-red-100 text-red-700',     dot: 'bg-red-500' },
  AWAITING_VENDOR:   { label: 'Esp. productor', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  AWAITING_CUSTOMER: { label: 'Esp. cliente',   color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  AWAITING_ADMIN:    { label: 'Acción requerida', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  RESOLVED:          { label: 'Resuelta',       color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  CLOSED:            { label: 'Cerrada',        color: 'bg-gray-100 text-gray-600',  dot: 'bg-gray-400' },
}

const RESOLUTION_OPTIONS = [
  { value: IncidentResolution.REFUND_FULL,    label: '💳 Devolución total' },
  { value: IncidentResolution.REFUND_PARTIAL, label: '💳 Devolución parcial' },
  { value: IncidentResolution.REPLACEMENT,    label: '📦 Reenvío del producto' },
  { value: IncidentResolution.GOODWILL_CREDIT, label: '🎁 Crédito de buena voluntad' },
  { value: IncidentResolution.REJECTED,       label: '❌ Rechazar reclamación' },
]

const FILTER_TABS = [
  { value: '', label: 'Todas' },
  { value: 'OPEN', label: 'Abiertas' },
  { value: 'AWAITING_ADMIN', label: 'Requieren acción' },
  { value: 'AWAITING_VENDOR', label: 'Esp. productor' },
  { value: 'RESOLVED,CLOSED', label: 'Resueltas' },
]

export default function IncidenciasPage() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [resolution, setResolution] = useState<IncidentResolution>(IncidentResolution.REFUND_FULL)
  const [refundAmount, setRefundAmount] = useState('')
  const [fundedBy, setFundedBy] = useState<'vendor' | 'marketplace' | 'split'>('marketplace')
  const [note, setNote] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-incidents', statusFilter],
    queryFn: () => {
      const params = statusFilter ? `?status=${statusFilter}` : ''
      return adminApi.get(`/incidents${params}`).then(r => r.data.data)
    },
  })

  const resolve = useMutation({
    mutationFn: (vars: any) => adminApi.patch(`/incidents/${vars.id}/resolve`, vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-incidents'] })
      qc.invalidateQueries({ queryKey: ['admin-sidebar-alerts'] })
      setSelected(null)
      setRefundAmount('')
      setNote('')
    },
  })

  const incidents = Array.isArray(data) ? data : (data?.data ?? [])
  const now = new Date()

  const openCount = incidents.filter((i: any) => i.status === 'OPEN').length
  const slaOverdueCount = incidents.filter((i: any) =>
    !['RESOLVED', 'CLOSED'].includes(i.status) && new Date(i.slaDeadline) < now
  ).length

  const needsRefund = resolution === IncidentResolution.REFUND_FULL || resolution === IncidentResolution.REFUND_PARTIAL

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incidencias</h1>
          <p className="text-sm text-gray-500">Gestión de reclamaciones y disputas</p>
        </div>
        {slaOverdueCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-800">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            {slaOverdueCount} fuera de SLA
          </div>
        )}
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 flex-wrap">
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-2.5">
          <span className="text-xs text-gray-400">Abiertas</span>
          <p className="text-xl font-bold text-gray-900">{openCount}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5">
          <span className="text-xs text-red-600">SLA vencido</span>
          <p className="text-xl font-bold text-red-700">{slaOverdueCount}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 w-fit overflow-x-auto">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              statusFilter === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                {['Ref.', 'Pedido', 'Tipo', 'Estado', 'SLA', 'Abierta', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-gray-100 animate-pulse" /></td>
                    ))}</tr>
                  ))
                : incidents.length === 0
                ? <tr><td colSpan={7} className="py-14 text-center text-sm text-gray-400">Sin incidencias</td></tr>
                : incidents.map((inc: any) => {
                    const st = STATUS_CONFIG[inc.status] ?? STATUS_CONFIG.OPEN
                    const slaDate = new Date(inc.slaDeadline)
                    const slaOverdue = slaDate < now && !['RESOLVED', 'CLOSED'].includes(inc.status)
                    const resolved = ['RESOLVED', 'CLOSED'].includes(inc.status)
                    return (
                      <tr key={inc.id} className={`transition hover:bg-gray-50 ${slaOverdue ? 'bg-red-50/30' : ''}`}>
                        <td className="px-4 py-3 font-mono text-xs text-gray-400">
                          {inc.incidentRef ?? inc.id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-indigo-600">
                          {inc.order?.orderNumber ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {TYPE_LABELS[inc.type] ?? inc.type}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                            <span className={`badge ${st.color} text-[11px]`}>{st.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {slaOverdue ? (
                            <div className="flex items-center gap-1 text-red-600 text-xs font-medium">
                              <ClockIcon className="h-3.5 w-3.5" />
                              Vencido
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">{formatDate(inc.slaDeadline)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {formatDate(inc.openedAt ?? inc.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          {!resolved ? (
                            <button
                              onClick={() => { setSelected(inc); setResolution(IncidentResolution.REFUND_FULL) }}
                              className="btn-primary text-xs px-3 py-1.5"
                            >
                              Resolver
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">{inc.resolution?.replace(/_/g, ' ') ?? '—'}</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-md overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="font-bold text-gray-900">Resolver incidencia</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selected.order?.orderNumber} · {TYPE_LABELS[selected.type] ?? selected.type}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 hover:bg-gray-100 transition">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 space-y-4">
              {/* SLA warning */}
              {new Date(selected.slaDeadline) < now && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-600 shrink-0" />
                  SLA vencido el {formatDate(selected.slaDeadline)} — resolución urgente
                </div>
              )}

              {/* Resolution type */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Resolución</label>
                <div className="space-y-1.5">
                  {RESOLUTION_OPTIONS.map(opt => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                        resolution === opt.value
                          ? 'border-indigo-300 bg-indigo-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="resolution"
                        value={opt.value}
                        checked={resolution === opt.value}
                        onChange={() => setResolution(opt.value as IncidentResolution)}
                        className="text-indigo-600"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Refund details */}
              {needsRefund && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Importe a devolver (€)</label>
                    <input
                      type="number"
                      value={refundAmount}
                      onChange={e => setRefundAmount(e.target.value)}
                      className="input"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">¿Quién asume el coste?</label>
                    <select
                      value={fundedBy}
                      onChange={e => setFundedBy(e.target.value as any)}
                      className="input"
                    >
                      <option value="vendor">Productor</option>
                      <option value="marketplace">Marketplace</option>
                      <option value="split">Repartido 50/50</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Internal note */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Nota interna</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={2}
                  className="input resize-none text-sm"
                  placeholder="Contexto adicional para el equipo..."
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-3 border-t border-gray-100 px-5 py-4">
              <button onClick={() => setSelected(null)} className="btn-secondary">Cancelar</button>
              <button
                onClick={() => resolve.mutate({
                  id: selected.id,
                  resolution,
                  refundAmount: refundAmount ? parseFloat(refundAmount) : undefined,
                  fundedBy: needsRefund ? fundedBy : undefined,
                  note: note || undefined,
                })}
                disabled={resolve.isPending || (needsRefund && !refundAmount)}
                className="btn-primary disabled:opacity-50"
              >
                {resolve.isPending ? 'Guardando...' : 'Confirmar resolución'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
