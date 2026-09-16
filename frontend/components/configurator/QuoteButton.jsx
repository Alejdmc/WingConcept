'use client'

import { Mail } from 'lucide-react'
import { buildQuoteMailto, QUOTE_TRANSPORT_NOTE } from '@/lib/quoteEmail'

export default function QuoteButton({ productName, details = [], className = '', showTransportNote = true }) {
  const href = buildQuoteMailto(productName, details)

  return (
    <div className={className}>
      <a
        href={href}
        className="inline-flex w-full items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-brand text-brand font-bold uppercase tracking-wide text-sm hover:bg-brand-soft transition-all">
        <Mail className="w-4 h-4 shrink-0" />
        Get a Quote
      </a>
      {showTransportNote && details.length > 0 && (
        <p className="text-xs text-ink2 mt-2 leading-relaxed">{QUOTE_TRANSPORT_NOTE}</p>
      )}
    </div>
  )
}
