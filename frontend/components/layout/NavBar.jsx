'use client'
import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronDown, User, ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { getStoredUser } from '@/lib/auth'

const navItems = [
  { label: 'Paramotors', href: '/paramotors' },
  { label: 'Paratrike', href: '/paratrike' },
  {
    label: 'Adventure',
    children: [
      { label: 'W.C Adventure', href: '/adventure' },
      { label: 'W.C Shows', href: '/shows' },
      { label: 'W.C Events', href: '/events' },
    ],
  },
  {
    label: 'More',
    children: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
]

function resolveUserDestination() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  const user = getStoredUser()
  if (!token || !user) return '/login'
  if (user.rol === 'admin') return '/admin/dashboard'
  return '/cuenta'
}

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userHref, setUserHref] = useState('/login')
  const { items } = useCart()
  const itemCount = items.reduce((sum, item) => sum + (item.cantidad || 1), 0)

  const refreshUserHref = useCallback(() => {
    setUserHref(resolveUserDestination())
  }, [])

  useEffect(() => {
    refreshUserHref()
    const onAuthChanged = () => refreshUserHref()
    window.addEventListener('auth-changed', onAuthChanged)
    window.addEventListener('storage', onAuthChanged)
    return () => {
      window.removeEventListener('auth-changed', onAuthChanged)
      window.removeEventListener('storage', onAuthChanged)
    }
  }, [refreshUserHref, pathname])

  const handleUserClick = (e) => {
    e.preventDefault()
    router.push(resolveUserDestination())
  }

  return (
    <nav className="sticky top-0 z-50 bg-bg border-b border-borderline shadow-[0_1px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between h-40 px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="Wing Concept"
            width={700}
            height={200}
            priority
            className="h-40 w-auto"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) =>
            item.children ? (
              <DropdownItem key={item.label} item={item} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="px-3.5 py-2 text-[12.5px] font-semibold uppercase text-ink rounded hover:text-brand hover:bg-brand-soft transition-colors">
                {item.label}
              </Link>
            )
          )}
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-1.5">
          {/* User Profile */}
          <Link
            href={userHref}
            onClick={handleUserClick}
            className="w-9 h-9 rounded text-ink2 hover:text-brand hover:bg-brand-soft flex items-center justify-center transition-colors"
            title="Mi cuenta"
            aria-label="Mi cuenta">
            <User className="w-5 h-5" />
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative w-9 h-9 rounded text-ink2 hover:text-brand hover:bg-brand-soft flex items-center justify-center transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 bg-brand text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-ink2 hover:text-brand transition-colors">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-borderline bg-bg px-4 py-3 flex flex-col gap-1">
          {navItems.map((item) =>
            item.children ? (
              <details key={item.label} className="group">
                <summary className="flex items-center justify-between px-3 py-2.5 text-[13px] font-semibold uppercase text-ink cursor-pointer list-none hover:text-brand hover:bg-brand-soft rounded">
                  {item.label}
                  <ChevronDown className="w-3.5 h-3.5 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="pl-4 flex flex-col gap-0.5 mt-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 text-[12.5px] text-ink2 hover:text-brand hover:bg-brand-soft rounded">
                      {child.label}
                    </Link>
                  ))}
                </div>
              </details>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block w-full text-left px-3 py-2.5 text-[13px] font-semibold uppercase text-ink hover:text-brand hover:bg-brand-soft rounded">
                {item.label}
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  )
}

function DropdownItem({ item }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="relative p-1"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 px-3.5 py-2 text-[12.5px] font-semibold uppercase text-ink rounded hover:text-brand hover:bg-brand-soft transition-colors">
        {item.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full pt-1 left-0 z-50">
          <div className="bg-bg border border-borderline rounded-lg shadow-xl min-w-[180px] overflow-hidden">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-[12.5px] text-ink2 hover:text-brand hover:bg-brand-soft transition-all">
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}