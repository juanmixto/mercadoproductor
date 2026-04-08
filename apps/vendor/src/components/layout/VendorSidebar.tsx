'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon, ShoppingBagIcon, CubeIcon,
  BanknotesIcon, UserIcon, ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { vendorApi } from '@/lib/api'

const nav = [
  { href: '/dashboard', icon: HomeIcon, label: 'Inicio' },
  { href: '/pedidos', icon: ShoppingBagIcon, label: 'Mis pedidos', alertKey: 'orders' },
  { href: '/catalogo', icon: CubeIcon, label: 'Mi catálogo' },
  { href: '/liquidaciones', icon: BanknotesIcon, label: 'Liquidaciones' },
  { href: '/perfil', icon: UserIcon, label: 'Mi perfil' },
]

export function VendorSidebar() {
  const pathname = usePathname()

  // Count pending fulfillments for badge
  const { data: pendingCount } = useQuery({
    queryKey: ['vendor-pending-count'],
    queryFn: () => vendorApi.get('/orders/pending-count').then(r => r.data.data?.count ?? 0).catch(() => 0),
    refetchInterval: 60_000,
  })

  return (
    <aside className="flex w-56 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-gray-100 px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-sm font-bold text-white">
          MP
        </span>
        <div>
          <p className="text-xs font-bold text-gray-900 leading-none">Portal Productor</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <p className="text-[10px] text-green-600 font-medium">Activo</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ href, icon: Icon, label, alertKey }) => {
          const isActive = pathname.startsWith(href)
          const hasBadge = alertKey === 'orders' && pendingCount > 0

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span className="flex-1">{label}</span>
              {hasBadge && (
                <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 p-3 space-y-0.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition"
        >
          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
          Ver mi tienda
        </Link>
      </div>
    </aside>
  )
}
