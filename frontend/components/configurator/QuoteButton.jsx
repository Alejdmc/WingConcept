'use client'

import { useCallback, useMemo, useState } from 'react'
import { Mail } from 'lucide-react'
import { api } from '@/lib/api'
import LeadFormModal from '@/components/ui/LeadFormModal'
import { buildQuoteMailto, QUOTE_EMAIL, QUOTE_TRANSPORT_NOTE, splitQuoteDetails } from '@/lib/quoteEmail'

/** Cotización: formulario que envía la configuración y las fotos de lo elegido a andres@wingconcept.com. */
export default function QuoteButton({ productName, details = [], className = '', showTransportNote = true }) {
  const [open, setOpen] = useState(false)
  const { lines, images } = useMemo(() => splitQuoteDetails(details), [details])
  const close = useCallback(() => setOpen(false), [])

  const submit = async (values, captchaToken) => {
    await api.contact.quote({
      ...values,
      producto: productName,
      detalles: lines,
      imagenes: images,
      captchaToken,
    })
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-brand text-brand font-bold uppercase tracking-wide text-sm hover:bg-brand-soft transition-all">
        <Mail className="w-4 h-4 shrink-0" />
        Get a Quote
      </button>
      {showTransportNote && details.length > 0 && (
        <p className="text-xs text-ink2 mt-2 leading-relaxed">{QUOTE_TRANSPORT_NOTE}</p>
      )}

      <LeadFormModal
        open={open}
        onClose={close}
        title={`Quote — ${productName}`}
        subtitle="We'll email you pricing and availability for this configuration."
        submitLabel="Request quote"
        successMessage="Thank you! Your quote request was sent. We'll contact you soon."
        showCountry
        onSubmit={submit}
      >
        {lines.length > 0 && (
          <div className="rounded-lg border border-borderline bg-bg2 p-3 max-h-40 overflow-y-auto">
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink2 mb-1">Your configuration</p>
            <ul className="text-xs text-ink space-y-0.5">
              {lines.map((line) => <li key={line}>{line}</li>)}
            </ul>
          </div>
        )}
        <p className="text-xs text-ink2">
          Prefer email? Write to{' '}
          <a href={buildQuoteMailto(productName, details)} className="text-brand font-bold hover:underline">{QUOTE_EMAIL}</a>.
        </p>
      </LeadFormModal>
    </div>
  )
}
