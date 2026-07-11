'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { clearAuthSession, getStoredUser, isAdminUser } from '@/lib/auth'

export default function CuentaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) {
      router.replace('/login?next=/cuenta')
      return
    }
    if (isAdminUser()) {
      router.replace('/admin/settings')
      return
    }

    const load = async () => {
      try {
        const data = await api.usuarios.perfil()
        setProfile(data)
      } catch {
        setError('No se pudo cargar tu perfil.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const handleLogout = () => {
    clearAuthSession()
    router.replace('/login')
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-ink2">Cargando cuenta...</p>
      </div>
    )
  }

  const stored = getStoredUser()

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-black text-ink mb-2">Mi cuenta</h1>
      <p className="text-ink2 mb-8">Información de tu perfil en Wing Concept.</p>

      {error && <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>}

      <div className="bg-white border border-borderline rounded-lg p-6 space-y-4">
        <div>
          <p className="text-sm font-semibold text-ink2">Nombre</p>
          <p className="text-lg font-bold text-ink">
            {profile?.nombre || stored?.nombre || '—'} {profile?.apellido || ''}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink2">Email</p>
          <p className="text-ink">{profile?.email || '—'}</p>
        </div>
        {profile?.telefono && (
          <div>
            <p className="text-sm font-semibold text-ink2">Teléfono</p>
            <p className="text-ink">{profile.telefono}</p>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-8">
        <Link href="/cart" className="px-6 py-3 bg-brand text-white rounded font-bold hover:bg-brand/90">
          Ver carrito
        </Link>
        <button onClick={handleLogout} className="px-6 py-3 border border-borderline rounded font-bold text-ink hover:border-brand">
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
