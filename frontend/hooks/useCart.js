import { useCartStore } from '@/store/cartStore'

export function useCart() {
  const items = useCartStore(state => state.items)
  const addToCart = useCartStore(state => state.addToCart)
  const removeFromCart = useCartStore(state => state.removeFromCart)
  const clearCart = useCartStore(state => state.clearCart)

  const total = items.reduce((sum, item) => {
    const price = parseInt(item.price.replace('$', '').replace(',', ''))
    return sum + price
  }, 0)

  return { items, addToCart, removeFromCart, clearCart, total }
}