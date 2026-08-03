'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { clearAuthSession, ensureValidSession, getStoredUser, isAdminUser, persistAuthSession } from '@/lib/auth'

const ORDER_STATUS_COLORS = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  pagado: 'bg-teal-100 text-teal-700',
  procesando: 'bg-blue-100 text-blue-700',
  enviado: 'bg-blue-100 text-blue-700',
  entregado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
  reembolsado: 'bg-purple-100 text-purple-700',
  error_stock: 'bg-orange-100 text-orange-700',
}

export default function CuentaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [cupones, setCupones] = useState([])
  const [recentOrders, setRecentOrders] = useState([])

  const [profile, setProfile] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    password_actual: '',
    nueva_password: '',
    confirmar: '',
  })

  useEffect(() => {
    const init = async () => {
      const ok = await ensureValidSession()
      if (!ok) {
        router.replace('/login?next=/cuenta')
        return
      }
      if (isAdminUser()) {
        router.replace('/admin/settings')
        return
      }

      try {
        const [data, misCupones, ordersData] = await Promise.all([
          api.usuarios.perfil(),
          api.usuarios.cupones().catch(() => []),
          api.ordenes.listar({ pagina: 1, por_pagina: 3 }).catch(() => ({ items: [] })),
        ])
        setProfile({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          email: data.email || '',
          telefono: data.telefono || '',
        })
        setCupones(misCupones || [])
        setRecentOrders(ordersData.items || [])
      } catch {
        setError('Could not load your profile.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setError('')
    setMessage('')
    try {
      const updated = await api.usuarios.actualizarPerfil({
        nombre: profile.nombre,
        apellido: profile.apellido,
        telefono: profile.telefono || null,
      })
      persistAuthSession({
        access_token: localStorage.getItem('access_token'),
        refresh_token: localStorage.getItem('refresh_token'),
        nombre: updated.nombre,
        rol: updated.rol,
        expires_in: 60 * 60 * 24 * 7,
      })
      setMessage('Profile updated successfully.')
    } catch (err) {
      setError(err.detail || 'Error saving profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (passwordForm.nueva_password !== passwordForm.confirmar) {
      setError('New passwords do not match.')
      return
    }
    if (passwordForm.nueva_password.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }

    setSavingPassword(true)
    try {
      await api.usuarios.cambiarPassword({
        password_actual: passwordForm.password_actual,
        nueva_password: passwordForm.nueva_password,
      })
      setPasswordForm({ password_actual: '', nueva_password: '', confirmar: '' })
      setMessage('Password updated successfully.')
    } catch (err) {
      setError(err.detail || 'Error changing password.')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleLogout = () => {
    clearAuthSession()
    router.replace('/login')
  }

  const formatDescuento = (cupon) =>
    cupon.tipo === 'porcentaje' ? `${cupon.valor}%` : `$${Number(cupon.valor).toLocaleString()}`

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-ink2">Loading account...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-black text-ink mb-2">My Account</h1>
      <p className="text-ink2 mb-8">Manage your personal information and security.</p>

      {message && <div className="mb-6 p-4 rounded bg-green-100 text-green-700">{message}</div>}
      {error && <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>}

      <form onSubmit={saveProfile} className="bg-white border border-borderline rounded-lg p-6 space-y-4 mb-8">
        <h2 className="font-black text-lg text-ink">Personal information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">First name</label>
            <input name="nombre" value={profile.nombre} onChange={handleProfileChange} required className="w-full p-3 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Last name</label>
            <input name="apellido" value={profile.apellido} onChange={handleProfileChange} required className="w-full p-3 border rounded" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input value={profile.email} disabled className="w-full p-3 border rounded bg-bg2 text-ink2" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Phone</label>
          <input name="telefono" value={profile.telefono} onChange={handleProfileChange} className="w-full p-3 border rounded" />
        </div>

        <button disabled={savingProfile} className="px-6 py-3 bg-brand text-white rounded font-bold hover:bg-brand/90 disabled:opacity-50">
          {savingProfile ? 'Saving...' : 'Save profile'}
        </button>
      </form>

      <form onSubmit={savePassword} className="bg-white border border-borderline rounded-lg p-6 space-y-4 mb-8">
        <h2 className="font-black text-lg text-ink">Change password</h2>

        <div>
          <label className="block text-sm font-semibold mb-1">Current password</label>
          <input type="password" name="password_actual" value={passwordForm.password_actual} onChange={handlePasswordChange} required className="w-full p-3 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">New password</label>
          <input type="password" name="nueva_password" value={passwordForm.nueva_password} onChange={handlePasswordChange} required minLength={8} className="w-full p-3 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Confirm new password</label>
          <input type="password" name="confirmar" value={passwordForm.confirmar} onChange={handlePasswordChange} required minLength={8} className="w-full p-3 border rounded" />
        </div>

        <button disabled={savingPassword} className="px-6 py-3 bg-brand text-white rounded font-bold hover:bg-brand/90 disabled:opacity-50">
          {savingPassword ? 'Updating...' : 'Change password'}
        </button>
      </form>

      {cupones.length > 0 && (
        <div className="bg-white border border-borderline rounded-lg p-6 space-y-4 mb-8">
          <h2 className="font-black text-lg text-ink">My coupons</h2>
          <div className="space-y-3">
            {cupones.map((cupon) => (
              <div key={cupon.id} className="border border-borderline rounded p-4 flex justify-between items-center">
                <div>
                  <p className="font-black tracking-wider">{cupon.codigo}</p>
                  <p className="text-sm text-ink2">{formatDescuento(cupon)} off</p>
                  {cupon.descripcion && <p className="text-xs text-ink2 mt-1">{cupon.descripcion}</p>}
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${cupon.usado ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                  {cupon.usado ? 'Used' : 'Available'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentOrders.length > 0 && (
        <div className="bg-white border border-borderline rounded-lg p-6 space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-lg text-ink">Recent orders</h2>
            <Link href="/orders" className="text-sm font-bold text-brand hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-borderline">
            {recentOrders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between gap-4 py-4 hover:bg-bg2 -mx-2 px-2 rounded transition">
                <div>
                  <p className="font-bold text-ink">{order.numero_orden}</p>
                  <p className="text-sm text-ink2 mt-0.5">${Number(order.total).toLocaleString()} · {order.items?.length || 0} items</p>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-bold shrink-0 ${ORDER_STATUS_COLORS[order.estado] || 'bg-bg2 text-ink2'}`}>
                  {order.estado_display || order.estado}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <Link href="/orders" className="px-6 py-3 bg-brand text-white rounded font-bold hover:bg-brand/90">
          My orders
        </Link>
        <Link href="/cart" className="px-6 py-3 border border-borderline rounded font-bold text-ink hover:border-brand">
          View cart
        </Link>
        <button onClick={handleLogout} className="px-6 py-3 border border-borderline rounded font-bold text-ink hover:border-brand">
          Log out
        </button>
      </div>
    </div>
  )
}
