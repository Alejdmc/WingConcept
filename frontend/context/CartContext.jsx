'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '@/lib/api'

const CartContext = createContext(null)

function getOrCreateSessionId() {
  if (typeof window === 'undefined') return null
  let id = localStorage.getItem('session_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('session_id', id)
  }
  document.cookie = `session_id=${id}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
  return id
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const applyCartResponse = useCallback((res) => {
    setItems(res?.items || [])
    setTotal(res?.total || 0)
    setError('')
    return res
  }, [])

  const fetchCarrito = useCallback(async () => {
    try {
      const res = await api.carrito.obtener()
      return applyCartResponse(res)
    } catch (err) {
      console.error('Error fetching cart:', err)
      setItems([])
      setTotal(0)
      setError(err?.detail || 'Could not load cart.')
      return null
    }
  }, [applyCartResponse])

  useEffect(() => {
    getOrCreateSessionId()
    fetchCarrito()
  }, [fetchCarrito])

  const addToCart = useCallback(async (product) => {
    setCargando(true)
    setError('')
    try {
      const payload = product.variante_id
        ? { variante_id: product.variante_id, cantidad: product.cantidad || 1 }
        : { producto_id: product.producto_id || product.id, cantidad: product.cantidad || 1 }
      const res = await api.carrito.agregar(payload)
      return applyCartResponse(res)
    } catch (err) {
      const msg = err?.detail || 'Error adding to cart.'
      setError(msg)
      throw err
    } finally {
      setCargando(false)
    }
  }, [applyCartResponse])

  const addConfiguredProduct = useCallback(async (config) => {
    setCargando(true)
    setError('')
    try {
      const productoId = config.producto_id || config.productoId
      if (!productoId) throw new Error('Missing producto_id')

      const res = await api.carrito.agregar({
        producto_id: productoId,
        cantidad: config.cantidad || 1,
        configuracion: {
          engine: config.engine,
          chassisType: config.chassisType,
          propeller: config.propeller,
          chassisColor: config.chassisColor,
          accentColor: config.accentColor,
          peripheralColor: config.peripheralColor,
          upgrades: config.upgrades || [],
          totalPrice: config.totalPrice,
        },
      })
      return applyCartResponse(res)
    } catch (err) {
      const msg = err?.detail || 'Error adding to cart.'
      setError(msg)
      throw err
    } finally {
      setCargando(false)
    }
  }, [applyCartResponse])

  const removeFromCart = useCallback(async (itemId) => {
    setError('')
    try {
      const res = await api.carrito.eliminar(itemId)
      return applyCartResponse(res)
    } catch (err) {
      const msg = err?.detail || 'Error removing from cart.'
      setError(msg)
      throw err
    }
  }, [applyCartResponse])

  const updateQuantity = useCallback(async (itemId, cantidad) => {
    setError('')
    try {
      const res = await api.carrito.actualizar(itemId, cantidad)
      return applyCartResponse(res)
    } catch (err) {
      const msg = err?.detail || 'Error updating quantity.'
      setError(msg)
      throw err
    }
  }, [applyCartResponse])

  const clearCart = useCallback(async () => {
    try {
      await api.carrito.vaciar()
      setItems([])
      setTotal(0)
      setError('')
    } catch (err) {
      setError(err?.detail || 'Error clearing cart.')
    }
  }, [])

  return (
    <CartContext.Provider value={{
      items,
      total,
      cargando,
      error,
      addToCart,
      addConfiguredProduct,
      removeFromCart,
      updateQuantity,
      clearCart,
      refetch: fetchCarrito,
      itemCount: items.reduce((sum, item) => sum + (item.cantidad || 1), 0),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider')
  }
  return ctx
}
