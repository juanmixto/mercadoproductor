import { notFound } from 'next/navigation'
import Image from 'next/image'
import { api } from '@/lib/api'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { VendorCard } from '@/components/vendor/VendorCard'
import { formatPrice } from '@/lib/utils'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  try {
    const product = await api.products.getBySlug(params.slug)
    return { title: product.name, description: product.description.slice(0, 160) }
  } catch {
    return { title: 'Producto no encontrado' }
  }
}

export default async function ProductoPage({ params }: Props) {
  let product
  try {
    product = await api.products.getBySlug(params.slug)
  } catch {
    notFound()
  }

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.basePrice
  const discountPct = hasDiscount
    ? Math.round((1 - product.basePrice / product.compareAtPrice!) * 100)
    : 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
            <Image
              src={product.images[0] ?? '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {hasDiscount && (
              <span className="absolute left-4 top-4 badge bg-red-100 text-red-700">
                -{discountPct}%
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(1).map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <Image src={img} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          {/* Certifications */}
          {product.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.certifications.map(cert => (
                <span key={cert} className="badge bg-brand-100 text-brand-700">{cert}</span>
              ))}
            </div>
          )}

          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            {product.originRegion && (
              <p className="mt-1 text-sm text-gray-500">Origen: {product.originRegion}</p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-gray-900">
              {formatPrice(product.basePrice)}
            </span>
            <span className="text-sm text-gray-500 mb-1">/ {product.unit}</span>
            {hasDiscount && (
              <span className="text-xl text-gray-400 line-through mb-1">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            {product.stock > 10 ? (
              <span className="text-brand-600 font-medium">● En stock</span>
            ) : product.stock > 0 ? (
              <span className="text-amber-600 font-medium">● Quedan {product.stock} {product.unit}s</span>
            ) : (
              <span className="text-red-600 font-medium">● Agotado</span>
            )}
          </div>

          {/* Add to cart */}
          <AddToCartButton
            productId={product.id}
            stock={product.stock}
            minQuantity={product.minOrderQuantity}
          />

          {/* Description */}
          <div className="prose prose-sm max-w-none text-gray-600">
            <h3 className="text-base font-semibold text-gray-900">Descripción</h3>
            <p>{product.description}</p>
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="badge bg-gray-100 text-gray-600">#{tag}</span>
              ))}
            </div>
          )}

          {/* Vendor */}
          <VendorCard vendor={product.vendor} />
        </div>
      </div>
    </div>
  )
}
