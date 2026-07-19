'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Wind } from 'lucide-react'

export default function ParamotorsPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section - Con imagen de fondo tipo Parajet */}
      <section className="relative h-[70vh] min-h-[540px] flex items-center justify-center overflow-hidden">
        {/* Imagen de fondo */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/front1.jpg"
            alt="WINGCONCEPT Paramotors"
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
              Paramotors
            </h1>
            <div className="h-2 w-24 bg-brand mx-auto" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-4xl font-black text-white max-w-3xl mx-auto leading-tight mt-8 drop-shadow-xl">
            Coming Soon
          </motion.p>
        </div>
      </section>

      {/* Coming Soon Details */}
      <section className="py-24 px-6 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-brand-soft flex items-center justify-center">
            <Wind className="w-8 h-8 text-brand" />
          </div>

          <p className="text-lg text-ink2 leading-relaxed mb-10">
            We're still working on our paramotor lineup. In the meantime, check out our paratrikes —
            built with the same passion, science, and freedom.
          </p>

          <Link
            href="/paratrike"
            className="inline-flex items-center gap-3 bg-brand text-white px-8 py-4 rounded-lg font-black uppercase tracking-widest hover:bg-brand/90 transition">
            Explore Paratrikes
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
