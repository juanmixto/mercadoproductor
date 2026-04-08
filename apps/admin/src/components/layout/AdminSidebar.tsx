'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon, ShoppingBagIcon, UsersIcon, CubeIcon,
  BanknotesIcon, ExclamationTriangleIcon, ChartBarIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
  { href: '/pedidos', icon: ShoppingBagIcon, label: 'Pedidos' },
  { href: '/productores', icon: UsersIcon, label: 'Productores' },
  { href: '/productos', icon: CubeIcon, label: 'Productos' },
  { href: '/liquidaciones', icon: BanknotesIcon, label: 'Liquidaciones' },
  { href: '/incidencias', icon: ExclamationTriangleIcon, label: 'Incidencias' },
  { href: '/informes', icon: ChartBarIcon, label: 'Informes' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-56 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-gray-100 px-4">
        <span className="text-xl">🌿</span>
        <div>
          <p className="text-xs font-bold text-gray-900 leading-none">Mercado Productor</p>
          <p className="text-[10px] text-indigo-600 font-medium">Panel Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
              pathname.startsWith(href)
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 p-3">
        <Link href="/" target="_blank" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-400 hover:text-gray-600">
          Ver tienda →
        </Link>
      </div>
    </aside>
  )
}
