'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin, Package } from 'lucide-react'
import { api } from '@/lib/api'
import OrderTimeline, { ORDER_TERMINAL } from '@/components/orders/OrderTimeline'

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
  return new Date(value).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) {
      router.replace(`/login?next=/orders/${id}`)
      return
    }

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await api.ordenes.detalle(id)
        setOrder(data)
      } catch (err) {
        setError(err.detail || 'Could not load this order.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, router])

  const statusLabel = order?.estado_display || order?.estado

  return (
    <div className="min-h-screen bg-bg px-4 sm:px-8 py-12">
      <div className="max-w-5xl mx-auto">
        <Link href="/orders" className="flex items-center gap-2 text-ink hover:text-brand transition mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>

        {loading ? (
          <p className="text-ink2">Loading order...</p>
        ) : error ? (
          <div className="p-4 rounded bg-red-100 text-red-700">{error}</div>
        ) : order ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase text-ink">{order.numero_orden}</h1>
                <p className="text-ink2 mt-1">Placed on {formatDate(order.created_at)}</p>
              </div>
              <span className={`self-start px-4 py-2 rounded-lg text-sm font-bold ${ESTADO_COLORS[order.estado] || 'bg-bg2 text-ink2'}`}>
                {statusLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
              <div className="lg:col-span-3">
                <OrderTimeline order={order} timeline={order.timeline || []} />
              </div>
              <div className="lg:col-span-2 space-y-6">
                {order.direccion_envio && (
                  <div className="bg-white border border-borderline rounded-xl p-6">
                    <h2 className="font-black text-ink mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand" />
                      Shipping address
                    </h2>
                    <p className="font-semibold text-ink">{order.direccion_envio.nombre_destinatario}</p>
                    <p className="text-sm text-ink2 mt-2">
                      {order.direccion_envio.linea1}
                      {order.direccion_envio.linea2 ? `, ${order.direccion_envio.linea2}` : ''}
                    </p>
                    <p className="text-sm text-ink2">
                      {order.direccion_envio.ciudad}, {order.direccion_envio.departamento_estado} {order.direccion_envio.codigo_postal || ''}
                    </p>
                    <p className="text-sm text-ink2">{order.direccion_envio.pais}</p>
                  </div>
                )}

                {(order.numero_guia || order.transportadora) && !ORDER_TERMINAL[order.estado] && (
                  <div className="bg-white border border-borderline rounded-xl p-6">
                    <h2 className="font-black text-ink mb-3">Tracking</h2>
                    {order.transportadora && <p className="text-sm text-ink2">Carrier: <span className="text-ink font-semibold">{order.transportadora}</span></p>}
                    {order.numero_guia && <p className="text-sm text-ink2 mt-1">Number: <span className="text-ink font-semibold">{order.numero_guia}</span></p>}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-borderline rounded-xl overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-borderline">
                <h2 className="font-black text-ink">Items purchased</h2>
              </div>
              <div className="divide-y divide-borderline">
                {(order.items || []).map((item) => (
                  <div key={item.id} className="p-6 flex gap-4 items-center">
                    <div className="relative w-16 h-16 bg-bg2 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {item.snapshot?.imagen ? (
                        <Image src={item.snapshot.imagen} alt={item.snapshot?.nombre || ''} fill className="object-cover" unoptimized={item.snapshot.imagen?.startsWith('http')} />
                      ) : (
                        <Package className="w-6 h-6 text-ink2/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-ink">{item.snapshot?.nombre || 'Product'}</p>
                      {item.snapshot?.variante && <p className="text-sm text-ink2">{item.snapshot.variante}</p>}
                      <p className="text-sm text-ink2">Qty: {item.cantidad} · ${Number(item.precio_unitario).toLocaleString()} each</p>
                    </div>
                    <p className="font-black text-ink">${Number(item.subtotal).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-borderline rounded-xl p-6">
              <h2 className="font-black text-ink mb-4">Payment summary</h2>
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
                  <span className="text-ink">Total paid</span>
                  <span className="text-brand">${Number(order.total).toLocaleString()} {order.moneda}</span>
                </div>
              </div>
              {order.notas_cliente && (
                <div className="mt-4 pt-4 border-t border-borderline">
                  <p className="text-xs font-bold uppercase text-ink2 mb-1">Your notes</p>
                  <p className="text-sm text-ink">{order.notas_cliente}</p>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
