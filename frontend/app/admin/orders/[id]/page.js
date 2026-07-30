'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminOrderDetail({ params }) {
  const { id } = params
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await api.ordenes.detalle(id)
        if (mounted) setOrder(res)
      } catch (err) {
        if (mounted) setError(err.detail || 'Could not load this order.')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])

  return (
    <div>
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-ink2 hover:text-brand mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to orders
      </Link>

      {loading ? (
        <p className="text-ink2">Loading order...</p>
      ) : error ? (
        <div className="p-4 rounded bg-red-100 text-red-700">{error}</div>
      ) : order ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-black text-ink">{order.numero_orden}</h1>
              <p className="text-ink2 mt-1">Placed on {formatDate(order.created_at)}</p>
            </div>
            <span className={`self-start px-4 py-2 rounded-lg text-sm font-bold ${ESTADO_COLORS[order.estado] || 'bg-bg2 text-ink2'}`}>
              {ESTADO_LABELS[order.estado] || order.estado}
            </span>
          </div>

          {(order.numero_guia || order.transportadora) && (
            <div className="bg-white border border-borderline rounded-xl p-6 mb-6">
              <h2 className="font-black text-ink mb-3">Shipping</h2>
              {order.transportadora && (
                <p className="text-sm text-ink2">Carrier: <span className="text-ink font-semibold">{order.transportadora}</span></p>
              )}
              {order.numero_guia && (
                <p className="text-sm text-ink2">Tracking: <span className="text-ink font-semibold">{order.numero_guia}</span></p>
              )}
            </div>
          )}

          <div className="bg-white border border-borderline rounded-xl overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-borderline">
              <h2 className="font-black text-ink">Items</h2>
            </div>
            <div className="divide-y divide-borderline">
              {(order.items || []).map((item) => (
                <div key={item.id} className="p-6 flex gap-4 items-center">
                  <div className="relative w-16 h-16 bg-bg2 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {item.snapshot?.imagen ? (
                      <Image src={item.snapshot.imagen} alt={item.snapshot?.nombre || ''} fill className="object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-ink2/40" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-ink">{item.snapshot?.nombre || 'Product'}</p>
                    {item.snapshot?.variante && <p className="text-sm text-ink2">{item.snapshot.variante}</p>}
                    <p className="text-sm text-ink2">Qty: {item.cantidad}</p>
                  </div>
                  <p className="font-black text-ink">${Number(item.subtotal).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-borderline rounded-xl p-6">
            <h2 className="font-black text-ink mb-4">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink2">Subtotal</span>
                <span className="text-ink font-semibold">${Number(order.subtotal).toLocaleString()}</span>
              </div>
              {order.descuento > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount</span>
                  <span className="font-semibold">-${Number(order.descuento).toLocaleString()}</span>
                </div>
              )}
              {order.costo_envio > 0 && (
                <div className="flex justify-between">
                  <span className="text-ink2">Shipping</span>
                  <span className="text-ink font-semibold">${Number(order.costo_envio).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-ink2">Tax</span>
                <span className="text-ink font-semibold">${Number(order.impuestos).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-black border-t border-borderline pt-3 mt-2">
                <span className="text-ink">Total</span>
                <span className="text-brand">${Number(order.total).toLocaleString()} {order.moneda}</span>
              </div>
            </div>
            {order.notas_cliente && (
              <div className="mt-4 pt-4 border-t border-borderline">
                <p className="text-xs font-bold uppercase text-ink2 mb-1">Customer notes</p>
                <p className="text-sm text-ink">{order.notas_cliente}</p>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
