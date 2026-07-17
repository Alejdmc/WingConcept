'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, BarChart3, Package, ShoppingCart, LogOut, Compass, Settings, User, Tag } from 'lucide-react'
import { clearAuthSession, getStoredUser } from '@/lib/auth'
import { api } from '@/lib/api'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const user = getStoredUser()

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Content', href: '/admin/contenido', icon: Compass },
    { label: 'Discounts', href: '/admin/descuentos', icon: Tag },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) {
      router.replace('/login')
      return
    }

    api.auth.me()
      .then((user) => {
        if (user?.rol !== 'admin') {
          router.replace('/')
          return
        }
        setReady(true)
      })
      .catch(() => router.replace('/login'))
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
        <p className="text-lg font-semibold">Validating admin access...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Mobile overlay backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 md:relative md:z-auto md:translate-x-0
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${sidebarOpen ? 'md:w-64' : 'md:w-20'}
          bg-bg3 text-white flex flex-col border-r border-white/10`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h1 className={`font-black text-lg ${!sidebarOpen && 'md:hidden'}`}>WING ADMIN</h1>
          <button onClick={() => setMobileSidebarOpen(false)} className="hover:bg-white/10 p-2 rounded md:hidden">
            <X className="w-5 h-5" />
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden md:block hover:bg-white/10 p-2 rounded">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileSidebarOpen(false)}
              className="flex items-center gap-4 px-4 py-3 rounded hover:bg-white/10 transition">
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className={`text-sm font-semibold ${!sidebarOpen && 'md:hidden'}`}>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 w-full rounded hover:bg-white/10 transition text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <span className={`text-sm font-semibold ${!sidebarOpen && 'md:hidden'}`}>Log out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-borderline px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between sticky top-0 z-30 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded hover:bg-bg2 text-ink shrink-0"
              aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg sm:text-2xl font-black text-ink truncate">Admin Panel</h2>
          </div>
          <Link
            href="/admin/settings"
            className="flex items-center gap-2 sm:gap-4 rounded-lg px-2 py-1 hover:bg-bg2 transition shrink-0"
            title="Account settings"
          >
            <span className="hidden sm:inline text-ink2">{user?.nombre || 'Admin'}</span>
            <span className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center hover:ring-2 hover:ring-brand/50 transition">
              <User className="w-5 h-5" />
            </span>
          </Link>
        </header>

        <div className="p-4 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
