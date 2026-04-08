'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { vendorApi } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { PlusIcon } from '@heroicons/react/24/outline'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Borrador', color: 'bg-gray-100 text-gray-600' },
  PENDING_REVIEW: { label: 'En revisión', color: 'bg-amber-100 text-amber-700' },
  ACTIVE: { label: 'Activo', color: 'bg-green-100 text-green-700' },
  SUSPENDED: { label: 'Suspendido', color: 'bg-orange-100 text-orange-700' },
  DISCONTINUED: { label: 'Descatalogado', color: 'bg-gray-100 text-gray-500' },
  REJECTED: { label: 'Rechazado', color: 'bg-red-100 text-red-700' },
}

export default function CatalogoPage() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['vendor-products'],
    queryFn: () => vendorApi.get('/products?limit=50').then(r => r.data.data),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi catálogo</h1>
          <p className="text-sm text-gray-500">Gestiona tus productos</p>
        </div>
        <Link href="/catalogo/nuevo" className="btn-primary gap-2">
          <PlusIcon className="h-4 w-4" />
          Añadir producto
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-xl bg-gray-200" />)}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(products as any[] ?? []).map((p: any) => {
          const sc = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.DRAFT
          return (
            <div key={p.id} className="card overflow-hidden">
              <div className="relative h-40 bg-gray-100">
                <Image
                  src={p.images?.[0] ?? '/placeholder.jpg'}
                  alt={p.name}
                  fill
                  className="object-cover"
                />
                <span className={`absolute left-2 top-2 badge ${sc.color}`}>{sc.label}</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">{p.name}</h3>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-bold text-gray-900">{formatPrice(Number(p.basePrice))}</span>
                  <span className="text-xs text-gray-400">Stock: {p.stock} {p.unit}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link href={`/catalogo/${p.id}/editar`} className="btn-secondary flex-1 text-xs text-center">
                    Editar
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {(products as any[] ?? []).length === 0 && !isLoading && (
        <div className="py-20 text-center">
          <p className="text-gray-400 mb-4">Aún no tienes productos en tu catálogo</p>
          <Link href="/catalogo/nuevo" className="btn-primary">Añadir primer producto</Link>
        </div>
      )}
    </div>
  )
}
