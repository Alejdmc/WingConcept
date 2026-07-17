'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Users, Clock } from 'lucide-react'
import { api } from '@/lib/api'

// Tasa de cambio COP -> USD. Actualizar aquí cuando cambie.
const COP_TO_USD_RATE = 3218.44

const TOURISTIC_FLIGHT_RATES = [
  { duration: '15 min', cop: 250000 },
  { duration: '30 min', cop: 450000 },
  { duration: '45 min', cop: 650000 },
  { duration: '60 min', cop: 800000 },
  { duration: '120 min', cop: 1500000 },
]

const formatUSD = (cop) => (cop / COP_TO_USD_RATE).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

const FALLBACK = {
  hero: {
    titulo: 'W.C Adventure',
    descripcion: 'Extraordinary Flying Experiences Around the World',
    imagen: '/images/front1.jpg',
  },
  intro: {
    descripcion: 'Join us on unforgettable paramotor expeditions to the world\'s most stunning destinations.',
  },
  expediciones: [],
}

export default function AdventurePage() {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.contenidos.adventure()
        setContent(data)
      } catch {
        setContent(FALLBACK)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const hero = content?.hero || FALLBACK.hero
  const intro = content?.intro || FALLBACK.intro
  const expediciones = content?.expediciones || FALLBACK.expediciones

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
          <Image
            src={hero.imagen || '/images/front1.jpg'}
            alt="Adventure"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase text-white tracking-tighter mb-4 drop-shadow-2xl">
              {hero.titulo}
            </h1>
            <div className="h-2 w-24 bg-brand mx-auto mb-8" />
            <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-xl">
              {hero.descripcion}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-lg text-ink leading-relaxed">
            {intro.descripcion}
          </motion.p>
        </div>
      </section>

      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink mb-4">Featured Expeditions</h2>
            <div className="h-1 w-16 bg-brand mx-auto" />
          </motion.div>

          {loading ? (
            <p className="text-center text-ink2">Loading expeditions...</p>
          ) : expediciones.length === 0 ? (
            <p className="text-center text-ink2">New expeditions coming soon.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {expediciones.map((adventure, i) => (
                <motion.div
                  key={adventure.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden border border-borderline hover:shadow-lg hover:border-brand transition-all">

                  <div className="relative h-64 bg-bg2">
                    {adventure.imagen && (
                      <Image
                        src={adventure.imagen}
                        alt={adventure.titulo}
                        fill
                        className="object-cover"
                      />
                    )}
                    {adventure.dificultad && (
                      <div className="absolute top-4 right-4 bg-brand text-white px-4 py-2 rounded-full font-bold text-sm uppercase">
                        {adventure.dificultad}
                      </div>
                    )}
                  </div>

                  <div className="p-8">
                    <h3 className="text-2xl font-black text-ink mb-4 uppercase">{adventure.titulo}</h3>

                    <div className="space-y-3 mb-6 pb-6 border-b border-borderline">
                      {adventure.ubicacion && (
                        <div className="flex items-center gap-3 text-ink2">
                          <MapPin className="w-4 h-4" />
                          <span>{adventure.ubicacion}</span>
                        </div>
                      )}
                      {adventure.duracion && (
                        <div className="flex items-center gap-3 text-ink2">
                          <Calendar className="w-4 h-4" />
                          <span>{adventure.duracion}</span>
                        </div>
                      )}
                      {adventure.participantes && (
                        <div className="flex items-center gap-3 text-ink2">
                          <Users className="w-4 h-4" />
                          <span>{adventure.participantes} participants</span>
                        </div>
                      )}
                    </div>

                    {adventure.descripcion && (
                      <p className="text-ink mb-6 leading-relaxed">{adventure.descripcion}</p>
                    )}

                    {adventure.highlights?.length > 0 && (
                      <div className="mb-6">
                        <p className="font-bold text-ink mb-3 uppercase text-sm tracking-widest">Highlights:</p>
                        <ul className="space-y-2">
                          {adventure.highlights.map((highlight, j) => (
                            <li key={j} className="flex items-center gap-2 text-ink2 text-sm">
                              <div className="w-1.5 h-1.5 bg-brand rounded-full" />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button className="w-full bg-brand text-white py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-brand/90 transition">
                      Learn More
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Touristic Flight */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink mb-4">Touristic Flight</h2>
            <div className="h-1 w-16 bg-brand mx-auto" />
          </motion.div>

          <div className="flex items-center justify-center gap-3 mb-10 text-ink2">
            <Clock className="w-5 h-5 text-brand" />
            <span className="font-bold">7:00 AM – 10:00 AM</span>
            <span className="text-borderline">|</span>
            <span className="font-bold">3:00 PM – 6:30 PM</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {TOURISTIC_FLIGHT_RATES.map((rate) => (
              <div key={rate.duration} className="bg-bg2 border border-borderline rounded-xl p-6 text-center hover:border-brand transition">
                <p className="font-black uppercase text-ink text-lg mb-2">{rate.duration}</p>
                <p className="text-2xl font-black text-brand">{formatUSD(rate.cop)}</p>
                <p className="text-ink2 text-sm mt-1">${rate.cop.toLocaleString('es-CO')} COP</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gradient-to-r from-brand to-brand/80">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-5xl font-black uppercase mb-8">Ready for Your Next Adventure?</h2>
          <p className="text-xl mb-12">Contact us to book your expedition and start planning your ultimate paramotor journey.</p>
          <Link href="/contact" className="inline-block bg-white text-brand px-12 py-5 font-black uppercase tracking-widest rounded-lg hover:bg-white/90 transition">
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  )
}
