'use client'

import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import {
  ShoppingBagIcon, UsersIcon, CubeIcon,
  ExclamationTriangleIcon, BanknotesIcon, ClockIcon,
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.get('/admin/dashboard').then(r => r.data.data),
    refetchInterval: 60_000,
  })

  if (isLoading) return <DashboardSkeleton />

  const stats = [
    { label: 'Pedidos hoy', value: data.revenue.today ? formatPrice(data.revenue.today) : '—', sub: `${data.orders.pending} en proceso`, icon: BanknotesIcon, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Pedidos activos', value: data.orders.pending, sub: `de ${data.orders.total} totales`, icon: ShoppingBagIcon, color: 'text-blue-600 bg-blue-50' },
    { label: 'Productores activos', value: data.vendors.active, sub: `${data.vendors.pending} pendientes de aprobación`, icon: UsersIcon, color: 'text-green-600 bg-green-50' },
    { label: 'Productos en revisión', value: data.products.pendingReview, sub: 'requieren validación', icon: CubeIcon, color: 'text-amber-600 bg-amber-50' },
    { label: 'Incidencias abiertas', value: data.incidents.open, sub: 'requieren atención', icon: ExclamationTriangleIcon, color: 'text-red-600 bg-red-50' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Vista general del marketplace</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(stat => (
          <div key={stat.label} className="stat-card flex items-start gap-4">
            <div className={`rounded-xl p-3 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
              <p className="mt-0.5 text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PendingVendors />
        <OverdueIncidents />
      </div>
    </div>
  )
}

function PendingVendors() {
  const { data } = useQuery({
    queryKey: ['admin-pending-vendors'],
    queryFn: () => adminApi.get('/vendors/admin/list?status=APPLYING').then(r => r.data.data),
  })

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 text-sm">Productores pendientes</h2>
        <a href="/productores?status=APPLYING" className="text-xs text-indigo-600 hover:underline">Ver todos</a>
      </div>
      {!data || data.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-400">Sin solicitudes pendientes</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {(data as any[]).slice(0, 4).map((v: any) => (
            <li key={v.id} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm font-medium text-gray-900">{v.displayName}</p>
                <p className="text-xs text-gray-400">{v.user.email}</p>
              </div>
              <a href={`/productores/${v.id}`} className="btn-secondary text-xs">Revisar</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function OverdueIncidents() {
  const { data } = useQuery({
    queryKey: ['admin-overdue-incidents'],
    queryFn: () => adminApi.get('/admin/incidents/overdue').then(r => r.data.data),
  })

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 text-sm">Incidencias fuera de SLA</h2>
        <a href="/incidencias" className="text-xs text-indigo-600 hover:underline">Ver todas</a>
      </div>
      {!data || data.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-400">Sin incidencias fuera de SLA</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {(data as any[]).slice(0, 4).map((inc: any) => (
            <li key={inc.id} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm font-medium text-gray-900">{inc.order.orderNumber}</p>
                <p className="text-xs text-gray-400">{inc.customer.firstName} — {inc.type}</p>
              </div>
              <span className="badge bg-red-100 text-red-700">SLA</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-40 rounded bg-gray-200" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-24 rounded-xl bg-gray-200" />)}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map(i => <div key={i} className="h-48 rounded-xl bg-gray-200" />)}
      </div>
    </div>
  )
}
