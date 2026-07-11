'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function OrderDetail({ params }) {
  const { id } = params
  const [order, setOrder] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await api.ordenes.detalle(id)
        if (mounted) setOrder(res)
      } catch (err) {
        console.warn('Could not load order', err)
      }
    })()
    return () => { mounted = false }
  }, [id])

  if (!order) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-black mb-4">Order {order.id}</h1>
      <pre className="bg-bg2 p-4 rounded">{JSON.stringify(order, null, 2)}</pre>
    </div>
  )
}
