'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { adminApi } from '@/lib/api'
import { VendorStatus } from '@mercadoproductor/shared'
import { formatDate } from '@/lib/utils'
import { XMarkIcon } from '@heroicons/react/24/outline'

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  APPLYING:       { label: 'Solicitando',      color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500' },
  PENDING_DOCS:   { label: 'Docs pendientes',  color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500' },
  ACTIVE:         { label: 'Activo',           color: 'bg-green-100 text-green-700',   dot: 'bg-green-500' },
  SUSPENDED_TEMP: { label: 'Suspendido',       color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  REJECTED:       { label: 'Rechazado',        color: 'bg-red-100 text-red-700',       dot: 'bg-red-400' },
  DEACTIVATED:    { label: 'Baja',             color: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400' },
}

const FILTER_TABS = [
  { value: '', label: 'Todos' },
  { value: 'APPLYING', label: 'Solicitudes' },
  { value: 'ACTIVE', label: 'Activos' },
  { value: 'SUSPENDED_TEMP', label: 'Suspendidos' },
  { value: 'REJECTED', label: 'Rechazados' },
]

export default function ProductoresAdminPage() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [suspendModal, setSuspendModal] = useState<{ id: string; name: string } | null>(null)
  const [suspendReason, setSuspendReason] = useState('')

  const { data: vendors, isLoading } = useQuery({
    queryKey: ['admin-vendors', statusFilter],
    queryFn: () => adminApi.get(`/vendors/admin/list${statusFilter ? `?status=${statusFilter}` : ''}`).then(r => r.data.data ?? []),
  })

  const changeStatus = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      adminApi.patch(`/vendors/${id}/status`, { status, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-vendors'] })
      qc.invalidateQueries({ queryKey: ['admin-sidebar-alerts'] })
      setRejectModal(null)
      setSuspendModal(null)
      setRejectReason('')
      setSuspendReason('')
    },
  })

  const all = (vendors as any[]) ?? []
  const filtered = search
    ? all.filter((v: any) =>
        v.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        v.user?.email?.toLowerCase().includes(search.toLowerCase())
      )
    : all

  const applyingCount = all.filter((v: any) => v.status === 'APPLYING').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productores</h1>
          <p className="text-sm text-gray-500">Gestión y verificación de productores</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input max-w-xs"
        />
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
          {FILTER_TABS.map(tab => {
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  statusFilter === tab.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.value === 'APPLYING' && applyingCount > 0 && (
                  <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-white">{applyingCount}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              {['Productor', 'Contacto', 'Zona', 'Estado', 'Registro', 'Acciones'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-gray-100 animate-pulse" /></td>
                  ))}</tr>
                ))
              : filtered.length === 0
              ? <tr><td colSpan={6} className="py-12 text-center text-sm text-gray-400">Sin resultados</td></tr>
              : filtered.map((v: any) => {
                  const sc = STATUS_CONFIG[v.status] ?? STATUS_CONFIG.APPLYING
                  return (
                    <tr key={v.id} className={`hover:bg-gray-50 transition ${v.status === 'APPLYING' ? 'bg-amber-50/30' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${sc.dot}`} />
                          <div>
                            <p className="font-medium text-gray-900">{v.displayName}</p>
                            <p className="text-xs text-gray-400">@{v.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{v.user?.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{v.location ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${sc.color}`}>{sc.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{formatDate(v.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {v.status === VendorStatus.APPLYING && (
                            <>
                              <button
                                onClick={() => changeStatus.mutate({ id: v.id, status: VendorStatus.ACTIVE })}
                                disabled={changeStatus.isPending}
                                className="btn-primary text-xs px-3 py-1.5"
                              >
                                Activar
                              </button>
                              <button
                                onClick={() => setRejectModal({ id: v.id, name: v.displayName })}
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition"
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                          {v.status === VendorStatus.ACTIVE && (
                            <button
                              onClick={() => setSuspendModal({ id: v.id, name: v.displayName })}
                              className="btn-secondary text-xs px-3 py-1.5"
                            >
                              Suspender
                            </button>
                          )}
                          {(v.status === VendorStatus.SUSPENDED_TEMP || v.status === VendorStatus.REJECTED) && (
                            <button
                              onClick={() => changeStatus.mutate({ id: v.id, status: VendorStatus.ACTIVE })}
                              disabled={changeStatus.isPending}
                              className="btn-primary text-xs px-3 py-1.5"
                            >
                              Reactivar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="card w-full max-w-sm p-6 space-y-4 mx-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Rechazar productor</h2>
              <button onClick={() => setRejectModal(null)} className="rounded-lg p-1 hover:bg-gray-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500"><strong>{rejectModal.name}</strong> recibirá un email con el motivo del rechazo.</p>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Motivo *</label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                className="input resize-none"
                placeholder="Describe el motivo del rechazo..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRejectModal(null)} className="btn-secondary">Cancelar</button>
              <button
                onClick={() => changeStatus.mutate({ id: rejectModal.id, status: VendorStatus.REJECTED, reason: rejectReason })}
                disabled={!rejectReason.trim() || changeStatus.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition"
              >
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend modal */}
      {suspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="card w-full max-w-sm p-6 space-y-4 mx-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Suspender productor</h2>
              <button onClick={() => setSuspendModal(null)} className="rounded-lg p-1 hover:bg-gray-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500">Se suspenderá temporalmente a <strong>{suspendModal.name}</strong>.</p>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Motivo *</label>
              <textarea
                value={suspendReason}
                onChange={e => setSuspendReason(e.target.value)}
                rows={3}
                className="input resize-none"
                placeholder="Motivo de la suspensión temporal..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setSuspendModal(null)} className="btn-secondary">Cancelar</button>
              <button
                onClick={() => changeStatus.mutate({ id: suspendModal.id, status: VendorStatus.SUSPENDED_TEMP, reason: suspendReason })}
                disabled={!suspendReason.trim() || changeStatus.isPending}
                className="btn-primary disabled:opacity-50"
              >
                Confirmar suspensión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
