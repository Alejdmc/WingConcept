'use client'
import { useState, useEffect } from 'react'
import { BarChart3, Package, ShoppingCart, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'

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

    loadStats()
  }, [])

  const cards = [
    {
      label: 'Revenue',
      value: loading ? '...' : `$${Number(stats?.ingresos_totales || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      label: 'Products',
      value: loading ? '...' : stats?.total_productos_activos || 0,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      label: 'Orders',
      value: loading ? '...' : stats?.total_ordenes || 0,
      icon: ShoppingCart,
      color: 'bg-purple-500',
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          cards.map(({ label, value, icon: Icon, color }) => (
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
          ))
        )}
      </div>

      <div className="bg-white border border-borderline rounded-lg p-6">
        <h3 className="text-xl font-black text-ink mb-6">Recent orders</h3>
        <p className="text-ink2 text-sm">Use the Orders section to view updated data and manage orders.</p>
      </div>
    </div>
  )
}