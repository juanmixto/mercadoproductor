import { Suspense } from 'react'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductFilters } from '@/components/product/ProductFilters'

export const metadata = { title: 'Productos' }

interface SearchParams {
  categoria?: string
  buscar?: string
  pagina?: string
  productor?: string
}

export default function ProductosPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Todos los productos</h1>
        <p className="mt-1 text-gray-500">Del campo a tu mesa, con amor y cuidado</p>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full lg:w-64 shrink-0">
          <Suspense fallback={<div className="h-64 rounded-xl bg-gray-100 animate-pulse" />}>
            <ProductFilters />
          </Suspense>
        </aside>
        <div className="flex-1">
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card animate-pulse p-4">
          <div className="mb-4 h-48 rounded-lg bg-gray-200" />
          <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  )
}
