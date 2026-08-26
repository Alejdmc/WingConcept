'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, LogOut, User } from 'lucide-react'
import { clearAuthSession } from '@/lib/auth'
import { api } from '@/lib/api'
import { ADMIN_NAV, isNavActive } from '@/lib/adminNav'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState(null)
  const [lowStockCount, setLowStockCount] = useState(0)

  useEffect(() => {
    const verify = async () => {
      try {
        const me = await api.auth.me()
        if (me.rol !== 'admin') {
          router.replace('/')
          return
        }
        setUser(me)
        setReady(true)
        try {
          const stats = await api.admin.stats()
          setLowStockCount(stats?.stock_bajo_total || 0)
        } catch {
          setLowStockCount(0)
        }
      } catch {
        const next = pathname?.startsWith('/admin') ? pathname : '/admin/dashboard'
        router.replace(`/login?next=${encodeURIComponent(next)}`)
      }
    }
    verify()
  }, [router, pathname])

  const handleLogout = async () => {
    try {
      await api.auth.logout()
    } catch {
      // ignore
    }
    clearAuthSession()
    router.replace('/')
  }

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg text-ink">
        <p className="text-lg font-semibold">Validating admin access...</p>
      </div>
    )
  }

  const renderNavLink = ({ label, href, icon: Icon, hint }) => {
    const active = isNavActive(pathname, href)
    return (
      <Link
        key={href}
        href={href}
        onClick={() => setMobileSidebarOpen(false)}
        title={hint || label}
        className={`flex items-center gap-3 px-3 py-2.5 rounded transition relative text-sm ${
          active ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
        }`}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className={`font-semibold leading-tight ${!sidebarOpen && 'md:hidden'}`}>{label}</span>
        {href === '/admin/parts' && lowStockCount > 0 && (
          <span className={`ml-auto px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs font-bold ${!sidebarOpen && 'md:absolute md:top-1 md:right-1 md:ml-0'}`}>
            {lowStockCount}
          </span>
        )}
      </Link>
    )
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 md:relative md:z-auto md:translate-x-0 overflow-y-auto
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${sidebarOpen ? 'md:w-72' : 'md:w-20'}
          bg-bg3 text-white flex flex-col border-r border-white/10`}
      >
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className={!sidebarOpen ? 'md:hidden' : ''}>
            <h1 className="font-black text-lg">WING ADMIN</h1>
            <p className="text-xs text-white/50 mt-0.5">Content & store</p>
          </div>
          <button onClick={() => setMobileSidebarOpen(false)} className="hover:bg-white/10 p-2 rounded md:hidden">
            <X className="w-5 h-5" />
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden md:block hover:bg-white/10 p-2 rounded">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-4">
          {ADMIN_NAV.map((entry) => {
            if (entry.type === 'link') {
              return renderNavLink(entry)
            }
            return (
              <div key={entry.label}>
                <p className={`px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40 ${!sidebarOpen && 'md:hidden'}`}>
                  {entry.label}
                </p>
                <div className="space-y-0.5">
                  {entry.items.map((item) => renderNavLink(item))}
                </div>
              </div>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded hover:bg-white/10 transition text-red-400 text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className={`font-semibold ${!sidebarOpen && 'md:hidden'}`}>Log out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-borderline px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between sticky top-0 z-30 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded hover:bg-bg2 text-ink shrink-0"
              aria-label="Open menu"
            >
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

        <div className="p-4 sm:p-8">{children}</div>
      </main>
    </div>
  )
}
