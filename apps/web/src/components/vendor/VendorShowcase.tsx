import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/api'

export async function VendorShowcase() {
  const { data: vendors } = await api.vendors.list()

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {(vendors as any[]).slice(0, 3).map((vendor) => (
        <Link
          key={vendor.id}
          href={`/productores/${vendor.slug}`}
          className="card group overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="relative h-40 bg-gradient-to-br from-brand-100 to-earth-100 flex items-center justify-center">
            {vendor.logoUrl ? (
              <Image src={vendor.logoUrl} alt={vendor.displayName} fill className="object-cover" />
            ) : (
              <span className="text-6xl">🌿</span>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 group-hover:text-brand-700">{vendor.displayName}</h3>
            {vendor.location && <p className="text-sm text-gray-500 mt-0.5">📍 {vendor.location}</p>}
            {vendor.description && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{vendor.description}</p>
            )}
            <div className="mt-3 flex items-center gap-2">
              {vendor.avgRating > 0 && (
                <span className="text-xs text-amber-600 font-medium">
                  ★ {Number(vendor.avgRating).toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
