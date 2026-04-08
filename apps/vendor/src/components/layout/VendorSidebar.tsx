'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon, ShoppingBagIcon, CubeIcon,
  BanknotesIcon, UserIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', icon: HomeIcon, label: 'Inicio' },
  { href: '/pedidos', icon: ShoppingBagIcon, label: 'Mis pedidos' },
  { href: '/catalogo', icon: CubeIcon, label: 'Mi catálogo' },
  { href: '/liquidaciones', icon: BanknotesIcon, label: 'Liquidaciones' },
  { href: '/perfil', icon: UserIcon, label: 'Mi perfil' },
]

export function VendorSidebar() {
  const pathname = usePathname()
  return (
    <aside className="flex w-56 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center gap-2 border-b border-gray-100 px-4">
        <span className="text-xl">🌿</span>
        <div>
          <p className="text-xs font-bold text-gray-900 leading-none">Mi Tienda</p>
          <p className="text-[10px] text-green-600 font-medium">Portal Productor</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
              pathname.startsWith(href)
                ? 'bg-green-50 text-green-700'
                : 'text-gray-600 hover:bg-gray-100',
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-gray-100 p-3">
        <Link href="/" target="_blank" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-400 hover:text-gray-600">
          Ver tienda →
        </Link>
      </div>
    </aside>
  )
}
