'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const categories = [
  { slug: 'frutas-verduras', name: 'Frutas y Verduras' },
  { slug: 'lacteos-huevos', name: 'Lácteos y Huevos' },
  { slug: 'aceites-conservas', name: 'Aceites y Conservas' },
  { slug: 'panaderia-cereales', name: 'Panadería y Cereales' },
]

const certifications = [
  { value: 'ECO-ES', label: 'Ecológico' },
  { value: 'DOP', label: 'DOP' },
  { value: 'KM0', label: 'Km0' },
]

export function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('pagina')
    router.push(`/productos?${params.toString()}`)
  }

  const activeCategory = searchParams.get('categoria')

  return (
    <div className="card p-4 space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Categorías</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setFilter('categoria', null)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                !activeCategory
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Todas las categorías
            </button>
          </li>
          {categories.map(cat => (
            <li key={cat.slug}>
              <button
                onClick={() => setFilter('categoria', cat.slug)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  activeCategory === cat.slug
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Certificaciones</h3>
        <ul className="space-y-2">
          {certifications.map(cert => (
            <li key={cert.value}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" className="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                {cert.label}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Precio máximo</h3>
        <input
          type="range"
          min={0}
          max={100}
          defaultValue={100}
          className="w-full accent-brand-600"
        />
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>0 €</span>
          <span>100 €</span>
        </div>
      </div>
    </div>
  )
}
