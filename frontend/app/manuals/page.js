'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FileText } from 'lucide-react'

const MANUALS = [
  { id: 'nomadic', nombre: 'Nomadic Paratrike', descripcion: 'Owner and maintenance manual for the Nomadic paratrike.', href: null },
  { id: 'vanguard', nombre: 'Vanguard Paratrike', descripcion: 'Owner and maintenance manual for the Vanguard paratrike.', href: null },
  { id: 'paramotors', nombre: 'Paramotors', descripcion: 'Owner and maintenance manual for Wing Concept paramotors.', href: null },
]

export default function ManualsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[540px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/front1.jpg"
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
              Download Manuals
            </h1>
            <div className="h-2 w-24 bg-brand mx-auto" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-4xl font-black text-white max-w-3xl mx-auto leading-tight mt-8 drop-shadow-xl">
            Owner and Maintenance Manuals
          </motion.p>
        </div>
      </section>

      {/* Manuals List */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MANUALS.map((manual, i) => (
              <motion.div
                key={manual.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-bg2 rounded-2xl border border-borderline p-8 flex flex-col hover:shadow-lg hover:border-brand transition-all">
                <div className="flex items-center gap-2 text-brand font-bold uppercase tracking-widest text-sm mb-4">
                  <FileText className="w-4 h-4" />
                  Manual
                </div>

                <h2 className="text-2xl font-black uppercase text-ink mb-1">{manual.nombre}</h2>
                <p className="text-ink leading-relaxed flex-grow mt-2">{manual.descripcion}</p>

                {manual.href ? (
                  <a
                    href={manual.href}
                    target="_blank"
                    rel="noopener noreferrer"
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
        </div>
      </section>
    </div>
  )
}
