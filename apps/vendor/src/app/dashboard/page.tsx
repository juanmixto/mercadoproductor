'use client'

import { useQuery } from '@tanstack/react-query'
import { vendorApi } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'
import {
  ShoppingBagIcon, CubeIcon, BanknotesIcon, StarIcon,
  CheckCircleIcon, ArrowRightIcon, ExclamationCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

// Setup checklist for new vendors
const SETUP_STEPS = [
  { key: 'profile', label: 'Completa tu perfil', href: '/perfil', desc: 'Foto, descripción y ubicación' },
  { key: 'products', label: 'Añade tu primer producto', href: '/catalogo/nuevo', desc: 'Con fotos y descripción' },
  { key: 'bank', label: 'Añade tu cuenta bancaria', href: '/perfil', desc: 'Para recibir tus pagos' },
]

const FULFILLMENT_LABELS: Record<string, { label: string; color: string; urgent?: boolean }> = {
  PENDING:   { label: 'Pendiente', color: 'bg-amber-100 text-amber-700', urgent: true },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700' },
  PREPARING: { label: 'Preparando', color: 'bg-indigo-100 text-indigo-700' },
  READY:     { label: 'Listo para enviar', color: 'bg-cyan-100 text-cyan-700', urgent: true },
  SHIPPED:   { label: 'Enviado', color: 'bg-purple-100 text-purple-700' },
  DELIVERED: { label: 'Entregado', color: 'bg-green-100 text-green-700' },
}

export default function VendorDashboard() {
  const { data: profile } = useQuery({
    queryKey: ['vendor-profile'],
    queryFn: () => vendorApi.get('/vendors/me').then(r => r.data.data),
  })

  const { data: settlements } = useQuery({
    queryKey: ['vendor-settlements'],
    queryFn: () => vendorApi.get('/settlements/me').then(r => r.data.data ?? []),
  })

  const { data: recentOrders } = useQuery({
    queryKey: ['vendor-recent-orders'],
    queryFn: () => vendorApi.get('/orders?limit=5').then(r => r.data.data ?? []),
  })

  const lastSettlement = (settlements as any[])?.[0]
  const isNewVendor = !profile?.activatedAt || (profile?._count?.products ?? 0) === 0

  // Urgent fulfillments (PENDING or READY)
  const urgentFulfillments = (recentOrders as any[] ?? [])
    .flatMap((o: any) => (o.fulfillments ?? []).map((f: any) => ({ ...f, order: o })))
    .filter((f: any) => f.status === 'PENDING' || f.status === 'READY')

  return (
    <div className="space-y-6">

      {/* Welcome header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hola, {profile?.displayName ?? '—'} 👋
          </h1>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link href="/catalogo/nuevo" className="btn-primary gap-2 shrink-0">
          <CubeIcon className="h-4 w-4" />
          Nuevo producto
        </Link>
      </div>

      {/* Status alert */}
      {profile?.status && profile.status !== 'ACTIVE' && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <ExclamationCircleIcon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">
              Tu cuenta está en estado <strong>{profile.status}</strong>
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Hasta que no esté activa no podrás recibir pedidos. Contacta al equipo si tienes dudas.
            </p>
          </div>
        </div>
      )}

      {/* Setup checklist — only for new vendors */}
      {isNewVendor && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-lg">🚀</span>
            <div>
              <p className="font-semibold text-gray-900">Configura tu tienda</p>
              <p className="text-xs text-gray-500">Completa estos pasos para empezar a recibir pedidos</p>
            </div>
          </div>
          <div className="space-y-2">
            {SETUP_STEPS.map((step, i) => {
              const done = (
                (step.key === 'profile' && !!profile?.description) ||
                (step.key === 'products' && (profile?._count?.products ?? 0) > 0) ||
                (step.key === 'bank' && !!profile?.iban)
              )
              return (
                <Link
                  key={step.key}
                  href={step.href}
                  className={`flex items-center gap-3 rounded-lg p-3 transition ${done ? 'opacity-60' : 'bg-white hover:shadow-sm'}`}
                >
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    done ? 'bg-green-500 text-white' : 'bg-white border-2 border-gray-300 text-gray-400'
                  }`}>
                    {done ? '✓' : i + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-400">{step.desc}</p>
                  </div>
                  {!done && <ArrowRightIcon className="h-4 w-4 text-gray-400" />}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Urgent actions */}
      {urgentFulfillments.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-red-600" />
              <p className="font-semibold text-red-900">
                {urgentFulfillments.length} pedido{urgentFulfillments.length !== 1 ? 's' : ''} requieren tu atención
              </p>
            </div>
            <Link href="/pedidos" className="text-xs font-medium text-red-600 hover:text-red-700">
              Ver todos →
            </Link>
          </div>
          <div className="space-y-2">
            {urgentFulfillments.slice(0, 3).map((f: any) => {
              const sc = FULFILLMENT_LABELS[f.status]
              return (
                <Link
                  key={f.id}
                  href="/pedidos"
                  className="flex items-center justify-between rounded-lg bg-white p-3 hover:shadow-sm transition"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{f.order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{formatDate(f.order.placedAt)}</p>
                  </div>
                  <span className={`badge ${sc.color}`}>{sc.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          icon={BanknotesIcon}
          label="Próxima liquidación"
          value={lastSettlement ? formatPrice(Number(lastSettlement.netPayable)) : '—'}
          sub={lastSettlement ? `Estado: ${lastSettlement.status}` : 'Sin liquidaciones aún'}
          color="text-green-600 bg-green-50"
        />
        <StatCard
          icon={ShoppingBagIcon}
          label="Pedidos activos"
          value={urgentFulfillments.length > 0 ? urgentFulfillments.length : '—'}
          sub={urgentFulfillments.length > 0 ? 'Necesitan acción' : 'Sin pedidos pendientes'}
          color="text-blue-600 bg-blue-50"
          urgent={urgentFulfillments.length > 0}
        />
        <StatCard
          icon={CubeIcon}
          label="Productos activos"
          value={profile?._count?.products ?? '—'}
          sub="En tu catálogo"
          color="text-indigo-600 bg-indigo-50"
        />
        <StatCard
          icon={StarIcon}
          label="Valoración media"
          value={profile?.avgRating ? `${Number(profile.avgRating).toFixed(1)}★` : '—'}
          sub={`${profile?.totalReviews ?? 0} valoraciones`}
          color="text-amber-600 bg-amber-50"
        />
      </div>

      {/* Recent settlements */}
      {(settlements as any[])?.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-gray-900">Últimas liquidaciones</h2>
            <Link href="/liquidaciones" className="text-xs text-brand-600 hover:text-brand-700">
              Ver todas →
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {(settlements as any[]).slice(0, 4).map((s: any) => (
              <li key={s.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(s.periodFrom)} — {formatDate(s.periodTo)}
                  </p>
                  <p className="text-xs text-gray-400">Ventas: {formatPrice(Number(s.grossSales))}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatPrice(Number(s.netPayable))}</p>
                  <span className={`badge text-[10px] ${s.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.status === 'PAID' ? 'Pagado' : s.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick tips for new vendors */}
      {isNewVendor && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: '📸', title: 'Buenas fotos = más ventas', desc: 'Usa luz natural. 3-5 fotos por producto aumenta la conversión un 40%.' },
            { icon: '✏️', title: 'Describe el origen', desc: 'Los clientes valoran saber dónde y cómo se produce. Cuéntalo.' },
            { icon: '📦', title: 'Define bien el stock', desc: 'Un stock ajustado evita cancelaciones y protege tu valoración.' },
          ].map(tip => (
            <div key={tip.title} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <span className="text-2xl">{tip.icon}</span>
              <p className="mt-2 text-sm font-semibold text-gray-900">{tip.title}</p>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon, label, value, sub, color, urgent,
}: {
  icon: React.ElementType; label: string; value: string | number; sub: string; color: string; urgent?: boolean
}) {
  return (
    <div className={`card p-4 flex items-start gap-3 ${urgent ? 'border-red-200 bg-red-50' : ''}`}>
      <div className={`rounded-xl p-2.5 ${urgent ? 'text-red-600 bg-red-100' : color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 truncate">{label}</p>
        <p className="mt-0.5 text-xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 truncate">{sub}</p>
      </div>
    </div>
  )
}
