'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline'

const CATEGORIES = [
  { slug: 'frutas-verduras', name: 'Frutas y Verduras', icon: '🍅' },
  { slug: 'lacteos-huevos', name: 'Lácteos y Huevos', icon: '🥛' },
  { slug: 'aceites-conservas', name: 'Aceites y Conservas', icon: '🫙' },
  { slug: 'panaderia-cereales', name: 'Panadería y Cereales', icon: '🍞' },
  { slug: 'carnes-embutidos', name: 'Carnes y Embutidos', icon: '🥩' },
  { slug: 'vinos-bebidas', name: 'Vinos y Bebidas', icon: '🍷' },
  { slug: 'miel-mermeladas', name: 'Miel y Mermeladas', icon: '🍯' },
  { slug: 'plantas-hierbas', name: 'Plantas y Hierbas', icon: '🌿' },
]

const CERTIFICATIONS = [
  { value: 'ECO-ES', label: '🌱 Ecológico' },
  { value: 'DOP', label: '🏅 DOP' },
  { value: 'KM0', label: '📍 KM0' },
]

export function ProductFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeCategory = searchParams.get('categoria') ?? ''
  const activeCerts = searchParams.getAll('cert')
  const activeSort = searchParams.get('orden') ?? 'relevance'

  const updateParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null) params.delete(key)
    else params.set(key, value)
    params.delete('pagina')
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  const toggleCert = useCallback((cert: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const existing = params.getAll('cert')
    params.delete('cert')
    if (existing.includes(cert)) {
      existing.filter(c => c !== cert).forEach(c => params.append('cert', c))
    } else {
      [...existing, cert].forEach(c => params.append('cert', c))
    }
    params.delete('pagina')
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  const clearAll = useCallback(() => router.push(pathname), [router, pathname])
  const hasFilters = !!(activeCategory || activeCerts.length > 0)

  function FiltersContent() {
    return (
      <div className="space-y-5">
        {/* Sort */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Ordenar por</h3>
          <div className="space-y-0.5">
            {[
              { value: 'relevance', label: 'Relevancia' },
              { value: 'price_asc', label: 'Precio: menor primero' },
              { value: 'price_desc', label: 'Precio: mayor primero' },
              { value: 'newest', label: 'Más recientes' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => updateParam('orden', opt.value === 'relevance' ? null : opt.value)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                  activeSort === opt.value ? 'bg-brand-50 font-semibold text-brand-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {activeSort === opt.value && <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="border-t border-gray-100 pt-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Categoría</h3>
          <div className="space-y-0.5">
            <button
              onClick={() => updateParam('categoria', null)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                !activeCategory ? 'bg-brand-50 font-semibold text-brand-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Todas las categorías
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.slug}
                onClick={() => updateParam('categoria', activeCategory === cat.slug ? null : cat.slug)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                  activeCategory === cat.slug ? 'bg-brand-50 font-semibold text-brand-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="border-t border-gray-100 pt-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Certificaciones</h3>
          <div className="space-y-1">
            {CERTIFICATIONS.map(cert => (
              <label key={cert.value} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-50 transition">
                <input
                  type="checkbox"
                  checked={activeCerts.includes(cert.value)}
                  onChange={() => toggleCert(cert.value)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-gray-700">{cert.label}</span>
              </label>
            ))}
          </div>
        </div>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-red-300 hover:text-red-600 transition"
          >
            <XMarkIcon className="h-4 w-4" />
            Limpiar filtros
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block sticky top-24">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Filtros</h2>
            {hasFilters && (
              <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-700">Limpiar</button>
            )}
          </div>
          <FiltersContent />
        </div>
      </div>

      {/* Mobile toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm"
        >
          <span className="flex items-center gap-2">
            <FunnelIcon className="h-4 w-4" />
            Filtros
            {hasFilters && (
              <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] text-white font-bold">
                {(activeCategory ? 1 : 0) + activeCerts.length}
              </span>
            )}
          </span>
          <span className="text-gray-400 text-xs">Toca para abrir</span>
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <div className="relative ml-auto h-full w-full max-w-xs overflow-y-auto bg-white p-5 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Filtros</h2>
                <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 hover:bg-gray-100">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <FiltersContent />
              <button onClick={() => setMobileOpen(false)} className="mt-6 w-full btn-primary">
                Ver resultados
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
