'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { adminApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { IncidentType, IncidentStatus, IncidentResolution } from '@mercadoproductor/shared'

const TYPE_LABELS: Record<string, string> = {
  ITEM_NOT_RECEIVED:     'No recibido',
  ITEM_DAMAGED:          'Dañado',
  WRONG_ITEM:            'Producto incorrecto',
  ITEM_NOT_AS_DESCRIBED: 'No es como se describe',
  VENDOR_CANCELLED:      'Cancelado por productor',
  QUALITY_COMPLAINT:     'Queja de calidad',
  LATE_DELIVERY:         'Entrega tardía',
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  OPEN:               { label: 'Abierta',           color: 'bg-red-100 text-red-700' },
  AWAITING_VENDOR:    { label: 'Esp. productor',    color: 'bg-orange-100 text-orange-700' },
  AWAITING_CUSTOMER:  { label: 'Esp. cliente',      color: 'bg-yellow-100 text-yellow-700' },
  AWAITING_ADMIN:     { label: 'Esp. admin',        color: 'bg-blue-100 text-blue-700' },
  RESOLVED:           { label: 'Resuelta',          color: 'bg-green-100 text-green-700' },
  CLOSED:             { label: 'Cerrada',           color: 'bg-gray-100 text-gray-600' },
}

export default function IncidenciasPage() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState<any>(null)
  const [resolution, setResolution] = useState(IncidentResolution.REFUND_FULL)
  const [refundAmount, setRefundAmount] = useState('')
  const [fundedBy, setFundedBy] = useState('marketplace')
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'incidents', statusFilter],
    queryFn: () => {
      const params = statusFilter ? `?status=${statusFilter}` : ''
      return adminApi.get(`/incidents${params}`).then(r => r.data.data)
    },
  })

  const resolve = useMutation({
    mutationFn: (vars: any) => adminApi.patch(`/incidents/${vars.id}/resolve`, vars),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'incidents'] }); setSelected(null) },
  })

  const incidents = Array.isArray(data) ? data : (data?.data ?? [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Incidencias</h1>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setStatusFilter('')} className={`badge cursor-pointer px-3 py-1 ${!statusFilter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Todas</button>
        {Object.entries(STATUS_CONFIG).map(([val, { label, color }]) => (
          <button key={val} onClick={() => setStatusFilter(val)} className={`badge cursor-pointer px-3 py-1 ${statusFilter === val ? 'bg-indigo-600 text-white' : color}`}>{label}</button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              {['Ref.', 'Pedido', 'Tipo', 'Estado', 'SLA', 'Abierta', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-gray-100 animate-pulse" /></td>)}</tr>
                ))
              : incidents.length === 0
              ? <tr><td colSpan={7} className="py-12 text-center text-gray-400">Sin incidencias</td></tr>
              : incidents.map((inc: any) => {
                  const st = STATUS_CONFIG[inc.status] ?? { label: inc.status, color: 'bg-gray-100' }
                  const slaDate = new Date(inc.slaDeadline)
                  const slaOverdue = slaDate < new Date() && !['RESOLVED', 'CLOSED'].includes(inc.status)
                  return (
                    <tr key={inc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{inc.incidentRef ?? inc.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 font-semibold text-indigo-600">{inc.order?.orderNumber}</td>
                      <td className="px-4 py-3 text-gray-700">{TYPE_LABELS[inc.type] ?? inc.type}</td>
                      <td className="px-4 py-3"><span className={`badge ${st.color}`}>{st.label}</span></td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${slaOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                          {slaOverdue ? '⚠ Vencido' : formatDate(inc.slaDeadline)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(inc.openedAt)}</td>
                      <td className="px-4 py-3">
                        {!['RESOLVED', 'CLOSED'].includes(inc.status) && (
                          <button onClick={() => setSelected(inc)} className="btn-primary text-xs">Resolver</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
          </tbody>
        </table>
      </div>

      {/* Modal resolución */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="card w-full max-w-md p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Resolver incidencia</h2>
            <p className="text-sm text-gray-500">Pedido: <strong>{selected.order?.orderNumber}</strong> · {TYPE_LABELS[selected.type]}</p>

            <div>
              <label className="mb-1 block text-sm font-medium">Resolución</label>
              <select value={resolution} onChange={e => setResolution(e.target.value as IncidentResolution)} className="input">
                <option value={IncidentResolution.REFUND_FULL}>Devolución total</option>
                <option value={IncidentResolution.REFUND_PARTIAL}>Devolución parcial</option>
                <option value={IncidentResolution.REPLACEMENT}>Reenvío del producto</option>
                <option value={IncidentResolution.GOODWILL_CREDIT}>Crédito de buena voluntad</option>
                <option value={IncidentResolution.REJECTED}>Rechazar reclamación</option>
              </select>
            </div>

            {(resolution === IncidentResolution.REFUND_FULL || resolution === IncidentResolution.REFUND_PARTIAL) && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium">Importe a devolver (€)</label>
                  <input type="number" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} className="input" placeholder="0.00" step="0.01" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">¿Quién asume el coste?</label>
                  <select value={fundedBy} onChange={e => setFundedBy(e.target.value)} className="input">
                    <option value="vendor">Productor</option>
                    <option value="marketplace">Marketplace</option>
                    <option value="split">Repartido</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setSelected(null)} className="btn-secondary">Cancelar</button>
              <button
                onClick={() => resolve.mutate({
                  id: selected.id,
                  resolution,
                  refundAmount: refundAmount ? parseFloat(refundAmount) : undefined,
                  fundedBy: refundAmount ? fundedBy : undefined,
                })}
                disabled={resolve.isPending}
                className="btn-primary"
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
