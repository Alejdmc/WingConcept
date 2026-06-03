'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

function getOrCreateSessionId() {
  let id = localStorage.getItem('session_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('session_id', id)
  }
  return id
}

export function useCart() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    getOrCreateSessionId()
    fetchCarrito()
  }, [])

  const fetchCarrito = useCallback(async () => {
    try {
      const res = await api.carrito.obtener()
      setItems(res.items || [])
      setTotal(res.total || 0)
    } catch (err) {
      console.error('Error fetching cart:', err)
      setItems([])
    }
  }, [])

  const addToCart = useCallback(async (product) => {
    setCargando(true)
    try {
      const res = await api.carrito.agregar({
        variante_id: product.id,
        cantidad: 1,
      })
      setItems(res.items || [])
      setTotal(res.total || 0)
    } catch (err) {
      console.error('Error adding to cart:', err)
    } finally {
      setCargando(false)
    }
  }, [])

  const removeFromCart = useCallback(async (itemId) => {
    try {
      const res = await api.carrito.eliminar(itemId)
      setItems(res.items || [])
      setTotal(res.total || 0)
    } catch (err) {
      console.error('Error removing from cart:', err)
    }
  }, [])

  const updateQuantity = useCallback(async (itemId, cantidad) => {
    try {
      const res = await api.carrito.actualizar(itemId, cantidad)
      setItems(res.items || [])
      setTotal(res.total || 0)
    } catch (err) {
      console.error('Error updating cart:', err)
    }
  }, [])

  const clearCart = useCallback(async () => {
    try {
      await api.carrito.vaciar()
      setItems([])
      setTotal(0)
    } catch (err) {
      console.error('Error clearing cart:', err)
    }
  }, [])

  return { 
    items, 
    total, 
    cargando, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    refetch: fetchCarrito 
  }
}