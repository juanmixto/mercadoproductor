'use client'

import { BellIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import { vendorApi } from '@/lib/api'

export function VendorHeader() {
  const { data: profile } = useQuery({
    queryKey: ['vendor-profile'],
    queryFn: () => vendorApi.get('/vendors/me').then(r => r.data.data),
  })

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Breadcrumb / context */}
      <div className="flex items-center gap-2">
        {profile?.displayName && (
          <p className="text-sm font-medium text-gray-700">{profile.displayName}</p>
        )}
        {profile?.status && profile.status !== 'ACTIVE' && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            Cuenta {profile.status.toLowerCase()}
          </span>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <button
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          title="Ayuda"
        >
          <QuestionMarkCircleIcon className="h-5 w-5" />
        </button>
        <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
          <BellIcon className="h-5 w-5" />
        </button>
        {profile?.displayName && (
          <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
            {profile.displayName[0].toUpperCase()}
          </div>
        )}
      </div>
    </header>
  )
}
