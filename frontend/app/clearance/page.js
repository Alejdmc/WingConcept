'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Plus, Search } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'
import { api } from '@/lib/api'
import { CLEARANCE_CATEGORIES, categoryLabel, formatClearancePrice } from '@/lib/clearance'

export default function ClearancePage() {
  const [categoria, setCategoria] = useState('')
  const [q, setQ] = useState('')
  const [query, setQuery] = useState('')
  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    api.clearance
      .list({ categoria: categoria || undefined, q: query || undefined, por_pagina: 48 })
      .then((res) => { if (!cancelled) setData(res) })
      .catch(() => { if (!cancelled) setError('Could not load listings right now.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [categoria, query])

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky-below-nav bg-white border-b border-borderline py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="group inline-flex items-center gap-2 pl-2 pr-4 py-2 rounded-full border border-borderline bg-white text-ink text-sm font-bold uppercase tracking-wide hover:border-brand hover:text-brand hover:bg-brand-soft transition-all">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-bg2 group-hover:bg-brand transition-colors">
              <ArrowLeft className="w-4 h-4 text-ink2 group-hover:text-white transition-all" />
            </span>
            Back
          </Link>
        </div>
      </div>

      <section className="py-16 px-6 bg-gradient-to-b from-bg2 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-brand font-bold uppercase tracking-[0.3em] text-sm mb-4">Pre-owned</p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase text-ink tracking-tight mb-4">Clearance</h1>
          <div className="h-1 w-16 bg-brand mx-auto mb-6" />
          <p className="text-lg text-ink2 max-w-2xl mx-auto">
            Used trikes, paramotors, wings and gear published by pilots. Contact the seller directly —
            Wing Concept only connects buyers and sellers.
          </p>
          <Link href="/cuenta/clearance" className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-lg bg-brand text-white font-black uppercase tracking-wide text-sm hover:bg-brand/90">
            <Plus className="w-4 h-4" /> Sell your equipment
          </Link>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between mb-10">
            <div className="flex flex-wrap gap-2">
              {[{ id: '', label: 'All' }, ...CLEARANCE_CATEGORIES].map((c) => (
                <button
                  key={c.id || 'all'}
                  type="button"
                  onClick={() => setCategoria(c.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                    categoria === c.id ? 'bg-brand text-white' : 'bg-bg2 text-ink2 hover:text-brand border border-borderline'
                  }`}>
                  {c.label}
                </button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setQuery(q.trim()) }} className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-ink2 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={q} onChange={(e) => setQ(e.target.value)} maxLength={80} placeholder="Search listings" className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-borderline focus:border-brand focus:outline-none text-sm" />
            </form>
          </div>

          {error && <p className="text-red-600 font-semibold">{error}</p>}
          {loading ? (
            <p className="text-ink2">Loading listings…</p>
          ) : data.items.length === 0 ? (
            <div className="bg-bg2 border border-borderline rounded-xl p-10 text-center">
              <p className="text-ink font-semibold">No listings here yet.</p>
              <p className="text-ink2 text-sm mt-1">Be the first to publish your used equipment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.items.map((l, i) => (
                <motion.div key={l.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.04 }}>
                  <Link href={`/clearance/${l.id}`} className="group block bg-bg2 border border-borderline rounded-xl overflow-hidden hover:border-brand transition">
                    <div className="relative aspect-[4/3] bg-white">
                      {l.imagenes?.[0] && (
                        <SafeImage src={l.imagenes[0]} alt={l.titulo} fill sizes="(max-width: 640px) 100vw, 33vw" className={`object-cover group-hover:scale-105 transition-transform duration-300 ${l.estado === 'vendido' ? 'grayscale' : ''}`} />
                      )}
                      {l.estado === 'vendido' && (
                        <span className="absolute top-3 left-3 rounded bg-ink text-white text-xs font-black uppercase tracking-wide px-2.5 py-1">Sold</span>
                      )}
                      <span className="absolute bottom-3 right-3 rounded bg-black/60 text-white text-[11px] font-bold px-2 py-0.5">{l.imagenes?.length || 0} photos</span>
                    </div>
                    <div className="p-5">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-brand mb-1">{categoryLabel(l.categoria)}</p>
                      <h2 className="font-black uppercase text-ink line-clamp-2">{l.titulo}</h2>
                      <p className="text-xl font-black text-brand mt-2">{formatClearancePrice(l.precio)}</p>
                      {l.ubicacion && (
                        <p className="text-sm text-ink2 mt-2 inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {l.ubicacion}</p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
