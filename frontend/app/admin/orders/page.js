'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import { api } from '@/lib/api'

const STATUS_OPTIONS = ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded', 'Stock Error']

const ESTADO_TO_DISPLAY = {
  pendiente: 'Pending',
  pagado: 'Paid',
  procesando: 'Processing',
  enviado: 'Shipped',
  entregado: 'Delivered',
  cancelado: 'Cancelled',
  reembolsado: 'Refunded',
  error_stock: 'Stock Error',
}

function orderStatusValue(order) {
  return order?.estado_display || ESTADO_TO_DISPLAY[order?.estado] || order?.status || 'Pending'
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await api.admin.ordenes({ por_pagina: 50 })
        setOrders(data.items || [])
      } catch (err) {
        setError(err?.detail || err?.message || 'Could not load orders.')
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Paid: 'bg-teal-100 text-teal-700',
    Processing: 'bg-blue-100 text-blue-700',
    Shipped: 'bg-blue-100 text-blue-700',
    Delivered: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
    Refunded: 'bg-purple-100 text-purple-700',
    'Stock Error': 'bg-orange-100 text-orange-700',
  }

  const handleStatusChange = async (orderId, newStatus) => {
    setError('')
    try {
      const updated = await api.admin.actualizarOrden(orderId, { estado: newStatus })
      setOrders(orders.map((order) => (
        order.id === updated.id
          ? { ...order, estado: updated.estado, estado_display: updated.estado_display }
          : order
      )))
    } catch {
      setError('Could not update order status.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-ink">Orders</h1>
          <p className="text-ink2 mt-2">Manage order status, tracking and timeline updates.</p>
        </div>
      </div>

      {error && <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>}

      <div className="bg-white border border-borderline rounded-lg overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-bg2">
            <tr className="border-b border-borderline">
              <th className="text-left py-4 px-6 font-semibold text-ink">Order ID</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Customer</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Items</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Total</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Status</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Date</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="py-8 text-center text-ink2">Loading orders...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="7" className="py-8 text-center text-ink2">No orders found.</td></tr>
            ) : (
              orders.map((order) => {
                const statusValue = orderStatusValue(order)
                return (
                <tr key={order.id || order.numero_orden} className="border-b border-borderline hover:bg-bg2 transition">
                  <td className="py-4 px-6 font-bold text-ink">{order.numero_orden || order.id}</td>
                  <td className="py-4 px-6 text-ink2">{order.cliente_nombre || order.client}</td>
                  <td className="py-4 px-6 text-ink font-semibold">{order.cantidad_items ?? order.items ?? 0}</td>
                  <td className="py-4 px-6 text-brand font-bold">{order.total_formateado || `$${Number(order.total || 0).toLocaleString()}`}</td>
                  <td className="py-4 px-6">
                    <select
                      value={statusValue}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`px-3 py-1 rounded text-xs font-bold border-0 cursor-pointer ${statusColors[statusValue] || 'bg-bg2 text-ink2'}`}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 px-6 text-ink2">{order.fecha || order.date}</td>
                  <td className="py-4 px-6">
                    {order.id ? (
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex p-2 hover:bg-blue-100 rounded transition"
                        title="Manage order & timeline"
                      >
                        <Eye className="w-4 h-4 text-blue-500" />
                      </Link>
                    ) : (
                      <span className="text-xs text-ink2">—</span>
                    )}
                  </td>
                </tr>
              )})
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
