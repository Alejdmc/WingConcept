'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FileText } from 'lucide-react'
import { api } from '@/lib/api'

const PAGE_FALLBACK = {
  hero: {
    titulo: 'Download Manuals',
    descripcion: 'Owner and Maintenance Manuals',
    imagen: '/images/front1.jpg',
  },
  intro: {
    descripcion: 'Download owner and maintenance manuals for Wing Concept equipment.',
  },
}

const MANUALS_FALLBACK = [
  { id: 'nomadic', nombre: 'Nomadic Paratrike', descripcion: 'Owner and maintenance manual for the Nomadic paratrike.', disponible_descarga: false },
  { id: 'vanguard', nombre: 'Vanguard Paratrike', descripcion: 'Owner and maintenance manual for the Vanguard paratrike.', disponible_descarga: false },
  { id: 'paramotors', nombre: 'Paramotors', descripcion: 'Owner and maintenance manual for Wing Concept paramotors.', disponible_descarga: false },
]

export default function ManualsPage() {
  const [pageContent, setPageContent] = useState(null)
  const [manuals, setManuals] = useState(MANUALS_FALLBACK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [pageData, manualsData] = await Promise.all([
          api.contenidos.manuals(),
          api.manuals.list(),
        ])
        setPageContent(pageData)
        setManuals(manualsData?.length ? manualsData : MANUALS_FALLBACK)
      } catch {
        setPageContent(PAGE_FALLBACK)
        setManuals(MANUALS_FALLBACK)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const hero = pageContent?.hero || PAGE_FALLBACK.hero
  const intro = pageContent?.intro || PAGE_FALLBACK.intro

  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-[70vh] min-h-[540px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={hero.imagen || '/images/front1.jpg'}
            alt="WINGCONCEPT Manuals"
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
                className="drop-shadow-lg brightness-0 invert"
              />
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase text-white tracking-tighter mb-4 drop-shadow-2xl">
              {hero.titulo || PAGE_FALLBACK.hero.titulo}
            </h1>
            <div className="h-2 w-24 bg-brand mx-auto" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-4xl font-black text-white max-w-3xl mx-auto leading-tight mt-8 drop-shadow-xl">
            {hero.descripcion || PAGE_FALLBACK.hero.descripcion}
          </motion.p>
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-ink leading-relaxed">
            {intro.descripcion || PAGE_FALLBACK.intro.descripcion}
          </p>
        </div>
      </section>

      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <p className="text-center text-ink2">Loading manuals...</p>
          ) : manuals.length === 0 ? (
            <p className="text-center text-ink2">New manuals coming soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {manuals.map((manual, i) => (
                <motion.div
                  key={manual.id || manual.nombre}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="bg-white rounded-2xl border border-borderline p-8 flex flex-col hover:shadow-lg hover:border-brand transition-all">
                  <div className="flex items-center gap-2 text-brand font-bold uppercase tracking-widest text-sm mb-4">
                    <FileText className="w-4 h-4" />
                    Manual
                  </div>

                  <h2 className="text-2xl font-black uppercase text-ink mb-1">{manual.nombre}</h2>
                  {manual.descripcion && (
                    <p className="text-ink leading-relaxed flex-grow mt-2">{manual.descripcion}</p>
                  )}

                  {manual.disponible_descarga && manual.id ? (
                    <a
                      href={api.manuals.downloadUrl(manual.id)}
                      download
                      className="inline-flex items-center gap-2 mt-6 text-brand font-bold uppercase tracking-widest text-sm hover:underline">
                      <FileText className="w-4 h-4" />
                      Download PDF
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 mt-6 text-ink2 font-bold uppercase tracking-widest text-sm">
                      Coming soon
                    </span>
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
