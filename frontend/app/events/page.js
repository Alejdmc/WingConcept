'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Users, Clock } from 'lucide-react'
import { api } from '@/lib/api'

const FALLBACK = {
  hero: { titulo: 'W.C Events', descripcion: 'Learn, Connect, and Grow with Our Community', imagen: '/images/motor.png' },
  intro: { descripcion: 'Join our exclusive training courses, workshops, and community events.' },
  eventos: [],
}

export default function EventsPage() {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.contenidos.events()
      .then(setContent)
      .catch(() => setContent(FALLBACK))
      .finally(() => setLoading(false))
  }, [])

  const hero = content?.hero || FALLBACK.hero
  const intro = content?.intro || FALLBACK.intro
  const eventos = content?.eventos || content?.items || FALLBACK.eventos

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-40 bg-white border-b border-borderline py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-ink hover:text-brand transition">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </div>

      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src={hero.imagen || '/images/motor.png'} alt="Events" fill className="object-cover" priority />
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
            <h2 className="text-5xl font-black uppercase text-ink mb-4">Upcoming Events</h2>
            <div className="h-1 w-16 bg-brand mx-auto" />
          </motion.div>

          {loading ? (
            <p className="text-center text-ink2">Loading events...</p>
          ) : eventos.length === 0 ? (
            <p className="text-center text-ink2">New events coming soon.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {eventos.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden border border-borderline hover:shadow-lg hover:border-brand transition-all">
                  <div className="relative h-64 bg-bg2">
                    {event.imagen && <Image src={event.imagen} alt={event.titulo} fill className="object-cover" />}
                    {event.precio && (
                      <div className="absolute top-4 right-4 bg-brand text-white px-4 py-2 rounded-full font-black text-lg">
                        {event.precio}
                      </div>
                    )}
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-black text-ink mb-4 uppercase">{event.titulo}</h3>
                    <div className="space-y-3 mb-6 pb-6 border-b border-borderline">
                      {event.fecha && (
                        <div className="flex items-center gap-3 text-ink2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{event.fecha}</span>
                        </div>
                      )}
                      {event.hora && (
                        <div className="flex items-center gap-3 text-ink2">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{event.hora}</span>
                        </div>
                      )}
                      {event.ubicacion && (
                        <div className="flex items-center gap-3 text-ink2">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{event.ubicacion}</span>
                        </div>
                      )}
                      {event.capacidad && (
                        <div className="flex items-center gap-3 text-ink2">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">{event.capacidad}</span>
                        </div>
                      )}
                    </div>
                    {event.descripcion && <p className="text-ink mb-6 leading-relaxed">{event.descripcion}</p>}
                    {event.highlights?.length > 0 && (
                      <div className="mb-6">
                        <p className="font-bold text-ink mb-3 uppercase text-sm tracking-widest">Includes:</p>
                        <ul className="space-y-2">
                          {event.highlights.map((item, j) => (
                            <li key={j} className="flex items-center gap-2 text-ink2 text-sm">
                              <div className="w-1.5 h-1.5 bg-brand rounded-full" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button className="w-full bg-brand text-white py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-brand/90 transition">
                      Register Now
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
          <h2 className="text-5xl font-black uppercase mb-8">Can&apos;t Find Your Event?</h2>
          <p className="text-xl mb-12">Contact us to arrange a custom training session or private event.</p>
          <Link href="/contact" className="inline-block bg-white text-brand px-12 py-5 font-black uppercase tracking-widest rounded-lg hover:bg-white/90 transition">
            Request Custom Event
          </Link>
        </div>
      </section>
    </div>
  )
}
