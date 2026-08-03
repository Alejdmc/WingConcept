'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

const STORAGE_KEY = 'wc_cookie_consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, analytics: false, ts: Date.now() }))
    } catch {
      // ignore
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-[100] p-4 sm:p-6 pointer-events-none"
    >
      <div className="max-w-4xl mx-auto pointer-events-auto bg-white border border-borderline shadow-2xl rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 text-sm text-ink2 leading-relaxed">
          <p className="font-bold text-ink mb-1">We use cookies</p>
          <p>
            Essential cookies and local storage keep you signed in, maintain your cart, and secure checkout.
            See our{' '}
            <Link href="/cookies" className="text-brand font-semibold hover:underline">Cookie Policy</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-brand font-semibold hover:underline">Privacy Policy</Link>.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/cookies"
            className="px-4 py-2.5 border border-borderline rounded-lg text-sm font-bold text-ink hover:border-brand transition"
          >
            Learn more
          </Link>
          <button
            type="button"
            onClick={accept}
            className="px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-black uppercase tracking-wide hover:bg-brand/90 transition"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={accept}
            aria-label="Dismiss"
            className="p-2 text-ink2 hover:text-ink sm:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
