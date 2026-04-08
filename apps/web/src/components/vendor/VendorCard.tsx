import Link from 'next/link'
import Image from 'next/image'

interface Props {
  vendor: {
    id: string
    slug: string
    displayName: string
    description?: string
    logoUrl?: string
    location?: string
  }
}

export function VendorCard({ vendor }: Props) {
  return (
    <div className="card p-4 flex items-start gap-4">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-100">
        {vendor.logoUrl ? (
          <Image src={vendor.logoUrl} alt={vendor.displayName} fill className="object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl">🌿</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <Link href={`/productores/${vendor.slug}`} className="font-semibold text-gray-900 hover:text-brand-700">
          {vendor.displayName}
        </Link>
        {vendor.location && (
          <p className="text-xs text-gray-500 mt-0.5">📍 {vendor.location}</p>
        )}
        {vendor.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{vendor.description}</p>
        )}
      </div>
      <Link href={`/productores/${vendor.slug}`} className="btn-secondary text-xs shrink-0">
        Ver más
      </Link>
    </div>
  )
}
