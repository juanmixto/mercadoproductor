'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { vendorApi } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import {
  PlusIcon, ExclamationTriangleIcon, PencilIcon,
  EyeIcon, ArchiveBoxXMarkIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  DRAFT:          { label: 'Borrador', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  PENDING_REVIEW: { label: 'En revisión', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  ACTIVE:         { label: 'Activo', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  SUSPENDED:      { label: 'Suspendido', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  DISCONTINUED:   { label: 'Descatalogado', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-300' },
  REJECTED:       { label: 'Rechazado', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
}

const FILTER_TABS = [
  { value: 'all', label: 'Todos' },
  { value: 'ACTIVE', label: 'Activos' },
  { value: 'PENDING_REVIEW', label: 'En revisión' },
  { value: 'DRAFT', label: 'Borradores' },
  { value: 'REJECTED', label: 'Rechazados' },
]

export default function CatalogoPage() {
  const [activeFilter, setActiveFilter] = useState('all')

  const { data: products, isLoading } = useQuery({
    queryKey: ['vendor-products'],
    queryFn: () => vendorApi.get('/products?limit=100').then(r => r.data.data ?? []),
  })

  const all = products as any[] ?? []

  const filtered = activeFilter === 'all' ? all : all.filter((p: any) => p.status === activeFilter)
  const lowStockItems = all.filter((p: any) => p.status === 'ACTIVE' && p.stock <= 10 && p.stock > 0)
  const outOfStockItems = all.filter((p: any) => p.status === 'ACTIVE' && p.stock === 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi catálogo</h1>
          <p className="text-sm text-gray-500">{all.length} productos en total</p>
        </div>
        <Link href="/catalogo/nuevo" className="btn-primary gap-2">
          <PlusIcon className="h-4 w-4" />
          Añadir producto
        </Link>
      </div>

      {/* Alerts */}
      {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
        <div className="space-y-2">
          {outOfStockItems.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 shrink-0" />
              <p className="text-sm text-red-800">
                <strong>{outOfStockItems.length} producto{outOfStockItems.length !== 1 ? 's' : ''} sin stock</strong>
                {' '}— tus clientes no podrán comprarlos. Actualiza el stock.
              </p>
            </div>
          )}
          {lowStockItems.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-800">
                <strong>{lowStockItems.length} producto{lowStockItems.length !== 1 ? 's' : ''} con stock bajo</strong>
                {' '}(≤10 unidades). Revisa y repón si es necesario.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1 w-fit">
        {FILTER_TABS.map(tab => {
          const count = tab.value === 'all' ? all.length : all.filter((p: any) => p.status === tab.value).length
          return (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                activeFilter === tab.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeFilter === tab.value ? 'bg-gray-100 text-gray-600' : 'text-gray-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-56 rounded-xl bg-gray-100" />)}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && all.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <span className="text-4xl">🌿</span>
          <p className="mt-4 font-medium text-gray-700">Tu catálogo está vacío</p>
          <p className="text-sm text-gray-400 mt-1">Añade tu primer producto para empezar a vender</p>
          <Link href="/catalogo/nuevo" className="btn-primary mt-6 inline-flex gap-2">
            <PlusIcon className="h-4 w-4" />
            Añadir primer producto
          </Link>
        </div>
      )}

      {/* Products grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p: any) => {
            const sc = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.DRAFT
            const isLowStock = p.stock <= 10 && p.stock > 0
            const isOutOfStock = p.stock === 0

            return (
              <div key={p.id} className={`card overflow-hidden group hover:shadow-md transition-shadow ${isOutOfStock ? 'opacity-75' : ''}`}>
                {/* Image */}
                <div className="relative h-44 bg-gray-100">
                  <Image
                    src={p.images?.[0] ?? '/placeholder.jpg'}
                    alt={p.name}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute left-2 top-2 flex flex-col gap-1">
                    <span className={`badge ${sc.color}`}>
                      <span className={`mr-1 h-1.5 w-1.5 rounded-full ${sc.dot} inline-block`} />
                      {sc.label}
                    </span>
                  </div>
                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                      <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">Sin stock</span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{p.name}</h3>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">{formatPrice(Number(p.basePrice))}</span>
                    <span className={`text-xs font-medium ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-gray-400'}`}>
                      {isOutOfStock ? '⚠ Sin stock' : isLowStock ? `⚠ ${p.stock} ${p.unit}` : `${p.stock} ${p.unit}`}
                    </span>
                  </div>

                  {/* Rejection note */}
                  {p.status === 'REJECTED' && p.rejectionReason && (
                    <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                      <strong>Motivo de rechazo:</strong> {p.rejectionReason}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/catalogo/${p.id}/editar`}
                      className="btn-secondary flex-1 gap-1.5 text-xs justify-center"
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                      Editar
                    </Link>
                    <Link
                      href={`/productos/${p.slug}`}
                      target="_blank"
                      className="btn-ghost text-xs p-2"
                      title="Ver en tienda"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!isLoading && filtered.length === 0 && all.length > 0 && (
        <div className="py-12 text-center text-gray-400">
          No hay productos con el filtro seleccionado
        </div>
      )}
    </div>
  )
}
