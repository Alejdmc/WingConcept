'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-ink hover:text-brand mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-4xl font-black uppercase text-ink mb-8">Terms of Service</h1>
        <div className="text-ink2 leading-relaxed space-y-4">
          <p>By using wingconcept.com you agree to these terms. Product availability, pricing, and specifications may change without notice.</p>
          <p>Orders are confirmed after successful payment. Shipping times and warranty terms depend on the product purchased.</p>
          <p>WingConcept is not liable for misuse of equipment or failure to follow owner manuals and local regulations.</p>
          <p>Questions about these terms: andres@wingconcept.com.</p>
        </div>
      </div>
    </div>
  )
}
