import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface Props {
  cart: {
    subtotal: number
    items: { isAvailable: boolean; quantity: number }[]
  }
}

export function CartSummary({ cart }: Props) {
  const availableItems = cart.items.filter(i => i.isAvailable)
  const hasUnavailable = availableItems.length < cart.items.length
  const shipping = 0 // gratis por ahora
  const tax = cart.subtotal * 0.1
  const total = cart.subtotal + shipping

  return (
    <div className="card p-6 space-y-4 sticky top-24">
      <h2 className="font-semibold text-gray-900">Resumen del pedido</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({availableItems.reduce((s, i) => s + i.quantity, 0)} productos)</span>
          <span>{formatPrice(cart.subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Envío</span>
          <span className="text-brand-600 font-medium">{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      {hasUnavailable && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg p-3">
          Elimina los productos no disponibles antes de continuar.
        </p>
      )}

      <Link
        href="/checkout"
        className={`btn-primary w-full py-3 text-base ${hasUnavailable ? 'pointer-events-none opacity-50' : ''}`}
      >
        Finalizar compra
      </Link>

      <p className="text-center text-xs text-gray-400">
        Pago seguro con Stripe
      </p>
    </div>
  )
}
