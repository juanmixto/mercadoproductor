import { api } from '@/lib/api'
import { ProductCard } from './ProductCard'

export async function FeaturedProducts() {
  const { data: products } = await api.products.list({ limit: '6' })

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {(products as any[]).map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
