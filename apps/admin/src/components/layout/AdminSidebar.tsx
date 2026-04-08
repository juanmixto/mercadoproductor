'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon, ShoppingBagIcon, UsersIcon, CubeIcon,
  BanknotesIcon, ExclamationTriangleIcon, ChartBarIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'

const navItems = [
  { href: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
  { href: '/pedidos', icon: ShoppingBagIcon, label: 'Pedidos', alertKey: 'orders' },
  { href: '/productores', icon: UsersIcon, label: 'Productores', alertKey: 'vendors' },
  { href: '/productos', icon: CubeIcon, label: 'Productos', alertKey: 'products' },
  { href: '/liquidaciones', icon: BanknotesIcon, label: 'Liquidaciones' },
  { href: '/incidencias', icon: ExclamationTriangleIcon, label: 'Incidencias', alertKey: 'incidents' },
  { href: '/informes', icon: ChartBarIcon, label: 'Informes' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const { data: alerts } = useQuery({
    queryKey: ['admin-sidebar-alerts'],
    queryFn: () => adminApi.get('/admin/dashboard').then(r => r.data.data).catch(() => null),
    refetchInterval: 60_000,
  })

  function getBadge(alertKey?: string): number {
    if (!alerts || !alertKey) return 0
    switch (alertKey) {
      case 'incidents': return alerts.incidents?.open ?? 0
      case 'vendors': return alerts.vendors?.pending ?? 0
      case 'products': return alerts.products?.pendingReview ?? 0
      case 'orders': return alerts.orders?.pending ?? 0
      default: return 0
    }
  }

  return (
    <aside className="flex w-56 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-gray-100 px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
          MP
        </span>
        <div>
          <p className="text-xs font-bold text-gray-900 leading-none">Panel Admin</p>
          <p className="text-[10px] text-indigo-500 font-medium mt-0.5">Mercado Productor</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label, alertKey }) => {
          const isActive = pathname.startsWith(href)
          const count = getBadge(alertKey)
          const isUrgent = alertKey === 'incidents' && count > 0

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span className="flex-1">{label}</span>
              {count > 0 && (
                <span className={`flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${
                  isUrgent ? 'bg-red-500' : 'bg-amber-500'
                }`}>
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 p-3">
        <Link href="/" target="_blank" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition">
          Ver tienda →
        </Link>
      </div>
    </aside>
  )
}
