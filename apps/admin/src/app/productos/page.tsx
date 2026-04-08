'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { ProductStatus } from '@mercadoproductor/shared'
import Image from 'next/image'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING_REVIEW: { label: 'En revisión', color: 'bg-amber-100 text-amber-700' },
  ACTIVE: { label: 'Activo', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Rechazado', color: 'bg-red-100 text-red-700' },
  DRAFT: { label: 'Borrador', color: 'bg-gray-100 text-gray-600' },
  SUSPENDED: { label: 'Suspendido', color: 'bg-orange-100 text-orange-700' },
}

export default function ProductosAdminPage() {
  const qc = useQueryClient()

  const { data: pending } = useQuery({
    queryKey: ['admin-products-pending'],
    queryFn: () => adminApi.get('/admin/products/pending').then(r => r.data.data),
  })

  const review = useMutation({
    mutationFn: ({ id, action, note }: { id: string; action: 'approve' | 'reject'; note?: string }) =>
      adminApi.patch(`/products/${id}/review`, { action, note }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products-pending'] }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-sm text-gray-500">Cola de revisión y catálogo</p>
        </div>
      </div>

      {/* Pending review queue */}
      <div className="card">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Pendientes de revisión
            {pending?.length > 0 && (
              <span className="ml-2 badge bg-amber-100 text-amber-700">{pending.length}</span>
            )}
          </h2>
        </div>
        {!pending || pending.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400">Cola vacía — buen trabajo</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {(pending as any[]).map((product: any) => (
              <li key={product.id} className="flex items-start gap-4 p-5">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={product.images?.[0] ?? '/placeholder.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.vendor?.displayName} · {product.category?.name}</p>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  <div className="mt-1 flex gap-2 flex-wrap">
                    {(product.certifications as string[])?.map((c: string) => (
                      <span key={c} className="badge bg-green-100 text-green-700">{c}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <p className="text-right text-sm font-bold text-gray-900">
                    {Number(product.basePrice).toFixed(2)} € / {product.unit}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => review.mutate({ id: product.id, action: 'approve' })}
                      disabled={review.isPending}
                      className="btn-primary text-xs"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => {
                        const note = prompt('Motivo del rechazo:')
                        if (note) review.mutate({ id: product.id, action: 'reject', note })
                      }}
                      disabled={review.isPending}
                      className="btn-danger text-xs"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
