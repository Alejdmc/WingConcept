'use client'

import { Mail } from 'lucide-react'
import { buildQuoteMailto } from '@/lib/quoteEmail'

export default function QuoteButton({ productName, details = [], className = '' }) {
  const href = buildQuoteMailto(productName, details)

  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-brand text-brand font-bold uppercase tracking-wide text-sm hover:bg-brand-soft transition-all ${className}`}>
      <Mail className="w-4 h-4 shrink-0" />
      Get a Quote
    </a>
  )
}
