'use client'

import { useQuery } from '@tanstack/react-query'
import { vendorApi } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import { FulfillmentStatus } from '@mercadoproductor/shared'
import { ShoppingBagIcon, CubeIcon, BanknotesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const FULFILLMENT_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700' },
  PREPARING: { label: 'Preparando', color: 'bg-indigo-100 text-indigo-700' },
  READY: { label: 'Listo', color: 'bg-cyan-100 text-cyan-700' },
  SHIPPED: { label: 'Enviado', color: 'bg-purple-100 text-purple-700' },
  DELIVERED: { label: 'Entregado', color: 'bg-green-100 text-green-700' },
}

export default function VendorDashboard() {
  const { data: profile } = useQuery({
    queryKey: ['vendor-profile'],
    queryFn: () => vendorApi.get('/vendors/me').then(r => r.data.data),
  })

  const { data: settlements } = useQuery({
    queryKey: ['vendor-settlements'],
    queryFn: () => vendorApi.get('/settlements/me').then(r => r.data.data),
  })

  const lastSettlement = (settlements as any[])?.[0]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hola, {profile?.displayName ?? '—'} 👋
        </h1>
        <p className="text-sm text-gray-500">Aquí tienes el resumen de tu actividad</p>
      </div>

      {/* Status alert */}
      {profile?.status && profile.status !== 'ACTIVE' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Tu cuenta está en estado <strong>{profile.status}</strong>. Contacta con el equipo si tienes dudas.
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BanknotesIcon}
          label="Próxima liquidación"
          value={lastSettlement ? formatPrice(Number(lastSettlement.netPayable)) : '—'}
          sub={lastSettlement ? `Estado: ${lastSettlement.status}` : 'Sin liquidaciones'}
          color="text-green-600 bg-green-50"
        />
        <StatCard
          icon={ShoppingBagIcon}
          label="Pedidos pendientes"
          value="—"
          sub="Ver pedidos activos"
          color="text-blue-600 bg-blue-50"
        />
        <StatCard
          icon={CubeIcon}
          label="Productos activos"
          value={profile?._count?.products ?? '—'}
          sub="En tu catálogo"
          color="text-indigo-600 bg-indigo-50"
        />
        <StatCard
          icon={ExclamationTriangleIcon}
          label="Valoración media"
          value={profile?.avgRating ? `${Number(profile.avgRating).toFixed(1)} ★` : '—'}
          sub={`${profile?.totalReviews ?? 0} valoraciones`}
          color="text-amber-600 bg-amber-50"
        />
      </div>

      {/* Recent settlements */}
      {settlements && (settlements as any[]).length > 0 && (
        <div className="card">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900 text-sm">Últimas liquidaciones</h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {(settlements as any[]).slice(0, 5).map((s: any) => (
              <li key={s.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(s.periodFrom)} — {formatDate(s.periodTo)}
                  </p>
                  <p className="text-xs text-gray-400">Ventas brutas: {formatPrice(Number(s.grossSales))}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatPrice(Number(s.netPayable))}</p>
                  <span className={`badge ${s.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub: string; color: string
}) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
    </div>
  )
}
