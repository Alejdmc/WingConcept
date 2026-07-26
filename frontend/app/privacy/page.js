'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

function LegalLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-ink hover:text-brand mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-4xl font-black uppercase text-ink mb-8">{title}</h1>
        <div className="prose prose-neutral max-w-none text-ink2 leading-relaxed space-y-4">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <p>WingConcept respects your privacy. We collect account and order information needed to process purchases, provide support, and improve our services.</p>
      <p>We do not sell personal data. Payment processing is handled by Stripe. Email communications may be sent through our email provider for order updates and account verification.</p>
      <p>For privacy requests, contact us at andres@wingconcept.com.</p>
    </LegalLayout>
  )
}
