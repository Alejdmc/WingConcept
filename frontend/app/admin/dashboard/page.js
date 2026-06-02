'use client'
import { BarChart3, Package, ShoppingCart, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    { label: 'Ingresos', value: '$45,230', icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Productos', value: '156', icon: Package, color: 'bg-blue-500' },
    { label: 'Pedidos', value: '23', icon: ShoppingCart, color: 'bg-purple-500' },
    { label: 'Vendido', value: '450 Kg', icon: BarChart3, color: 'bg-orange-500' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-black text-ink mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-borderline rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-ink2 text-sm font-semibold">{label}</p>
                <p className="text-3xl font-black text-ink mt-2">{value}</p>
              </div>
              <div className={`${color} p-4 rounded-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-borderline rounded-lg p-6">
        <h3 className="text-xl font-black text-ink mb-6">Pedidos Recientes</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-borderline">
              <th className="text-left py-3 font-semibold text-ink2">Order ID</th>
              <th className="text-left py-3 font-semibold text-ink2">Cliente</th>
              <th className="text-left py-3 font-semibold text-ink2">Total</th>
              <th className="text-left py-3 font-semibold text-ink2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: '#001', client: 'Juan Pérez', total: '$5,200', status: 'Pending' },
              { id: '#002', client: 'María García', total: '$3,500', status: 'Shipped' },
              { id: '#003', client: 'Carlos López', total: '$8,900', status: 'Delivered' },
            ].map(({ id, client, total, status }) => (
              <tr key={id} className="border-b border-borderline hover:bg-bg2 transition">
                <td className="py-4 font-semibold text-ink">{id}</td>
                <td className="py-4 text-ink2">{client}</td>
                <td className="py-4 font-bold text-brand">{total}</td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded text-xs font-bold ${
                    status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}