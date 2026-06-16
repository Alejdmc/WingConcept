'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, BarChart3, Package, ShoppingCart, LogOut } from 'lucide-react'

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
    { label: 'Productos', href: '/admin/products', icon: Package },
    { label: 'Pedidos', href: '/admin/orders', icon: ShoppingCart },
  ]

  return (
    <div className="flex h-screen bg-bg">
      {/* Sidebar */}
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
          <button className="flex items-center gap-4 px-4 py-3 w-full rounded hover:bg-white/10 transition text-red-400">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-semibold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-borderline px-8 py-6 flex items-center justify-between sticky top-0 z-40">
          <h2 className="text-2xl font-black text-ink">Panel Administrativo</h2>
          <div className="flex items-center gap-4">
            <span className="text-ink2">Admin User</span>
            <div className="w-10 h-10 rounded-full bg-brand" />
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}