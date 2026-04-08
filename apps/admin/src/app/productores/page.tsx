'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { adminApi } from '@/lib/api'
import { VendorStatus } from '@mercadoproductor/shared'
import { formatDate } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  APPLYING: { label: 'Solicitando', color: 'bg-blue-100 text-blue-700' },
  PENDING_DOCS: { label: 'Docs pendientes', color: 'bg-amber-100 text-amber-700' },
  ACTIVE: { label: 'Activo', color: 'bg-green-100 text-green-700' },
  SUSPENDED_TEMP: { label: 'Suspendido', color: 'bg-orange-100 text-orange-700' },
  REJECTED: { label: 'Rechazado', color: 'bg-red-100 text-red-700' },
  DEACTIVATED: { label: 'Baja', color: 'bg-gray-100 text-gray-600' },
}

export default function ProductoresAdminPage() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')

  const { data: vendors } = useQuery({
    queryKey: ['admin-vendors', statusFilter],
    queryFn: () => adminApi.get(`/vendors/admin/list${statusFilter ? `?status=${statusFilter}` : ''}`).then(r => r.data.data),
  })

  const changeStatus = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      adminApi.patch(`/vendors/${id}/status`, { status, reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-vendors'] }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productores</h1>
          <p className="text-sm text-gray-500">Gestión y verificación de productores</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[{ value: '', label: 'Todos' }, ...Object.entries(STATUS_CONFIG).map(([v, c]) => ({ value: v, label: c.label }))].map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`btn text-xs ${statusFilter === f.value ? 'btn-primary' : 'btn-secondary'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
              <th className="px-5 py-3">Productor</th>
              <th className="px-5 py-3">Contacto</th>
              <th className="px-5 py-3">Zona</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3">Fecha</th>
              <th className="px-5 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(vendors as any[] ?? []).map((v: any) => {
              const sc = STATUS_CONFIG[v.status] ?? STATUS_CONFIG.APPLYING
              return (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{v.displayName}</p>
                    <p className="text-xs text-gray-400">@{v.slug}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{v.user?.email}</td>
                  <td className="px-5 py-3 text-gray-500">{v.location ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${sc.color}`}>{sc.label}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{formatDate(v.createdAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      {v.status === VendorStatus.APPLYING && (
                        <>
                          <button
                            onClick={() => changeStatus.mutate({ id: v.id, status: VendorStatus.ACTIVE })}
                            className="btn-primary text-xs"
                          >
                            Activar
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Motivo del rechazo:')
                              if (reason) changeStatus.mutate({ id: v.id, status: VendorStatus.REJECTED, reason })
                            }}
                            className="btn-danger text-xs"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                      {v.status === VendorStatus.ACTIVE && (
                        <button
                          onClick={() => {
                            const reason = prompt('Motivo de la suspensión:')
                            if (reason) changeStatus.mutate({ id: v.id, status: VendorStatus.SUSPENDED_TEMP, reason })
                          }}
                          className="btn-secondary text-xs"
                        >
                          Suspender
                        </button>
                      )}
                      {v.status === VendorStatus.SUSPENDED_TEMP && (
                        <button
                          onClick={() => changeStatus.mutate({ id: v.id, status: VendorStatus.ACTIVE })}
                          className="btn-primary text-xs"
                        >
                          Reactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(!vendors || vendors.length === 0) && (
          <p className="p-8 text-center text-sm text-gray-400">Sin resultados</p>
        )}
      </div>
    </div>
  )
}
