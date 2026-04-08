'use client'
import { BellIcon } from '@heroicons/react/24/outline'
export function VendorHeader() {
  return (
    <header className="flex h-14 items-center justify-end border-b border-gray-200 bg-white px-6 gap-3">
      <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
        <BellIcon className="h-5 w-5" />
      </button>
    </header>
  )
}
