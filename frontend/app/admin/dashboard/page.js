'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart3, Package, ShoppingCart, TrendingUp, Users, Clock3 } from 'lucide-react'
import { api } from '@/lib/api'

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Paid: 'bg-teal-100 text-teal-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-blue-100 text-blue-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  Refunded: 'bg-purple-100 text-purple-700',
  'Stock Error': 'bg-orange-100 text-orange-700',
}

const SkeletonCard = () => (
  <div className="bg-white border border-borderline rounded-lg p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="h-3 w-16 bg-bg2 rounded" />
        <div className="h-8 w-24 bg-bg2 rounded mt-3" />
      </div>
      <div className="w-14 h-14 bg-bg2 rounded-lg" />
    </div>
  </div>
)

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [recentOrders, setRecentOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await api.admin.stats()
        setStats(data)
      } catch (err) {
        console.error('Error loading admin stats:', err)
        setError('Could not load dashboard statistics.')
      } finally {
        setLoading(false)
      }
    }

    const loadRecentOrders = async () => {
      setLoadingOrders(true)
      try {
        const data = await api.admin.ordenes({ por_pagina: 5 })
        setRecentOrders(data.items || [])
      } catch (err) {
        console.error('Error loading recent orders:', err)
      } finally {
        setLoadingOrders(false)
      }
    }

    loadStats()
    loadRecentOrders()
  }, [])

  const cards = [
    {
      label: 'Revenue',
      value: loading ? '...' : `$${Number(stats?.ingresos_totales || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      label: 'Orders',
      value: loading ? '...' : stats?.total_ordenes || 0,
      sublabel: loading ? '' : `${stats?.ordenes_pendientes || 0} pending`,
      icon: ShoppingCart,
      color: 'bg-purple-500',
    },
    {
      label: 'Products',
      value: loading ? '...' : stats?.total_productos_activos || 0,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      label: 'Users',
      value: loading ? '...' : stats?.total_usuarios || 0,
      icon: Users,
      color: 'bg-pink-500',
    },
    {
      label: 'Kg sold',
      value: loading ? '...' : `${Number(stats?.kg_vendidos || 0).toLocaleString()} Kg`,
      icon: BarChart3,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-ink">Dashboard</h1>
          <p className="text-ink2 mt-2">Admin panel connected to the backend.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          cards.map(({ label, value, sublabel, icon: Icon, color }) => (
            <div key={label} className="bg-white border border-borderline rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ink2 text-sm font-semibold">{label}</p>
                  <p className="text-3xl font-black text-ink mt-2">{value}</p>
                  {sublabel && (
                    <p className="flex items-center gap-1 text-xs text-ink2 mt-1">
                      <Clock3 className="w-3 h-3" />
                      {sublabel}
                    </p>
                  )}
                </div>
                <div className={`${color} p-4 rounded-lg shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white border border-borderline rounded-lg overflow-x-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-borderline">
          <h3 className="text-xl font-black text-ink">Recent orders</h3>
          <Link href="/admin/orders" className="text-sm font-bold text-brand hover:underline">
            View all
          </Link>
        </div>
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-bg2">
            <tr className="border-b border-borderline">
              <th className="text-left py-3 px-6 font-semibold text-ink">Order ID</th>
              <th className="text-left py-3 px-6 font-semibold text-ink">Customer</th>
              <th className="text-left py-3 px-6 font-semibold text-ink">Total</th>
              <th className="text-left py-3 px-6 font-semibold text-ink">Status</th>
              <th className="text-left py-3 px-6 font-semibold text-ink">Date</th>
            </tr>
          </thead>
          <tbody>
            {loadingOrders ? (
              <tr><td colSpan="5" className="py-8 text-center text-ink2">Loading orders...</td></tr>
            ) : recentOrders.length === 0 ? (
              <tr><td colSpan="5" className="py-8 text-center text-ink2">No orders yet.</td></tr>
            ) : (
              recentOrders.map((order) => {
                const status = order.estado_display || order.estado || order.status
                return (
                  <tr key={order.id} className="border-b border-borderline last:border-b-0 hover:bg-bg2 transition">
                    <td className="py-3 px-6 font-bold text-ink">{order.numero_orden || order.id}</td>
                    <td className="py-3 px-6 text-ink2">{order.cliente_nombre || order.client}</td>
                    <td className="py-3 px-6 text-brand font-bold">{order.total_formateado || `$${order.total}`}</td>
                    <td className="py-3 px-6">
                      <span className={`px-3 py-1 rounded text-xs font-bold ${STATUS_COLORS[status] || 'bg-bg2 text-ink2'}`}>
                        {status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-ink2">{order.fecha || order.date}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}