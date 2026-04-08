'use client'

import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'
import {
  ShoppingBagIcon, UsersIcon, CubeIcon, ExclamationTriangleIcon,
  BanknotesIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.get('/admin/dashboard').then(r => r.data.data),
    refetchInterval: 60_000,
  })

  if (isLoading) return <DashboardSkeleton />

  const hasAlerts = data.incidents?.open > 0 || data.vendors?.pending > 0 || data.products?.pendingReview > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Priority alerts bar */}
      {hasAlerts && (
        <div className="flex flex-wrap gap-3">
          {data.incidents?.open > 0 && (
            <Link href="/incidencias" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-800 hover:bg-red-100 transition">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
              <span><strong>{data.incidents.open}</strong> incidencia{data.incidents.open !== 1 ? 's' : ''} abiertas</span>
              <ChevronRightIcon className="h-3.5 w-3.5 text-red-400" />
            </Link>
          )}
          {data.vendors?.pending > 0 && (
            <Link href="/productores?status=APPLYING" className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-100 transition">
              <UsersIcon className="h-4 w-4 text-amber-600" />
              <span><strong>{data.vendors.pending}</strong> productor{data.vendors.pending !== 1 ? 'es' : ''} pendiente{data.vendors.pending !== 1 ? 's' : ''}</span>
              <ChevronRightIcon className="h-3.5 w-3.5 text-amber-400" />
            </Link>
          )}
          {data.products?.pendingReview > 0 && (
            <Link href="/productos" className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-100 transition">
              <CubeIcon className="h-4 w-4 text-amber-600" />
              <span><strong>{data.products.pendingReview}</strong> producto{data.products.pendingReview !== 1 ? 's' : ''} por revisar</span>
              <ChevronRightIcon className="h-3.5 w-3.5 text-amber-400" />
            </Link>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          icon={BanknotesIcon}
          label="Facturación hoy"
          value={data.revenue?.today ? formatPrice(data.revenue.today) : '—'}
          sub={`Este mes: ${data.revenue?.month ? formatPrice(data.revenue.month) : '—'}`}
          color="text-indigo-600 bg-indigo-50"
        />
        <StatCard
          icon={ShoppingBagIcon}
          label="Pedidos activos"
          value={data.orders?.pending ?? '—'}
          sub={`${data.orders?.total ?? 0} pedidos totales`}
          color="text-blue-600 bg-blue-50"
          alert={data.orders?.pending > 20}
        />
        <StatCard
          icon={UsersIcon}
          label="Productores activos"
          value={data.vendors?.active ?? '—'}
          sub={`${data.vendors?.pending ?? 0} pendientes de aprobación`}
          color="text-green-600 bg-green-50"
          alert={data.vendors?.pending > 0}
        />
        <StatCard
          icon={ExclamationTriangleIcon}
          label="Incidencias abiertas"
          value={data.incidents?.open ?? '—'}
          sub="Requieren atención"
          color="text-red-600 bg-red-50"
          alert={data.incidents?.open > 0}
        />
      </div>

      {/* Two-column queue */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PendingVendors />
        <OverdueIncidents />
      </div>

      {/* Second row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PendingProducts />
        <RecentOrders />
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon, label, value, sub, color, alert,
}: {
  icon: React.ElementType; label: string; value: any; sub: string; color: string; alert?: boolean
}) {
  return (
    <div className={`card p-4 flex items-start gap-3 ${alert ? 'border-red-200' : ''}`}>
      <div className={`rounded-xl p-2.5 ${alert ? 'bg-red-100 text-red-600' : color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 truncate">{label}</p>
        <p className={`mt-0.5 text-2xl font-bold ${alert ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
        <p className="text-xs text-gray-400 truncate">{sub}</p>
      </div>
    </div>
  )
}

function PendingVendors() {
  const { data } = useQuery({
    queryKey: ['admin-pending-vendors'],
    queryFn: () => adminApi.get('/vendors/admin/list?status=APPLYING').then(r => r.data.data ?? []),
  })

  const vendors = (data as any[]) ?? []

  return (
    <div className="card">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900">Productores pendientes</h2>
          {vendors.length > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">{vendors.length}</span>
          )}
        </div>
        <Link href="/productores" className="text-xs text-indigo-600 hover:text-indigo-700">Ver todos →</Link>
      </div>
      {vendors.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">
          ✓ Sin solicitudes pendientes
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {vendors.slice(0, 4).map((v: any) => (
            <li key={v.id} className="flex items-center justify-between px-5 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{v.displayName}</p>
                <p className="text-xs text-gray-400 truncate">{v.user?.email} · {v.location ?? '—'}</p>
              </div>
              <Link href={`/productores`} className="btn-secondary text-xs shrink-0 ml-3">
                Revisar
              </Link>
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
    queryFn: () => adminApi.get('/admin/incidents/overdue').then(r => r.data.data ?? []).catch(() => []),
  })

  const incidents = (data as any[]) ?? []

  return (
    <div className="card">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900">Incidencias fuera de SLA</h2>
          {incidents.length > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">{incidents.length}</span>
          )}
        </div>
        <Link href="/incidencias" className="text-xs text-indigo-600 hover:text-indigo-700">Ver todas →</Link>
      </div>
      {incidents.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">
          ✓ Sin incidencias fuera de SLA
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {incidents.slice(0, 4).map((inc: any) => (
            <li key={inc.id} className="flex items-center justify-between px-5 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{inc.order?.orderNumber ?? '—'}</p>
                <p className="text-xs text-gray-400 truncate">{inc.customer?.firstName ?? 'Cliente'} · {inc.type?.replace(/_/g, ' ').toLowerCase()}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="badge bg-red-100 text-red-700 text-[10px]">SLA vencido</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PendingProducts() {
  const { data } = useQuery({
    queryKey: ['admin-products-pending'],
    queryFn: () => adminApi.get('/admin/products/pending').then(r => r.data.data ?? []),
  })

  const products = (data as any[]) ?? []

  return (
    <div className="card">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900">Productos por revisar</h2>
          {products.length > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">{products.length}</span>
          )}
        </div>
        <Link href="/productos" className="text-xs text-indigo-600 hover:text-indigo-700">Ver cola →</Link>
      </div>
      {products.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">✓ Cola de revisión vacía</div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {products.slice(0, 4).map((p: any) => (
            <li key={p.id} className="flex items-center justify-between px-5 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                <p className="text-xs text-gray-400">{p.vendor?.displayName} · {Number(p.basePrice).toFixed(2)} € / {p.unit}</p>
              </div>
              <Link href="/productos" className="btn-secondary text-xs shrink-0 ml-3">Revisar</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function RecentOrders() {
  const { data } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: () => adminApi.get('/orders?limit=5&sort=createdAt_desc').then(r => {
      const d = r.data.data
      return Array.isArray(d) ? d : (d?.data ?? [])
    }),
  })

  const orders = (data as any[]) ?? []

  const STATUS_COLORS: Record<string, string> = {
    PLACED: 'bg-gray-100 text-gray-700',
    PAYMENT_CONFIRMED: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-indigo-100 text-indigo-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
        <h2 className="text-sm font-semibold text-gray-900">Pedidos recientes</h2>
        <Link href="/pedidos" className="text-xs text-indigo-600 hover:text-indigo-700">Ver todos →</Link>
      </div>
      {orders.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">Sin pedidos recientes</div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {orders.map((o: any) => {
            const color = STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-600'
            return (
              <li key={o.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-mono font-semibold text-indigo-600">{o.orderNumber}</p>
                  <p className="text-xs text-gray-400">{formatDate(o.placedAt ?? o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`badge ${color} text-[10px]`}>{o.status?.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-semibold text-gray-900">{formatPrice(Number(o.grandTotal ?? o.totalAmount))}</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-40 rounded-xl bg-gray-200" />
      <div className="flex gap-3">
        {[1, 2].map(i => <div key={i} className="h-10 w-48 rounded-xl bg-gray-200" />)}
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-xl bg-gray-200" />)}
      </div>
      <div className="grid grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-48 rounded-xl bg-gray-200" />)}
      </div>
    </div>
  )
}
