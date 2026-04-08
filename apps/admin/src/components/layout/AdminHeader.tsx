'use client'

import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline'

export function AdminHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <BellIcon className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
          <UserCircleIcon className="h-6 w-6 text-gray-400" />
          <span className="font-medium">Admin</span>
        </button>
      </div>
    </header>
  )
}
