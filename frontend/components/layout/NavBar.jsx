'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, User, ShoppingCart, Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Paramotors', href: '/paramotors' },
  { label: 'Paratrike',  href: '/paratrike' },
  {
    label: 'Adventure',
    children: [
      { label: 'W.C Adventure', href: '/adventure' },
      { label: 'W.C Shows',    href: '/shows' },
      { label: 'W.C Events',   href: '/events' },
    ],
  },
  {
    label: 'Support',
    children: [
      { label: 'Find Dealer',   href: '/dealers' },
      { label: 'User Manuals',  href: '/manuals' },
      { label: 'Find Schools',  href: '/schools' },
    ],
  },
  {
    label: 'More',
    children: [
      { label: 'About Us',      href: '/about' },
      { label: 'W.C Milestones', href: '/milestones' },
      { label: 'Contact Us',    href: '/contact' },
    ],
  },
]

function DropdownItem({ item }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!item.children) {
    return (
      <Link href={item.href}
        className="px-3.5 py-2 text-[12.5px] font-semibold tracking-[0.08em] uppercase text-ink rounded
                   hover:text-brand hover:bg-brand-soft transition-colors">
        {item.label}
      </Link>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-3.5 py-2 text-[12.5px] font-semibold tracking-[0.08em]
                   uppercase text-ink rounded hover:text-brand hover:bg-brand-soft transition-colors">
        {item.label}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 bg-bg border border-borderline rounded-lg
                        min-w-[180px] shadow-[0_8px_32px_rgba(0,0,0,0.10)] overflow-hidden z-50">
          {item.children.map((child) => (
            <Link key={child.href} href={child.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-[12.5px] font-medium text-ink2 border-b border-borderline
                         last:border-0 hover:text-brand hover:bg-brand-soft hover:pl-5 transition-all">
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-bg border-b border-borderline shadow-[0_1px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between h-16 px-8">
        {/* Logo */}
        <Link href="/"
          className="font-['Barlow_Condensed'] font-black italic text-[22px] tracking-[0.04em] uppercase text-ink">
          WING<span className="text-brand">&nbsp;CONCEPT</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <DropdownItem key={item.label} item={item} />
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <button className="flex items-center justify-center w-9 h-9 rounded text-ink2
                             hover:text-brand hover:bg-brand-soft transition-colors">
            <User className="w-5 h-5" strokeWidth={1.75} />
          </button>
          <button className="relative flex items-center justify-center w-9 h-9 rounded text-ink2
                             hover:text-brand hover:bg-brand-soft transition-colors">
            <ShoppingCart className="w-5 h-5" strokeWidth={1.75} />
            <span className="absolute top-1 right-1 bg-brand text-white text-[9px] font-bold
                             w-3.5 h-3.5 rounded-full flex items-center justify-center">0</span>
          </button>
          <button onClick={() => setMobileOpen(o => !o)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded text-ink2
                       hover:text-brand hover:bg-brand-soft transition-colors">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-borderline bg-bg px-4 py-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <details key={item.label} className="group">
                <summary className="flex items-center justify-between px-3 py-2.5 text-[13px] font-semibold
                                    uppercase tracking-widest text-ink cursor-pointer list-none
                                    hover:text-brand hover:bg-brand-soft rounded transition-colors">
                  {item.label}
                  <ChevronDown className="w-3.5 h-3.5 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="pl-4 flex flex-col gap-0.5 mt-1">
                  {item.children.map((child) => (
                    <Link key={child.href} href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 text-[12.5px] text-ink2 hover:text-brand
                                 hover:bg-brand-soft rounded transition-colors">
                      {child.label}
                    </Link>
                  ))}
                </div>
              </details>
            ) : (
              <Link key={item.label} href={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-[13px] font-semibold uppercase tracking-widest text-ink
                           hover:text-brand hover:bg-brand-soft rounded transition-colors">
                {item.label}
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  )
}