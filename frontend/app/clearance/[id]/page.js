'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Mail, MapPin, MessageCircle, Phone, ShieldAlert, X } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'
import { api } from '@/lib/api'
import { categoryLabel, formatClearancePrice, whatsappLink } from '@/lib/clearance'

function Gallery({ images, title }) {
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  const n = images.length
  const prev = () => setActive((i) => (i - 1 + n) % n)
  const next = () => setActive((i) => (i + 1) % n)

  useEffect(() => {
    if (!open) return undefined
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
    }
  })

  if (!n) return null
  return (
    <div className="space-y-3">
      <button type="button" onClick={() => setOpen(true)} className="relative block w-full aspect-[4/3] bg-bg2 rounded-2xl overflow-hidden cursor-zoom-in">
        <SafeImage src={images[active]} alt={`${title} — photo ${active + 1}`} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain" priority />
      </button>
      {n > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((src, i) => (
            <button key={src} type="button" onClick={() => setActive(i)} className={`relative aspect-square rounded-lg overflow-hidden border-2 ${i === active ? 'border-brand' : 'border-borderline hover:border-brand/50'}`} aria-label={`Photo ${i + 1}`}>
              <SafeImage src={src} alt="" fill sizes="100px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      {open && createPortal(
        <div className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-4" onClick={() => setOpen(false)} role="dialog" aria-modal="true">
          <button type="button" onClick={() => setOpen(false)} className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white" aria-label="Close"><X className="w-6 h-6" /></button>
          {n > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); prev() }} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white" aria-label="Previous"><ChevronLeft className="w-6 h-6" /></button>
              <button type="button" onClick={(e) => { e.stopPropagation(); next() }} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white" aria-label="Next"><ChevronRight className="w-6 h-6" /></button>
            </>
          )}
          <div className="relative w-full max-w-5xl aspect-[4/3] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <SafeImage src={images[active]} alt={title} fill className="object-contain" unoptimized />
          </div>
          <p className="absolute bottom-4 text-white/80 text-sm">{active + 1} / {n}</p>
        </div>,
        document.body,
      )}
    </div>
  )
}

export default function ClearanceDetailPage() {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    api.clearance.get(id)
      .then((l) => { if (!cancelled) { setListing(l); setStatus('ok') } })
      .catch(() => { if (!cancelled) setStatus('missing') })
    return () => { cancelled = true }
  }, [id])

  if (status === 'loading') {
    return <div className="min-h-[50vh] flex items-center justify-center"><p className="text-ink2">Loading…</p></div>
  }
  if (status === 'missing') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-ink font-semibold">This listing is no longer available.</p>
        <Link href="/clearance" className="text-brand font-bold hover:underline">Back to Clearance</Link>
      </div>
    )
  }

  const wa = whatsappLink(listing.contacto_telefono)
  const sold = listing.estado === 'vendido'
  const mailto = `mailto:${listing.contacto_email}?subject=${encodeURIComponent(`Wing Concept Clearance — ${listing.titulo}`)}`

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky-below-nav bg-white border-b border-borderline py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/clearance" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-ink hover:text-brand">
            <ArrowLeft className="w-4 h-4" /> Clearance
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="lg:sticky lg:self-start" style={{ top: 'calc(var(--nav-h) + 6rem)' }}>
          <Gallery images={listing.imagenes || []} title={listing.titulo} />
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">{categoryLabel(listing.categoria)} · Pre-owned</p>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-ink mt-2">{listing.titulo}</h1>
          <div className="flex items-center gap-3 mt-4">
            <p className="text-3xl font-black text-brand">{formatClearancePrice(listing.precio)}</p>
            {sold && <span className="rounded bg-ink text-white text-xs font-black uppercase px-2.5 py-1">Sold</span>}
          </div>
          {listing.ubicacion && (
            <p className="text-ink2 mt-3 inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {listing.ubicacion}</p>
          )}

          <div className="mt-8">
            <h2 className="font-black uppercase text-ink text-sm tracking-wide mb-2">Description</h2>
            <p className="text-ink2 leading-relaxed whitespace-pre-line">{listing.descripcion}</p>
          </div>

          <div className="mt-8 bg-bg2 border border-borderline rounded-xl p-6">
            <h2 className="font-black uppercase text-ink text-sm tracking-wide">Contact the seller</h2>
            <p className="text-ink font-semibold mt-3">{listing.contacto_nombre}</p>
            <div className="flex flex-col gap-2 mt-3 text-sm">
              <a href={mailto} className="inline-flex items-center gap-2 text-ink hover:text-brand"><Mail className="w-4 h-4" /> {listing.contacto_email}</a>
              {listing.contacto_telefono && (
                <a href={`tel:${listing.contacto_telefono.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 text-ink hover:text-brand"><Phone className="w-4 h-4" /> {listing.contacto_telefono}</a>
              )}
            </div>
            {!sold && (
              <div className="flex flex-wrap gap-3 mt-5">
                <a href={mailto} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand text-white text-sm font-black uppercase tracking-wide hover:bg-brand/90"><Mail className="w-4 h-4" /> Email seller</a>
                {wa && (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-brand text-brand text-sm font-black uppercase tracking-wide hover:bg-brand-soft"><MessageCircle className="w-4 h-4" /> WhatsApp</a>
                )}
              </div>
            )}
          </div>

          <p className="mt-6 text-xs text-ink2 flex gap-2 leading-relaxed">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            Wing Concept is only an intermediary: we don&apos;t process payments or guarantee items in Clearance. Inspect the equipment and agree on payment and delivery directly with the seller.
          </p>
        </div>
      </div>
    </div>
  )
}
