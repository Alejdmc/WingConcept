'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-ink hover:text-brand mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-4xl font-black uppercase text-ink mb-8">Cookie Policy</h1>
        <div className="text-ink2 leading-relaxed space-y-4">
          <p>We use essential cookies and local storage for authentication, shopping cart session, and site preferences.</p>
          <p>Third-party services such as Stripe may set cookies during checkout for fraud prevention and payment processing.</p>
          <p>You can clear cookies in your browser settings, but some site features may stop working.</p>
        </div>
      </div>
    </div>
  )
}
