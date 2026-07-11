'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, BarChart3, Package, ShoppingCart, LogOut, Compass } from 'lucide-react'
import { isAdminUser, clearAuthSession, getStoredUser } from '@/lib/auth'
import { api } from '@/lib/api'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [ready, setReady] = useState(false)
  const user = getStoredUser()

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
    { label: 'Productos', href: '/admin/products', icon: Package },
    { label: 'Pedidos', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Adventure', href: '/admin/adventure', icon: Compass },
  ]

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token || !isAdminUser()) {
      router.replace('/login')
      return
    }
    setReady(true)
  }, [router])

  const handleLogout = async () => {
    try {
      await api.auth.logout()
    } catch {
      // ignore
    }
    clearAuthSession()
    router.replace('/login')
  }

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg text-ink">
        <p className="text-lg font-semibold">Validando acceso de administrador...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-bg">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-bg3 text-white transition-all duration-300 flex flex-col border-r border-white/10`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h1 className={`font-black text-lg ${!sidebarOpen && 'hidden'}`}>WING ADMIN</h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hover:bg-white/10 p-2 rounded">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-4 px-4 py-3 rounded hover:bg-white/10 transition">
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-semibold">{label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 w-full rounded hover:bg-white/10 transition text-red-400"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-semibold">Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-borderline px-8 py-6 flex items-center justify-between sticky top-0 z-40">
          <h2 className="text-2xl font-black text-ink">Panel Administrativo</h2>
          <div className="flex items-center gap-4">
            <span className="text-ink2">{user?.nombre || 'Admin'}</span>
            <Link
              href="/admin/dashboard"
              className="w-10 h-10 rounded-full bg-brand block hover:ring-2 hover:ring-brand/50 transition"
              title="Dashboard"
            />
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
