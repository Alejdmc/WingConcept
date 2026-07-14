'use client'
import { useState, useEffect } from 'react'
import { Eye } from 'lucide-react'
import { api } from '@/lib/api'

const STATUS_OPTIONS = ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded', 'Stock Error']

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
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
        console.error('Error loading admin orders:', err)
        setError('Could not load orders.')
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
      setOrders(orders.map((order) => (order.id === updated.id ? { ...order, estado: updated.estado, estado_display: updated.estado_display } : order)))
    } catch (err) {
      console.error('Error updating order status:', err)
      setError('Could not update order status.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-ink">Orders</h1>
          <p className="text-ink2 mt-2">Manage orders directly from the backend.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>
      )}

      <div className="bg-white border border-borderline rounded-lg overflow-hidden">
        <table className="w-full text-sm">
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
              <tr>
                <td colSpan="7" className="py-8 text-center text-ink2">Loading orders...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-ink2">No orders found.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-borderline hover:bg-bg2 transition">
                  <td className="py-4 px-6 font-bold text-ink">{order.numero_orden || order.id}</td>
                  <td className="py-4 px-6 text-ink2">{order.cliente_nombre || order.client}</td>
                  <td className="py-4 px-6 text-ink font-semibold">{order.cantidad_items || order.items}</td>
                  <td className="py-4 px-6 text-brand font-bold">{order.total_formateado || `$${order.total}`}</td>
                  <td className="py-4 px-6">
                    <select
                      value={order.estado_display || order.estado || order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`px-3 py-1 rounded text-xs font-bold border-0 cursor-pointer ${statusColors[order.estado_display || order.estado || order.status]}`}>
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 px-6 text-ink2">{order.fecha || order.date}</td>
                  <td className="py-4 px-6">
                    <button onClick={() => setSelectedOrder(order)} className="p-2 hover:bg-blue-100 rounded transition">
                      <Eye className="w-4 h-4 text-blue-500" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-black text-ink mb-6">Details for {selectedOrder.numero_orden || selectedOrder.id}</h2>
            <div className="space-y-3 mb-6">
              <p><span className="font-semibold text-ink">Customer:</span> {selectedOrder.cliente_nombre || selectedOrder.client}</p>
              <p><span className="font-semibold text-ink">Email:</span> {selectedOrder.cliente_email || selectedOrder.email}</p>
              <p><span className="font-semibold text-ink">Items:</span> {selectedOrder.cantidad_items || selectedOrder.items}</p>
              <p><span className="font-semibold text-ink">Total:</span> <span className="text-brand font-bold">{selectedOrder.total_formateado || `$${selectedOrder.total}`}</span></p>
              <p><span className="font-semibold text-ink">Date:</span> {selectedOrder.fecha || selectedOrder.date}</p>
              <p><span className="font-semibold text-ink">Status:</span> {selectedOrder.estado_display || selectedOrder.estado || selectedOrder.status}</p>
            </div>
            <button onClick={() => setSelectedOrder(null)} className="w-full bg-brand text-white py-2 rounded font-bold hover:bg-brand/90">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}