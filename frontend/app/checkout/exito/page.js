'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api'
import { useCart } from '@/hooks/useCart'

export default function SuccessPage() {
  const { refetch } = useCart()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const orderId = typeof window !== 'undefined' ? sessionStorage.getItem('current_order_id') : null

    const cleanup = () => {
      sessionStorage.removeItem('current_order_id')
      sessionStorage.removeItem('shipping_address')
      sessionStorage.removeItem('checkout_coupon')
    }

    refetch()

    if (!orderId) {
      setLoading(false)
      return
    }

    api.ordenes.detalle(orderId)
      .then((data) => setOrder(data))
      .catch((err) => console.error('Error fetching order:', err))
      .finally(() => {
        setLoading(false)
        cleanup()
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-16">
      <div className="max-w-xl w-full bg-white border border-borderline rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-3xl font-black text-ink mb-2">Purchase Successful</h1>
        <p className="text-ink2 mb-6">Thank you! Your payment was processed successfully.</p>

        <div className="bg-bg2 rounded-lg p-6 mb-8">
          <p className="text-sm text-ink2 mb-2">Order Number</p>
          <p className="text-3xl font-black text-brand">
            {loading ? '...' : (order?.numero_orden || 'N/A')}
          </p>
          {!loading && order?.total != null && (
            <p className="text-sm text-ink2 mt-2">Total: ${Number(order.total).toLocaleString()}</p>
          )}
        </div>

        <p className="text-sm text-ink2 mb-8">
          A confirmation email has been sent to your email address with tracking information and estimated delivery date.
        </p>

        <div className="flex gap-4">
          <Link href="/" className="flex-1 px-6 py-3 border-2 border-borderline text-ink rounded-lg font-bold uppercase hover:border-brand transition">
            Continue Shopping
          </Link>
          <Link href="/orders" className="flex-1 px-6 py-3 bg-brand text-white rounded-lg font-bold uppercase hover:bg-brand/90 transition">
            View Orders
          </Link>
        </div>
      </div>
    </div>
  )
}
