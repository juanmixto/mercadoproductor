'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { adminApi } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT:            { label: 'Borrador',         color: 'bg-gray-100 text-gray-600' },
  PENDING_APPROVAL: { label: 'Pend. aprobación', color: 'bg-yellow-100 text-yellow-700' },
  APPROVED:         { label: 'Aprobada',         color: 'bg-blue-100 text-blue-700' },
  PAID:             { label: 'Pagada',           color: 'bg-green-100 text-green-700' },
  DISPUTED:         { label: 'Disputada',        color: 'bg-red-100 text-red-700' },
}

export default function LiquidacionesPage() {
  const qc = useQueryClient()
  const [generateModal, setGenerateModal] = useState(false)
  const [vendorId, setVendorId] = useState('')
  const [periodFrom, setPeriodFrom] = useState('')
  const [periodTo, setPeriodTo] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'settlements'],
    queryFn: () => adminApi.get('/settlements/admin/list').then(r => r.data.data).catch(() => []),
  })

  const generate = useMutation({
    mutationFn: () => adminApi.post('/settlements/generate', { vendorId, periodFrom, periodTo }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'settlements'] }); setGenerateModal(false) },
  })

  const approve = useMutation({
    mutationFn: (id: string) => adminApi.patch(`/settlements/${id}/approve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'settlements'] }),
  })

  const settlements = Array.isArray(data) ? data : (data?.data ?? [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Liquidaciones</h1>
        <button onClick={() => setGenerateModal(true)} className="btn-primary">
          + Generar liquidación
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              {['Productor', 'Período', 'Ventas brutas', 'Comisión', 'Neto a pagar', 'Estado', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-gray-100 animate-pulse" /></td>)}</tr>
                ))
              : settlements.length === 0
              ? <tr><td colSpan={7} className="py-12 text-center text-gray-400">Sin liquidaciones generadas</td></tr>
              : settlements.map((s: any) => {
                  const st = STATUS_CONFIG[s.status] ?? { label: s.status, color: 'bg-gray-100' }
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">{s.vendor?.displayName}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {formatDate(s.periodFrom)} → {formatDate(s.periodTo)}
                      </td>
                      <td className="px-4 py-3">{formatPrice(s.grossSales)}</td>
                      <td className="px-4 py-3 text-red-600">-{formatPrice(s.commissionTotal)}</td>
                      <td className="px-4 py-3 font-bold text-green-700">{formatPrice(s.netPayable)}</td>
                      <td className="px-4 py-3"><span className={`badge ${st.color}`}>{st.label}</span></td>
                      <td className="px-4 py-3">
                        {s.status === 'PENDING_APPROVAL' && (
                          <button onClick={() => approve.mutate(s.id)} className="btn-primary text-xs">Aprobar</button>
                        )}
                        {s.status === 'DRAFT' && (
                          <button className="btn-secondary text-xs">Revisar</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
          </tbody>
        </table>
      </div>

      {/* Modal generar */}
      {generateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="card w-full max-w-md p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Generar liquidación</h2>
            <div>
              <label className="mb-1 block text-sm font-medium">ID del productor</label>
              <input value={vendorId} onChange={e => setVendorId(e.target.value)} className="input" placeholder="cuid del vendor" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Desde</label>
                <input type="datetime-local" value={periodFrom} onChange={e => setPeriodFrom(e.target.value)} className="input" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Hasta</label>
                <input type="datetime-local" value={periodTo} onChange={e => setPeriodTo(e.target.value)} className="input" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setGenerateModal(false)} className="btn-secondary">Cancelar</button>
              <button onClick={() => generate.mutate()} disabled={generate.isPending} className="btn-primary">
                {generate.isPending ? 'Generando...' : 'Generar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
