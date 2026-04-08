import Link from 'next/link'

const categories = [
  { slug: 'frutas-verduras', name: 'Frutas y Verduras', icon: '🍅', color: 'bg-red-50 hover:bg-red-100' },
  { slug: 'lacteos-huevos', name: 'Lácteos y Huevos', icon: '🥛', color: 'bg-yellow-50 hover:bg-yellow-100' },
  { slug: 'aceites-conservas', name: 'Aceites y Conservas', icon: '🫙', color: 'bg-amber-50 hover:bg-amber-100' },
  { slug: 'panaderia-cereales', name: 'Panadería y Cereales', icon: '🍞', color: 'bg-orange-50 hover:bg-orange-100' },
  { slug: 'carnes-embutidos', name: 'Carnes y Embutidos', icon: '🥩', color: 'bg-rose-50 hover:bg-rose-100' },
  { slug: 'vinos-bebidas', name: 'Vinos y Bebidas', icon: '🍷', color: 'bg-purple-50 hover:bg-purple-100' },
  { slug: 'miel-mermeladas', name: 'Miel y Mermeladas', icon: '🍯', color: 'bg-yellow-50 hover:bg-yellow-100' },
  { slug: 'plantas-hierbas', name: 'Plantas y Hierbas', icon: '🌿', color: 'bg-green-50 hover:bg-green-100' },
]

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {categories.map(cat => (
        <Link
          key={cat.slug}
          href={`/productos?categoria=${cat.slug}`}
          className={`flex flex-col items-center gap-2 rounded-xl p-4 transition ${cat.color}`}
        >
          <span className="text-3xl">{cat.icon}</span>
          <span className="text-center text-xs font-medium text-gray-700 leading-tight">{cat.name}</span>
        </Link>
      ))}
    </div>
  )
}
