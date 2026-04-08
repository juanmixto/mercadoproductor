'use client'

import Image from 'next/image'
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  item: {
    id: string
    productId: string
    quantity: number
    unitPrice: number
    isAvailable: boolean
    priceChanged: boolean
    priceSnapshot: {
      name: string
      imageUrl: string
      vendorName: string
      price: number
    }
  }
}

export function CartItemRow({ item }: Props) {
  const { updateItem, removeItem } = useCart()
  const snapshot = item.priceSnapshot

  return (
    <div className={cn(
      'card flex gap-4 p-4',
      !item.isAvailable && 'border-red-200 bg-red-50',
    )}>
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <Image src={snapshot.imageUrl || '/placeholder.jpg'} alt={snapshot.name} fill className="object-cover" />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-brand-600 font-medium">{snapshot.vendorName}</p>
            <p className="text-sm font-semibold text-gray-900">{snapshot.name}</p>
            {!item.isAvailable && (
              <p className="text-xs text-red-600 mt-0.5">Producto no disponible</p>
            )}
            {item.priceChanged && (
              <p className="text-xs text-amber-600 mt-0.5">
                Precio actualizado: {formatPrice(item.unitPrice)} (era {formatPrice(snapshot.price)})
              </p>
            )}
          </div>
          <button
            onClick={() => removeItem.mutate(item.id)}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center rounded-lg border border-gray-200">
            <button
              onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
              className="flex h-7 w-7 items-center justify-center text-gray-500 hover:text-gray-900"
            >
              <MinusIcon className="h-3 w-3" />
            </button>
            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
            <button
              onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
              className="flex h-7 w-7 items-center justify-center text-gray-500 hover:text-gray-900"
            >
              <PlusIcon className="h-3 w-3" />
            </button>
          </div>
          <span className="font-bold text-gray-900">
            {formatPrice(Number(item.unitPrice) * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  )
}
