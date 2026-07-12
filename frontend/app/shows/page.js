'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Ticket } from 'lucide-react'
import { api } from '@/lib/api'

const FALLBACK = {
  hero: { titulo: 'W.C Shows', descripcion: 'Witness the Art of Paramotor Flight', imagen: '/images/front1.jpg' },
  intro: { descripcion: 'Experience the thrill of elite paramotor competitions and world-class aerial demonstrations.' },
  shows: [],
}

export default function ShowsPage() {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.contenidos.shows()
      .then(setContent)
      .catch(() => setContent(FALLBACK))
      .finally(() => setLoading(false))
  }, [])

  const hero = content?.hero || FALLBACK.hero
  const intro = content?.intro || FALLBACK.intro
  const shows = content?.shows || content?.items || FALLBACK.shows

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-40 bg-white border-b border-borderline py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 pl-2 pr-4 py-2 rounded-full border border-borderline bg-white text-ink text-sm font-bold uppercase tracking-wide hover:border-brand hover:text-brand hover:bg-brand-soft transition-all">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-bg2 group-hover:bg-brand transition-colors">
              <ArrowLeft className="w-4 h-4 text-ink2 group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
            </span>
            Back
          </Link>
        </div>
      </div>

      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src={hero.imagen || '/images/front1.jpg'} alt="Shows" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-7xl md:text-8xl font-black uppercase text-white tracking-tighter mb-4 drop-shadow-2xl">
              {hero.titulo}
            </h1>
            <div className="h-2 w-24 bg-brand mx-auto mb-8" />
            <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-xl">{hero.descripcion}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-lg text-ink leading-relaxed">
            {intro.descripcion}
          </motion.p>
        </div>
      </section>

      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h2 className="text-5xl font-black uppercase text-ink mb-4">Upcoming Shows</h2>
            <div className="h-1 w-16 bg-brand mx-auto" />
          </motion.div>

          {loading ? (
            <p className="text-center text-ink2">Loading shows...</p>
          ) : shows.length === 0 ? (
            <p className="text-center text-ink2">New shows coming soon.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {shows.map((show, i) => (
                <motion.div
                  key={show.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden border border-borderline hover:shadow-lg hover:border-brand transition-all">
                  <div className="relative h-64 bg-bg2">
                    {show.imagen && <Image src={show.imagen} alt={show.titulo} fill className="object-cover" />}
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-black text-ink mb-4 uppercase">{show.titulo}</h3>
                    <div className="space-y-3 mb-6 pb-6 border-b border-borderline">
                      {show.fecha && (
                        <div className="flex items-center gap-3 text-ink2">
                          <Calendar className="w-4 h-4" />
                          <span>{show.fecha}</span>
                        </div>
                      )}
                      {show.ubicacion && (
                        <div className="flex items-center gap-3 text-ink2">
                          <MapPin className="w-4 h-4" />
                          <span>{show.ubicacion}</span>
                        </div>
                      )}
                    </div>
                    {show.descripcion && <p className="text-ink mb-6 leading-relaxed">{show.descripcion}</p>}
                    {show.highlights?.length > 0 && (
                      <div className="mb-6">
                        <p className="font-bold text-ink mb-3 uppercase text-sm tracking-widest">Program:</p>
                        <ul className="space-y-2">
                          {show.highlights.map((h, j) => (
                            <li key={j} className="flex items-center gap-2 text-ink2 text-sm">
                              <div className="w-1.5 h-1.5 bg-brand rounded-full" />
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button className="w-full bg-brand text-white py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-brand/90 transition flex items-center justify-center gap-2">
                      <Ticket className="w-4 h-4" />
                      Get Tickets
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 px-6 bg-gradient-to-r from-brand to-brand/80">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-5xl font-black uppercase mb-8">Don&apos;t Miss Our Next Show</h2>
          <p className="text-xl mb-12">Subscribe to our newsletter to receive exclusive updates on upcoming shows.</p>
          <Link href="/contact" className="inline-block bg-white text-brand px-12 py-4 font-black uppercase tracking-widest rounded-lg hover:bg-white/90 transition">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  )
}
