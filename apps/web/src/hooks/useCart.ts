import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useCartStore } from '@/store/cart.store'
import { useEffect } from 'react'

export function useCart() {
  const queryClient = useQueryClient()
  const setItemCount = useCartStore(s => s.setItemCount)

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => apiClient.get('/cart').then(r => r.data.data),
  })

  useEffect(() => {
    if (cart?.items) {
      const total = cart.items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0)
      setItemCount(total)
    }
  }, [cart, setItemCount])

  const addItem = useMutation({
    mutationFn: (vars: { productId: string; variantId?: string; quantity: number }) =>
      apiClient.post('/cart/items', vars),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })

  const updateItem = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      apiClient.patch(`/cart/items/${itemId}`, { quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })

  const removeItem = useMutation({
    mutationFn: (itemId: string) => apiClient.delete(`/cart/items/${itemId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })

  return { cart, isLoading, addItem, updateItem, removeItem }
}
