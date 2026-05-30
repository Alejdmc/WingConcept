'use client'
import Image from 'next/image'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { ChevronDown, User, ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

const NAV_ITEMS = [
  { label: 'Paramotors', href: '/#paramotors-section' },
  { label: 'Paratrike',  href: '/paratrike' },
  { label: 'Adventure', children: [{ label: 'W.C Adventure', href: '/adventure' }, { label: 'W.C Shows', href: '/shows' }, { label: 'W.C Events', href: '/events' }] },
  { label: 'Support', children: [{ label: 'Find Dealer', href: '/dealers' }, { label: 'User Manuals', href: '/manuals' }, { label: 'Find Schools', href: '/schools' }] },
  { label: 'More', children: [{ label: 'About Us', href: '/about' }, { label: 'W.C Milestones', href: '/milestones' }, { label: 'Contact Us', href: '/contact' }] },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { items } = useCart()

  const handleScroll = (e, href) => {
    if (!href.startsWith('/#')) return
    e.preventDefault()
    const id = href.replace('/#', '')
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="sticky top-0 z-50 bg-bg border-b border-borderline shadow-[0_1px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between h-32 px-8">
        <Link href="/" className="flex items-center">
          <Image src="/images/logo.png" alt="Wing Concept" width={500} height={140} priority className="h-32 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <DropdownItem key={item.label} item={item} handleScroll={handleScroll} />
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <Link href="/login" className="w-9 h-9 rounded text-ink2 hover:text-brand hover:bg-brand-soft flex items-center justify-center">
            <User className="w-5 h-5" />
          </Link>
          <Link href="/cart" className="relative w-9 h-9 rounded text-ink2 hover:text-brand hover:bg-brand-soft flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
            {items.length > 0 && (
              <span className="absolute top-1 right-1 bg-brand text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-9 h-9 flex items-center justify-center text-ink2 hover:text-brand">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-borderline bg-bg px-4 py-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <details key={item.label} className="group">
                <summary className="flex items-center justify-between px-3 py-2.5 text-[13px] font-semibold uppercase text-ink cursor-pointer list-none hover:text-brand hover:bg-brand-soft rounded">
                  {item.label} <ChevronDown className="w-3.5 h-3.5 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="pl-4 flex flex-col gap-0.5 mt-1">
                  {item.children.map((child) => (
                    <Link key={child.href} href={child.href} onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-[12.5px] text-ink2 hover:text-brand hover:bg-brand-soft rounded">{child.label}</Link>
                  ))}
                </div>
              </details>
            ) : (
              <button key={item.label} onClick={(e) => { handleScroll(e, item.href); setMobileOpen(false) }} className="block w-full text-left px-3 py-2.5 text-[13px] font-semibold uppercase text-ink hover:text-brand hover:bg-brand-soft rounded">
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </nav>
  )
}

function DropdownItem({ item, handleScroll }) {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150)
  }

  if (!item.children) {
    return (
      <button onClick={(e) => handleScroll(e, item.href)} className="px-3.5 py-2 text-[12.5px] font-semibold uppercase text-ink rounded hover:text-brand hover:bg-brand-soft transition-colors cursor-pointer">
        {item.label}
      </button>
    )
  }

  return (
    <div className="relative p-1" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button className="flex items-center gap-1 px-3.5 py-2 text-[12.5px] font-semibold uppercase text-ink rounded hover:text-brand hover:bg-brand-soft">
        {item.label} <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full pt-1 left-0 z-50">
          <div className="bg-bg border border-borderline rounded-lg shadow-xl min-w-[180px] overflow-hidden">
            {item.children.map((child) => (
              <Link key={child.href} href={child.href} onClick={() => setOpen(false)} className="block px-4 py-2.5 text-[12.5px] text-ink2 hover:text-brand hover:bg-brand-soft transition-all">
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}