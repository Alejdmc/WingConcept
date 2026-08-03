'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Package, Save } from 'lucide-react'
import { api } from '@/lib/api'
import OrderTimeline from '@/components/orders/OrderTimeline'

const STATUS_OPTIONS = [
  { value: 'Pending', estado: 'pendiente' },
  { value: 'Paid', estado: 'pagado' },
  { value: 'Processing', estado: 'procesando' },
  { value: 'Shipped', estado: 'enviado' },
  { value: 'Delivered', estado: 'entregado' },
  { value: 'Cancelled', estado: 'cancelado' },
  { value: 'Refunded', estado: 'reembolsado' },
  { value: 'Stock Error', estado: 'error_stock' },
]

const ESTADO_TO_DISPLAY = Object.fromEntries(STATUS_OPTIONS.map((o) => [o.estado, o.value]))

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminOrderDetail({ params }) {
  const { id } = params
  const [order, setOrder] = useState(null)
  const [form, setForm] = useState({
    estado: 'Pending',
    numero_guia: '',
    transportadora: '',
    notas_admin: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.ordenes.detalle(id)
      setOrder(data)
      setForm({
        estado: data.estado_display || ESTADO_TO_DISPLAY[data.estado] || 'Pending',
        numero_guia: data.numero_guia || '',
        transportadora: data.transportadora || '',
        notas_admin: data.notas_admin || '',
      })
    } catch (err) {
      setError(err.detail || 'Could not load this order.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await api.admin.actualizarOrden(id, {
        estado: form.estado,
        numero_guia: form.numero_guia || null,
        transportadora: form.transportadora || null,
        notas_admin: form.notas_admin || null,
      })
      setMessage('Order updated. The customer will see the new status on their timeline.')
      await load()
    } catch (err) {
      setError(err.detail || 'Could not update order.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-ink2 hover:text-brand mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to orders
      </Link>

      {loading ? (
        <p className="text-ink2">Loading order...</p>
      ) : error && !order ? (
        <div className="p-4 rounded bg-red-100 text-red-700">{error}</div>
      ) : order ? (
        <>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-black text-ink">{order.numero_orden}</h1>
              <p className="text-ink2 mt-1">
                {order.cliente_nombre || 'Customer'} · {order.cliente_email || ''}
              </p>
              <p className="text-sm text-ink2 mt-1">Placed {formatDate(order.created_at)}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-brand">${Number(order.total).toLocaleString()}</p>
              <p className="text-sm text-ink2">{order.items?.length || 0} items</p>
            </div>
          </div>

          {message && <div className="mb-6 p-4 rounded bg-green-100 text-green-700">{message}</div>}
          {error && <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <div className="xl:col-span-2">
              <OrderTimeline order={order} timeline={order.timeline || []} />
            </div>

            <form onSubmit={handleSave} className="bg-white border border-borderline rounded-xl p-6 space-y-4 h-fit">
              <h2 className="font-black text-ink">Update order status</h2>
              <p className="text-sm text-ink2">Changes appear instantly on the customer&apos;s order timeline.</p>

              <div>
                <label className="block text-sm font-semibold mb-1">Status</label>
                <select name="estado" value={form.estado} onChange={handleChange} className="w-full p-3 border rounded">
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.value}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Carrier</label>
                <input name="transportadora" value={form.transportadora} onChange={handleChange} placeholder="UPS, FedEx, DHL…" className="w-full p-3 border rounded" />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Tracking number</label>
                <input name="numero_guia" value={form.numero_guia} onChange={handleChange} placeholder="1Z999AA10123456784" className="w-full p-3 border rounded" />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Internal notes</label>
                <textarea name="notas_admin" value={form.notas_admin} onChange={handleChange} rows={3} className="w-full p-3 border rounded" placeholder="Visible only to admins" />
              </div>

              <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 py-3 bg-brand text-white rounded font-bold hover:bg-brand/90 disabled:opacity-50">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save & notify timeline'}
              </button>
            </form>
          </div>

          <div className="bg-white border border-borderline rounded-xl overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-borderline">
              <h2 className="font-black text-ink">Order items</h2>
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
                    <p className="text-sm text-ink2">Qty: {item.cantidad}</p>
                  </div>
                  <p className="font-black text-ink">${Number(item.subtotal).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-borderline rounded-xl p-6">
            <h2 className="font-black text-ink mb-4">Event log</h2>
            <div className="space-y-3">
              {(order.timeline || []).map((event) => (
                <div key={event.id} className="flex justify-between gap-4 text-sm border-b border-borderline pb-3 last:border-0">
                  <div>
                    <p className="font-semibold text-ink">{event.titulo}</p>
                    {event.mensaje && <p className="text-ink2 mt-0.5">{event.mensaje}</p>}
                    <p className="text-xs text-ink2 mt-1 capitalize">by {event.actor}</p>
                  </div>
                  <p className="text-ink2 shrink-0">{formatDate(event.created_at)}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
