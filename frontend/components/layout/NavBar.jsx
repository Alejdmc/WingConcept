'use client'
import Image from 'next/image'
import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ChevronDown, User, ShoppingCart, Menu, X, Globe } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useLanguage } from '@/context/LanguageContext'
import { getTranslation } from '@/lib/translations'

const getNavItems = (language) => [
  { labelKey: 'navbar.paramotors', href: '/paramotors' },
  { labelKey: 'navbar.paratrike', href: '/paratrike' },
  {
    labelKey: 'navbar.adventure',
    children: [
      { labelKey: 'navbar.adventureWC', href: '/adventure' },
      { labelKey: 'navbar.shows', href: '/shows' },
      { labelKey: 'navbar.events', href: '/events' },
    ],
  },
  {
    labelKey: 'navbar.more',
    children: [
      { labelKey: 'navbar.aboutUs', href: '/about' },
      { labelKey: 'navbar.milestones', href: '/milestones' },
      { labelKey: 'navbar.contactUs', href: '/contact' },
    ],
  },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const { items } = useCart()
  const { language, changeLanguage, isLoaded } = useLanguage()
  const langMenuRef = useRef(null)
  const navItems = useMemo(() => getNavItems(language), [language])

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleScroll = (e, href) => {
    if (!href.startsWith('/#')) return
    e.preventDefault()
    const id = href.replace('/#', '')
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  if (!isLoaded) return null

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

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <DropdownItem
              key={item.labelKey}
              item={item}
              language={language}
              handleScroll={handleScroll}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language Selector */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-2 w-9 h-9 rounded text-ink2 hover:text-brand hover:bg-brand-soft justify-center transition-all"
              title="Change language">
              <Globe className="w-5 h-5" />
            </button>

            {langMenuOpen && (
              <div className="absolute top-full pt-2 right-0 z-50">
                <div className="bg-white border border-borderline rounded-lg shadow-xl overflow-hidden min-w-[120px]">
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`w-full px-4 py-2.5 text-sm font-bold uppercase text-left transition-colors ${
                      language === 'en'
                        ? 'bg-brand text-white'
                        : 'text-ink2 hover:text-brand hover:bg-brand-soft'
                    }`}>
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage('es')}
                    className={`w-full px-4 py-2.5 text-sm font-bold uppercase text-left transition-colors border-t border-borderline ${
                      language === 'es'
                        ? 'bg-brand text-white'
                        : 'text-ink2 hover:text-brand hover:bg-brand-soft'
                    }`}>
                    Español
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <Link
            href="/login"
            className="w-9 h-9 rounded text-ink2 hover:text-brand hover:bg-brand-soft flex items-center justify-center transition-colors"
          >
            <User className="w-5 h-5" />
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative w-9 h-9 rounded text-ink2 hover:text-brand hover:bg-brand-soft flex items-center justify-center transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />

            {items.length > 0 && (
              <span className="absolute top-1 right-1 bg-brand text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Link>

          {/* Mobile Menu */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-ink2 hover:text-brand transition-colors"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-borderline bg-bg px-4 py-3 flex flex-col gap-1">
          {navItems.map((item) =>
            item.children ? (
              <details key={item.labelKey} className="group">
                <summary className="flex items-center justify-between px-3 py-2.5 text-[13px] font-semibold uppercase text-ink cursor-pointer list-none hover:text-brand hover:bg-brand-soft rounded">
                  {getTranslation(language, item.labelKey)}
                  <ChevronDown className="w-3.5 h-3.5 group-open:rotate-180 transition-transform" />
                </summary>

                <div className="pl-4 flex flex-col gap-0.5 mt-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 text-[12.5px] text-ink2 hover:text-brand hover:bg-brand-soft rounded"
                    >
                      {getTranslation(language, child.labelKey)}
                    </Link>
                  ))}
                </div>
              </details>
            ) : (
              <Link
                key={item.labelKey}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block w-full text-left px-3 py-2.5 text-[13px] font-semibold uppercase text-ink hover:text-brand hover:bg-brand-soft rounded"
              >
                {getTranslation(language, item.labelKey)}
              </Link>
            )
          )}

          {/* Mobile Language Selector */}
          <div className="border-t border-borderline mt-3 pt-3">
            <p className="px-3 py-2 text-[12.5px] font-semibold uppercase text-ink2">Language</p>
            <button
              onClick={() => changeLanguage('en')}
              className={`w-full text-left px-3 py-2 text-[12.5px] rounded transition-colors ${
                language === 'en'
                  ? 'bg-brand text-white font-bold'
                  : 'text-ink2 hover:text-brand hover:bg-brand-soft'
              }`}>
              🇺🇸 English
            </button>
            <button
              onClick={() => changeLanguage('es')}
              className={`w-full text-left px-3 py-2 text-[12.5px] rounded transition-colors ${
                language === 'es'
                  ? 'bg-brand text-white font-bold'
                  : 'text-ink2 hover:text-brand hover:bg-brand-soft'
              }`}>
              🇨🇴 Español
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

function DropdownItem({ item, language, handleScroll }) {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150)
  }

  if (item.children) {
    return (
      <div
        className="relative p-1"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button className="flex items-center gap-1 px-3.5 py-2 text-[12.5px] font-semibold uppercase text-ink rounded hover:text-brand hover:bg-brand-soft transition-colors">
          {getTranslation(language, item.labelKey)}
          <ChevronDown
            className={`w-3 h-3 transition-transform ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>

        {open && (
          <div className="absolute top-full pt-1 left-0 z-50">
            <div className="bg-bg border border-borderline rounded-lg shadow-xl min-w-[180px] overflow-hidden">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-[12.5px] text-ink2 hover:text-brand hover:bg-brand-soft transition-all"
                >
                  {getTranslation(language, child.labelKey)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (item.href.startsWith('/#')) {
    return (
      <button
        onClick={(e) => handleScroll(e, item.href)}
        className="px-3.5 py-2 text-[12.5px] font-semibold uppercase text-ink rounded hover:text-brand hover:bg-brand-soft transition-colors cursor-pointer"
      >
        {getTranslation(language, item.labelKey)}
      </button>
    )
  }

  return (
    <Link
      href={item.href}
      className="px-3.5 py-2 text-[12.5px] font-semibold uppercase text-ink rounded hover:text-brand hover:bg-brand-soft transition-colors cursor-pointer"
    >
      {getTranslation(language, item.labelKey)}
    </Link>
  )
}