'use client'
import { useState } from 'react'
import { Eye, Check, Truck } from 'lucide-react'

export default function OrdersPage() {
  const [orders, setOrders] = useState([
    { id: '#001', client: 'Juan Pérez', email: 'juan@email.com', total: '$5,200', status: 'Pending', date: '2025-06-01', items: 3 },
    { id: '#002', client: 'María García', email: 'maria@email.com', total: '$3,500', status: 'Shipped', date: '2025-05-30', items: 2 },
    { id: '#003', client: 'Carlos López', email: 'carlos@email.com', total: '$8,900', status: 'Delivered', date: '2025-05-28', items: 5 },
    { id: '#004', client: 'Ana Martínez', email: 'ana@email.com', total: '$2,100', status: 'Pending', date: '2025-06-02', items: 1 },
  ])
  const [selectedOrder, setSelectedOrder] = useState(null)

  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Shipped': 'bg-blue-100 text-blue-700',
    'Delivered': 'bg-green-100 text-green-700',
  }

  const handleStatusChange = (id, newStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o))
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-ink mb-8">Órdenes</h1>

      <div className="bg-white border border-borderline rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg2">
            <tr className="border-b border-borderline">
              <th className="text-left py-4 px-6 font-semibold text-ink">Order ID</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Cliente</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Items</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Total</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Estado</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Fecha</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-borderline hover:bg-bg2 transition">
                <td className="py-4 px-6 font-bold text-ink">{order.id}</td>
                <td className="py-4 px-6 text-ink2">{order.client}</td>
                <td className="py-4 px-6 text-ink font-semibold">{order.items}</td>
                <td className="py-4 px-6 text-brand font-bold">{order.total}</td>
                <td className="py-4 px-6">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`px-3 py-1 rounded text-xs font-bold border-0 cursor-pointer ${statusColors[order.status]}`}>
                    <option>Pending</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                  </select>
                </td>
                <td className="py-4 px-6 text-ink2">{order.date}</td>
                <td className="py-4 px-6">
                  <button onClick={() => setSelectedOrder(order)} className="p-2 hover:bg-blue-100 rounded transition">
                    <Eye className="w-4 h-4 text-blue-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-black text-ink mb-6">Detalles de {selectedOrder.id}</h2>
            <div className="space-y-3 mb-6">
              <p><span className="font-semibold text-ink">Cliente:</span> {selectedOrder.client}</p>
              <p><span className="font-semibold text-ink">Email:</span> {selectedOrder.email}</p>
              <p><span className="font-semibold text-ink">Items:</span> {selectedOrder.items}</p>
              <p><span className="font-semibold text-ink">Total:</span> <span className="text-brand font-bold">{selectedOrder.total}</span></p>
              <p><span className="font-semibold text-ink">Fecha:</span> {selectedOrder.date}</p>
            </div>
            <button onClick={() => setSelectedOrder(null)} className="w-full bg-brand text-white py-2 rounded font-bold hover:bg-brand/90">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  )
}