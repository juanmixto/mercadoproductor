'use client'

import { BellIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/pedidos': 'Pedidos',
  '/productores': 'Productores',
  '/productos': 'Productos',
  '/liquidaciones': 'Liquidaciones',
  '/incidencias': 'Incidencias',
  '/informes': 'Informes',
}

export function AdminHeader() {
  const pathname = usePathname()
  const title = Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ?? ''

  const { data: alerts } = useQuery({
    queryKey: ['admin-sidebar-alerts'],
    queryFn: () => adminApi.get('/admin/dashboard').then(r => r.data.data).catch(() => null),
    refetchInterval: 60_000,
  })

  const totalAlerts = (alerts?.incidents?.open ?? 0) + (alerts?.vendors?.pending ?? 0) + (alerts?.products?.pendingReview ?? 0)

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Page title */}
      <p className="text-sm font-semibold text-gray-700">{title}</p>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Live indicator */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          En vivo
        </div>

        <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
          <BellIcon className="h-5 w-5" />
          {totalAlerts > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {totalAlerts > 9 ? '9+' : totalAlerts}
            </span>
          )}
        </button>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
          A
        </div>
      </div>
    </header>
  )
}
