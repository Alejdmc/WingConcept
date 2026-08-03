'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LegalLayout({ title, subtitle, children, updated = 'July 31, 2026' }) {
  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 pl-2 pr-4 py-2 rounded-full border border-borderline bg-white text-ink text-sm font-bold uppercase tracking-wide hover:border-brand hover:text-brand hover:bg-brand-soft transition-all mb-8"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-bg2 group-hover:bg-brand transition-colors">
            <ArrowLeft className="w-4 h-4 text-ink2 group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
          </span>
          Back
        </Link>

        <h1 className="text-3xl sm:text-4xl font-black uppercase text-ink tracking-tight">{title}</h1>
        {subtitle && <p className="text-ink2 mt-3 text-lg">{subtitle}</p>}
        <p className="text-sm text-ink2 mt-2 mb-10">Last updated: {updated}</p>

        <div className="text-ink2 leading-relaxed space-y-8 [&_h2]:text-ink [&_h2]:font-black [&_h2]:text-lg [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:text-brand [&_a]:font-semibold [&_a]:hover:underline">
          {children}
        </div>

        <div className="mt-12 pt-8 border-t border-borderline flex flex-wrap gap-4 text-sm">
          <Link href="/terms" className="text-brand font-semibold hover:underline">Terms of Service</Link>
          <Link href="/privacy" className="text-brand font-semibold hover:underline">Privacy Policy</Link>
          <Link href="/cookies" className="text-brand font-semibold hover:underline">Cookie Policy</Link>
          <Link href="/contact" className="text-brand font-semibold hover:underline">Contact</Link>
        </div>
      </div>
    </div>
  )
}
