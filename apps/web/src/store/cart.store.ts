import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartStore {
  itemCount: number
  setItemCount: (count: number) => void
  increment: () => void
  decrement: (by?: number) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      itemCount: 0,
      setItemCount: (count) => set({ itemCount: count }),
      increment: () => set((s) => ({ itemCount: s.itemCount + 1 })),
      decrement: (by = 1) => set((s) => ({ itemCount: Math.max(0, s.itemCount - by) })),
    }),
    { name: 'mp-cart-store' },
  ),
)
