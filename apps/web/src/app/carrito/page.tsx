'use client'

import Link from 'next/link'
import { CartItemRow } from '@/components/cart/CartItemRow'
import { CartSummary } from '@/components/cart/CartSummary'
import { useCart } from '@/hooks/useCart'

export default function CarritoPage() {
  const { cart, isLoading } = useCart()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-gray-100" />)}
        </div>
      </div>
    )
  }

  const items = cart?.items ?? []
  const hasUnavailable = items.some(i => !i.isAvailable)
  const hasPriceChanged = items.some(i => i.priceChanged)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Tu carrito</h1>

      {items.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-xl text-gray-400 mb-6">Tu carrito está vacío</p>
          <Link href="/productos" className="btn-primary">Ver productos</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Items */}
          <div className="flex-1 space-y-4">
            {(hasUnavailable || hasPriceChanged) && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                {hasUnavailable && <p>Algunos productos ya no están disponibles y se han marcado en rojo.</p>}
                {hasPriceChanged && <p>Algunos precios han cambiado desde que los añadiste al carrito.</p>}
              </div>
            )}
            {items.map(item => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          {/* Summary */}
          <div className="w-full lg:w-80 shrink-0">
            <CartSummary cart={cart!} />
          </div>
        </div>
      )}
    </div>
  )
}
