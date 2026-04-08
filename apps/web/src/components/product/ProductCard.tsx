import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { AddToCartButton } from '@/components/cart/AddToCartButton'

interface ProductCardProps {
  product: {
    id: string
    slug: string
    name: string
    basePrice: number
    images: string[]
    unit: string
    stock: number
    minOrderQuantity: number
    certifications: string[]
    originRegion?: string
    vendor: { displayName: string; slug: string }
  }
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="card group overflow-hidden flex flex-col">
      <Link href={`/productos/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={product.images[0] ?? '/placeholder.jpg'}
          alt={product.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {product.certifications.includes('ECO-ES') && (
          <span className="absolute left-2 top-2 badge bg-brand-600 text-white">ECO</span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <Link
            href={`/productores/${product.vendor.slug}`}
            className="text-xs text-brand-600 hover:underline font-medium"
          >
            {product.vendor.displayName}
          </Link>
          <Link href={`/productos/${product.slug}`}>
            <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2 hover:text-brand-700">
              {product.name}
            </h3>
          </Link>
          {product.originRegion && (
            <p className="mt-0.5 text-xs text-gray-400">{product.originRegion}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">{formatPrice(product.basePrice)}</span>
            <span className="text-xs text-gray-400 ml-1">/ {product.unit}</span>
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
