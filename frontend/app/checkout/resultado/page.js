'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock3 } from 'lucide-react'
import { api } from '@/lib/api'
import { useCart } from '@/hooks/useCart'

const ESTADO_LABELS = {
  pendiente: 'Pending',
  pagado: 'Paid',
  procesando: 'Processing',
  enviado: 'Shipped',
  entregado: 'Delivered',
  cancelado: 'Cancelled',
  reembolsado: 'Refunded',
  error_stock: 'Stock Error',
}

export default function ResultPage() {
  const { refetch } = useCart()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const orderId = typeof window !== 'undefined' ? sessionStorage.getItem('current_order_id') : null
    refetch()
    if (!orderId) {
      setLoading(false)
      return
    }
    api.ordenes.detalle(orderId)
      .then((data) => setOrder(data))
      .catch((err) => console.error('Error fetching order:', err))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const statusLabel = order ? (ESTADO_LABELS[order.estado] || order.estado) : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-16">
      <div className="max-w-xl w-full bg-white border border-borderline rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock3 className="w-8 h-8 text-yellow-600" />
        </div>

        <h1 className="text-3xl font-black text-ink mb-2">Payment Result</h1>
        <p className="text-ink2 mb-6">We are processing your payment. Check your email for updates or contact support.</p>

        {!loading && order && (
          <div className="bg-bg2 rounded-lg p-6 mb-8">
            <p className="text-sm text-ink2 mb-2">Order Number</p>
            <p className="text-2xl font-black text-brand mb-2">{order.numero_orden}</p>
            <span className="inline-block px-3 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-700">
              {statusLabel}
            </span>
          </div>
        )}

        <div className="flex gap-4">
          <Link href="/" className="flex-1 px-6 py-3 border-2 border-borderline text-ink rounded-lg font-bold uppercase hover:border-brand transition">
            Home
          </Link>
          <Link href="/orders" className="flex-1 px-6 py-3 bg-brand text-white rounded-lg font-bold uppercase hover:bg-brand/90 transition">
            View Orders
          </Link>
        </div>
      </div>
    </div>
  )
}
