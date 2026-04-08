'use client'

import { useState } from 'react'
import { PlusIcon, MinusIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/hooks/useCart'
import { cn } from '@/lib/utils'

interface Props {
  productId: string
  stock: number
  minQuantity?: number
  compact?: boolean
}

export function AddToCartButton({ productId, stock, minQuantity = 1, compact = false }: Props) {
  const { addItem } = useCart()
  const [qty, setQty] = useState(minQuantity)
  const [added, setAdded] = useState(false)

  async function handleAdd() {
    await addItem.mutateAsync({ productId, quantity: qty })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (stock === 0) {
    return (
      <span className={cn('badge bg-gray-100 text-gray-500', compact && 'text-xs')}>
        Agotado
      </span>
    )
  }

  if (compact) {
    return (
      <button
        onClick={(e) => { e.preventDefault(); handleAdd() }}
        disabled={addItem.isPending}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-50"
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Quantity selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Cantidad</span>
        <div className="flex items-center rounded-lg border border-gray-200">
          <button
            onClick={() => setQty(q => Math.max(minQuantity, q - 1))}
            className="flex h-9 w-9 items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-40"
            disabled={qty <= minQuantity}
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-semibold">{qty}</span>
          <button
            onClick={() => setQty(q => Math.min(stock, q + 1))}
            className="flex h-9 w-9 items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-40"
            disabled={qty >= stock}
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={addItem.isPending || added}
        className={cn(
          'btn-primary w-full gap-2 py-3',
          added && 'bg-brand-700',
        )}
      >
        <ShoppingCartIcon className="h-5 w-5" />
        {added ? '¡Añadido!' : addItem.isPending ? 'Añadiendo...' : 'Añadir al carrito'}
      </button>
    </div>
  )
}
