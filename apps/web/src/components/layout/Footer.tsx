import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🌿</span>
              <span className="font-bold text-gray-900">Mercado Productor</span>
            </div>
            <p className="text-sm text-gray-500">
              Del campo a tu mesa. Apoyamos a pequeños productores locales y la agricultura sostenible.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Tienda</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/productos" className="hover:text-gray-900">Todos los productos</Link></li>
              <li><Link href="/productores" className="hover:text-gray-900">Productores</Link></li>
              <li><Link href="/productos?categoria=frutas-verduras" className="hover:text-gray-900">Frutas y verduras</Link></li>
              <li><Link href="/productos?categoria=lacteos-huevos" className="hover:text-gray-900">Lácteos y huevos</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Ayuda</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/ayuda/como-funciona" className="hover:text-gray-900">Cómo funciona</Link></li>
              <li><Link href="/ayuda/envios" className="hover:text-gray-900">Envíos y entregas</Link></li>
              <li><Link href="/ayuda/devoluciones" className="hover:text-gray-900">Devoluciones</Link></li>
              <li><Link href="/contacto" className="hover:text-gray-900">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Productores</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/vendedores/registro" className="hover:text-gray-900">Únete como productor</Link></li>
              <li><Link href="/vendedores/como-funciona" className="hover:text-gray-900">Cómo funciona</Link></li>
              <li><Link href="/vendedores/comisiones" className="hover:text-gray-900">Comisiones</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 flex flex-col sm:flex-row justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Mercado Productor. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="/legal/privacidad" className="hover:text-gray-600">Privacidad</Link>
            <Link href="/legal/cookies" className="hover:text-gray-600">Cookies</Link>
            <Link href="/legal/terminos" className="hover:text-gray-600">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
