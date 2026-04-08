import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { MapPinIcon } from '@heroicons/react/24/outline'

interface ProductCardProps {
  product: {
    id: string
    slug: string
    name: string
    basePrice: number
    compareAtPrice?: number | null
    images: string[]
    unit: string
    stock: number
    minOrderQuantity: number
    certifications: string[]
    originRegion?: string | null
    tags?: string[]
    vendor: { displayName: string; slug: string }
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = product.compareAtPrice && product.compareAtPrice > product.basePrice
    ? Math.round((1 - product.basePrice / product.compareAtPrice) * 100)
    : null

  const isLowStock = product.stock > 0 && product.stock <= 10
  const isOutOfStock = product.stock === 0

  return (
    <div className={`card group overflow-hidden flex flex-col transition-shadow hover:shadow-md ${isOutOfStock ? 'opacity-60' : ''}`}>
      {/* Image */}
      <Link href={`/productos/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={product.images[0] ?? '/placeholder.jpg'}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Badges overlay */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.certifications.includes('ECO-ES') && (
            <span className="inline-flex items-center rounded-full bg-brand-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
              🌱 ECO
            </span>
          )}
          {product.certifications.includes('DOP') && (
            <span className="inline-flex items-center rounded-full bg-amber-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
              DOP
            </span>
          )}
          {discount && (
            <span className="inline-flex items-center rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
              -{discount}%
            </span>
          )}
        </div>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
              Sin stock
            </span>
          </div>
        )}

        {/* Low stock warning */}
        {isLowStock && !isOutOfStock && (
          <div className="absolute bottom-2 left-2">
            <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
              ¡Últimas {product.stock} unidades!
            </span>
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <Link
            href={`/productores/${product.vendor.slug}`}
            className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
          >
            {product.vendor.displayName}
          </Link>

          <Link href={`/productos/${product.slug}`}>
            <h3 className="mt-0.5 text-sm font-semibold text-gray-900 line-clamp-2 hover:text-brand-700 transition-colors">
              {product.name}
            </h3>
          </Link>

          {product.originRegion && (
            <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
              <MapPinIcon className="h-3 w-3" />
              {product.originRegion}
            </p>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-gray-900">{formatPrice(product.basePrice)}</span>
              <span className="text-xs text-gray-400">/ {product.unit}</span>
            </div>
            {product.compareAtPrice && (
              <p className="text-xs text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</p>
            )}
          </div>

          <AddToCartButton
            productId={product.id}
            stock={product.stock}
            minQuantity={product.minOrderQuantity}
            compact
          />
        </div>
      </div>
    </div>
  )
}
