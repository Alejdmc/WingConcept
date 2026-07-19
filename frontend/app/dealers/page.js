'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { MapPin, Instagram } from 'lucide-react'
import { api } from '@/lib/api'

const FALLBACK = [
  {
    id: 'paramotor-flights-llc',
    nombre: 'Paramotor Flights LLC',
    equipo: 'Team Louish',
    ubicacion: 'Saratoga Springs, Utah',
    descripcion: 'Authorized Paratrikes dealer serving Utah. Specializing in tandem paramotor flights, professional flight training, pilot support, and high-quality powered paragliding equipment. Dedicated to providing safe, exciting, and unforgettable flying experiences for both new and experienced pilots.',
    instagram: null,
  },
  {
    id: 'pukana-adventures',
    nombre: 'Pukana Adventures',
    equipo: null,
    ubicacion: 'Utah',
    descripcion: "Authorized Paratrikes dealer offering tandem paramotor flights, certified flight training, a fully equipped paramotor shop, and access to a dedicated flight park. Whether you're looking to experience your first flight, become a certified pilot, or purchase premium paramotor equipment, Pukana Adventures provides expert guidance and outstanding customer service.",
    instagram: 'https://www.instagram.com/pukanaadventures?igsh=NXQxcDZtajVmZTEy',
  },
]

export default function DealersPage() {
  const [dealers, setDealers] = useState(FALLBACK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.dealers.list()
      .then((data) => setDealers(data?.length ? data : FALLBACK))
      .catch(() => setDealers(FALLBACK))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Con imagen de fondo tipo Parajet */}
      <section className="relative h-[70vh] min-h-[540px] flex items-center justify-center overflow-hidden">
        {/* Imagen de fondo */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/front1.jpg"
            alt="WINGCONCEPT Dealers"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay oscuro para mejorar legibilidad */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Contenido sobre la imagen */}
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
                className="drop-shadow-lg brightness-0 invert"
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

      {/* Dealers List */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <p className="text-center text-ink2">Loading dealers...</p>
          ) : dealers.length === 0 ? (
            <p className="text-center text-ink2">New dealers coming soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {dealers.map((dealer, i) => (
                <motion.div
                  key={dealer.id || dealer.nombre}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
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
                      Follow on Instagram
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
