import { create } from 'zustand'

export const useCartStore = create((set) => ({
  items: [],
  
  addToCart: (product) => set((state) => ({
    items: [...state.items, { ...product, cartId: Date.now() }]
  })),
  
  removeFromCart: (cartId) => set((state) => ({
    items: state.items.filter(item => item.cartId !== cartId)
  })),
  
  clearCart: () => set({ items: [] }),
  
  getTotalPrice: () => {
    // Esto lo usarás después
  }
}))