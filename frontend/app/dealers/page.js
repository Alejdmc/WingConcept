'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { MapPin, Instagram } from 'lucide-react'
import { apiUrl } from '@/lib/api'
import { DEALERS_FALLBACK, mergeDealersFromApi, instagramHandle } from '@/lib/dealersContent'

async function loadDealers() {
  try {
    const res = await fetch(apiUrl('/dealers'), {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) return mergeDealersFromApi(DEALERS_FALLBACK)
    const data = await res.json()
    return mergeDealersFromApi(data)
  } catch {
    return mergeDealersFromApi(DEALERS_FALLBACK)
  }
}

export default function DealersPage() {
  const [dealers, setDealers] = useState(DEALERS_FALLBACK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDealers()
      .then(setDealers)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-[70vh] min-h-[540px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/front1.jpg"
            alt="WINGCONCEPT Dealers"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>
            <div className="mb-8 flex justify-center">
              <Image
                src="/images/logo.png"
                alt="Wing Concept"
                width={500}
                height={200}
                className="hero-logo drop-shadow-lg brightness-0 invert"
              />
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase text-white tracking-tighter mb-4 drop-shadow-2xl">
              Dealers
            </h1>
            <div className="h-2 w-24 bg-brand mx-auto" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-4xl font-black text-white max-w-3xl mx-auto leading-tight mt-8 drop-shadow-xl">
            Find Your Nearest Authorized Dealer
          </motion.p>
        </div>
      </section>

      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <p className="text-center text-ink2">Loading dealers...</p>
          ) : dealers.length === 0 ? (
            <p className="text-center text-ink2">New dealers coming soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {dealers.map((dealer) => {
                const handle = instagramHandle(dealer.instagram)
                return (
                  <article
                    key={dealer.id || dealer.nombre}
                    className="bg-bg2 rounded-2xl border border-borderline p-8 flex flex-col hover:shadow-lg hover:border-brand transition-all">
                    {dealer.ubicacion && (
                      <div className="flex items-center gap-2 text-brand font-bold uppercase tracking-widest text-sm mb-4">
                        <MapPin className="w-4 h-4" />
                        {dealer.ubicacion}
                      </div>
                    )}

                    <h2 className="text-2xl font-black uppercase text-ink mb-1">{dealer.nombre}</h2>
                    {dealer.equipo && (
                      <p className="text-ink2 font-semibold uppercase tracking-wide text-sm mb-4">{dealer.equipo}</p>
                    )}

                    {dealer.descripcion && (
                      <p className="text-ink leading-relaxed flex-grow mt-2">{dealer.descripcion}</p>
                    )}

                    {dealer.instagram && (
                      <a
                        href={dealer.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-6 text-brand font-bold uppercase tracking-widest text-sm hover:underline">
                        <Instagram className="w-4 h-4" />
                        {handle ? `Follow ${handle} on Instagram` : 'Follow on Instagram'}
                      </a>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
