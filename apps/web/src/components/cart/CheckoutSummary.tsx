import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

interface Props {
  cart: {
    subtotal: number
    items: {
      id: string
      quantity: number
      unitPrice: number
      priceSnapshot: { name: string; imageUrl: string; vendorName: string }
    }[]
  }
}

export function CheckoutSummary({ cart }: Props) {
  return (
    <div className="card p-4 space-y-4 sticky top-24">
      <h3 className="font-semibold text-gray-900 text-sm">Tu pedido</h3>
      <ul className="divide-y divide-gray-100">
        {cart.items.map(item => (
          <li key={item.id} className="flex items-center gap-3 py-3">
            <div className="relative h-12 w-12 shrink-0 rounded-md overflow-hidden bg-gray-100">
              <Image src={item.priceSnapshot.imageUrl || '/placeholder.jpg'} alt="" fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 truncate">{item.priceSnapshot.vendorName}</p>
              <p className="text-sm font-medium text-gray-900 truncate">{item.priceSnapshot.name}</p>
              <p className="text-xs text-gray-400">× {item.quantity}</p>
            </div>
            <span className="text-sm font-semibold">{formatPrice(Number(item.unitPrice) * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="border-t border-gray-100 pt-3 flex justify-between font-bold">
        <span>Total</span>
        <span>{formatPrice(cart.subtotal)}</span>
      </div>
    </div>
  )
}
