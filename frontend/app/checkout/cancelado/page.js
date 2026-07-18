'use client'
import { useState } from 'react'
import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { api } from '@/lib/api'

export default function CancelledPage() {
  const [retrying, setRetrying] = useState(false)
  const [error, setError] = useState('')
  const orderId = typeof window !== 'undefined' ? sessionStorage.getItem('current_order_id') : null

  const retryPayment = async () => {
    if (!orderId) return
    setRetrying(true)
    setError('')
    try {
      const res = await api.pagos.checkout({ orden_id: orderId })
      if (res?.checkout_url) {
        window.location.href = res.checkout_url
        return
      }
      window.location.href = '/checkout/resultado'
    } catch (err) {
      console.error('Error retrying payment:', err)
      setError(err.detail || 'Could not restart payment. Please try again.')
      setRetrying(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-16">
      <div className="max-w-xl w-full bg-white border border-borderline rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>

        <h1 className="text-3xl font-black text-red-600 mb-2">Payment Cancelled</h1>
        <p className="text-ink2 mb-8">
          Your payment was cancelled and no charge was made.
          {orderId ? ' Your order is saved as pending — you can retry payment below.' : ''}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">{error}</div>
        )}

        <div className="flex gap-4">
          <Link href="/" className="flex-1 px-6 py-3 border-2 border-borderline text-ink rounded-lg font-bold uppercase hover:border-brand transition">
            Home
          </Link>
          {orderId ? (
            <button
              onClick={retryPayment}
              disabled={retrying}
              className="flex-1 px-6 py-3 bg-brand text-white rounded-lg font-bold uppercase hover:bg-brand/90 disabled:opacity-50 transition">
              {retrying ? 'Redirecting...' : 'Retry Payment'}
            </button>
          ) : (
            <Link href="/cart" className="flex-1 px-6 py-3 bg-brand text-white rounded-lg font-bold uppercase hover:bg-brand/90 transition">
              Back to Cart
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
