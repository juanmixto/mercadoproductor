'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { adminApi } from '@/lib/api'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { XMarkIcon, CheckIcon, XCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function ProductosAdminPage() {
  const qc = useQueryClient()
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [detailProduct, setDetailProduct] = useState<any>(null)
  const [search, setSearch] = useState('')

  const { data: pending, isLoading } = useQuery({
    queryKey: ['admin-products-pending'],
    queryFn: () => adminApi.get('/admin/products/pending').then(r => r.data.data ?? []),
  })

  const review = useMutation({
    mutationFn: ({ id, action, note }: { id: string; action: 'approve' | 'reject'; note?: string }) =>
      adminApi.patch(`/products/${id}/review`, { action, note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products-pending'] })
      qc.invalidateQueries({ queryKey: ['admin-sidebar-alerts'] })
      setRejectModal(null)
      setDetailProduct(null)
      setRejectNote('')
    },
  })

  const products = ((pending as any[]) ?? []).filter((p: any) =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.vendor?.displayName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-sm text-gray-500">Cola de revisión del catálogo</p>
        </div>
        {(pending as any[])?.length > 0 && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
            {(pending as any[]).length} pendientes
          </span>
        )}
      </div>

      {/* Search */}
      {(pending as any[])?.length > 3 && (
        <div className="relative max-w-xs">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto o productor..."
            className="input pl-9"
          />
        </div>
      )}

      {/* Queue */}
      <div className="card overflow-hidden">
        <div className="border-b border-gray-100 bg-amber-50 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-amber-900">
            Cola de revisión
            {products.length > 0 && (
              <span className="ml-2 badge bg-amber-200 text-amber-800">{products.length}</span>
            )}
          </h2>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-20 w-20 rounded-lg bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                  <div className="h-3 w-1/3 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-2xl mb-3">✓</p>
            <p className="text-sm font-medium text-gray-700">Cola vacía</p>
            <p className="text-xs text-gray-400 mt-1">Todos los productos han sido revisados</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {products.map((product: any) => (
              <li key={product.id} className="flex items-start gap-4 p-5 hover:bg-gray-50 transition">
                {/* Image */}
                <button
                  onClick={() => setDetailProduct(product)}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 hover:opacity-80 transition"
                >
                  <Image
                    src={product.images?.[0] ?? '/placeholder.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <button
                        onClick={() => setDetailProduct(product)}
                        className="font-medium text-gray-900 hover:text-indigo-600 transition text-left"
                      >
                        {product.name}
                      </button>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {product.vendor?.displayName} · {product.category?.name}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 shrink-0">
                      {formatPrice(Number(product.basePrice))} / {product.unit}
                    </p>
                  </div>

                  <p className="mt-1.5 text-sm text-gray-600 line-clamp-2">{product.description}</p>

                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {(product.certifications as string[])?.map((c: string) => (
                      <span key={c} className="badge bg-green-100 text-green-700">{c}</span>
                    ))}
                    {product.originRegion && (
                      <span className="badge bg-gray-100 text-gray-600">📍 {product.originRegion}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => review.mutate({ id: product.id, action: 'approve' })}
                    disabled={review.isPending}
                    className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition"
                  >
                    <CheckIcon className="h-3.5 w-3.5" />
                    Aprobar
                  </button>
                  <button
                    onClick={() => setRejectModal({ id: product.id, name: product.name })}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                  >
                    <XCircleIcon className="h-3.5 w-3.5" />
                    Rechazar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="card w-full max-w-sm p-6 space-y-4 mx-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Rechazar producto</h2>
              <button onClick={() => setRejectModal(null)} className="rounded-lg p-1 hover:bg-gray-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              El productor recibirá el motivo del rechazo junto a su producto <strong>{rejectModal.name}</strong>.
            </p>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Motivo del rechazo *</label>
              <textarea
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
                rows={4}
                className="input resize-none"
                placeholder="Ej: Las imágenes no son claras, la descripción no indica el origen del producto..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRejectModal(null)} className="btn-secondary">Cancelar</button>
              <button
                onClick={() => review.mutate({ id: rejectModal.id, action: 'reject', note: rejectNote })}
                disabled={!rejectNote.trim() || review.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition"
              >
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
              <h2 className="font-bold text-gray-900">Detalle del producto</h2>
              <button onClick={() => setDetailProduct(null)} className="rounded-lg p-1 hover:bg-gray-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            {detailProduct.images?.[0] && (
              <div className="relative h-56 bg-gray-100">
                <Image src={detailProduct.images[0]} alt={detailProduct.name} fill className="object-cover" />
              </div>
            )}
            <div className="p-5 space-y-3">
              <div>
                <p className="text-lg font-bold text-gray-900">{detailProduct.name}</p>
                <p className="text-sm text-gray-500">{detailProduct.vendor?.displayName} · {detailProduct.category?.name}</p>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{detailProduct.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-400">Precio:</span> <strong>{formatPrice(Number(detailProduct.basePrice))} / {detailProduct.unit}</strong></div>
                <div><span className="text-gray-400">IVA:</span> <strong>{(Number(detailProduct.taxRate) * 100).toFixed(0)}%</strong></div>
                <div><span className="text-gray-400">Stock:</span> <strong>{detailProduct.stock}</strong></div>
                {detailProduct.originRegion && <div><span className="text-gray-400">Origen:</span> <strong>{detailProduct.originRegion}</strong></div>}
              </div>
              {detailProduct.certifications?.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {detailProduct.certifications.map((c: string) => (
                    <span key={c} className="badge bg-green-100 text-green-700">{c}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => review.mutate({ id: detailProduct.id, action: 'approve' })}
                  disabled={review.isPending}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4" /> Aprobar
                </button>
                <button
                  onClick={() => { setRejectModal({ id: detailProduct.id, name: detailProduct.name }); setDetailProduct(null) }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
                >
                  <XCircleIcon className="h-4 w-4" /> Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
