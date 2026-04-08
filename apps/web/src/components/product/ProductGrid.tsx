import { api } from '@/lib/api'
import { ProductCard } from './ProductCard'

interface Props {
  searchParams: {
    categoria?: string
    buscar?: string
    pagina?: string
    productor?: string
  }
}

export async function ProductGrid({ searchParams }: Props) {
  const params: Record<string, string> = {}
  if (searchParams.categoria) params.categoryId = searchParams.categoria
  if (searchParams.buscar) params.search = searchParams.buscar
  if (searchParams.pagina) params.page = searchParams.pagina
  if (searchParams.productor) params.vendorId = searchParams.productor

  const { data: products, meta } = await api.products.list(params)

  if ((products as unknown[]).length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-400">No se encontraron productos con estos filtros</p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-4 text-sm text-gray-500">
        {(meta as { total: number }).total} productos encontrados
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(products as any[]).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
