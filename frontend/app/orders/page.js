'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'
import { api } from '@/lib/api'

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

const ESTADO_COLORS = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  pagado: 'bg-teal-100 text-teal-700',
  procesando: 'bg-blue-100 text-blue-700',
  enviado: 'bg-blue-100 text-blue-700',
  entregado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
  reembolsado: 'bg-purple-100 text-purple-700',
  error_stock: 'bg-orange-100 text-orange-700',
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagina, setPagina] = useState(1)
  const [paginas, setPaginas] = useState(0)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) {
      router.replace('/login?next=/orders')
      return
    }

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await api.ordenes.listar({ pagina, por_pagina: 10 })
        setOrders(data.items || [])
        setPaginas(data.paginas || 0)
      } catch (err) {
        console.error('Error loading orders:', err)
        setError('Could not load your orders.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router, pagina])

  return (
    <div className="min-h-screen bg-bg px-4 sm:px-8 py-12">
      <div className="max-w-5xl mx-auto">
        <Link href="/cuenta" className="flex items-center gap-2 text-ink hover:text-brand transition mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Account
        </Link>

        <h1 className="text-3xl sm:text-4xl font-black uppercase text-ink mb-2">My Orders</h1>
        <p className="text-ink2 mb-8">Track and review your past purchases.</p>

        {error && <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>}

        {loading ? (
          <p className="text-ink2">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-borderline rounded-xl p-12 text-center">
            <Package className="w-10 h-10 text-ink2/40 mx-auto mb-4" />
            <p className="text-ink2 mb-6">You haven&apos;t placed any orders yet.</p>
            <Link href="/" className="inline-block bg-brand text-white px-8 py-3 font-bold uppercase rounded-lg hover:bg-brand/90 transition">
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white border border-borderline rounded-xl overflow-hidden divide-y divide-borderline">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 p-6 hover:bg-bg2 transition"
                >
                  <div>
                    <p className="font-black text-ink">{order.numero_orden}</p>
                    <p className="text-sm text-ink2 mt-1">{formatDate(order.created_at)} · {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`px-3 py-1 rounded text-xs font-bold ${ESTADO_COLORS[order.estado] || 'bg-bg2 text-ink2'}`}>
                      {ESTADO_LABELS[order.estado] || order.estado}
                    </span>
                    <span className="font-black text-brand text-lg">${Number(order.total).toLocaleString()}</span>
                  </div>
                </Link>
              ))}
            </div>

            {paginas > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina <= 1}
                  className="px-4 py-2 border border-borderline rounded-lg font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand transition"
                >
                  Previous
                </button>
                <span className="text-sm font-semibold text-ink">Page {pagina} / {paginas}</span>
                <button
                  onClick={() => setPagina((p) => Math.min(paginas, p + 1))}
                  disabled={pagina >= paginas}
                  className="px-4 py-2 border border-borderline rounded-lg font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
