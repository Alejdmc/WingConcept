'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronDown, ArrowLeft, Zap, Shield, Gauge, Package, Fuel, Users, Link2, Settings, Check } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'
import Gallery from '@/components/sections/Gallery'
import { api } from '@/lib/api'
import { FALLBACK_IMAGES } from '@/lib/imageDefaults'
import {
  DISRUPTOR_PARAMOTOR_BASE_PRICE,
  DISRUPTOR_PARAMOTOR_SUMMARY,
  DISRUPTOR_PARAMOTOR_INCLUDED,
  DISRUPTOR_PARAMOTOR_FEATURES,
  DISRUPTOR_PARAMOTOR_ENGINES,
  DISRUPTOR_PARAMOTOR_SPECS,
  DISRUPTOR_PARAMOTOR_GALLERY,
  DISRUPTOR_PARAMOTOR_HERO,
} from '@/lib/disruptorParamotorContent'

const ICON_MAP = { Zap, Shield, Gauge, Package, Fuel, Users, Link: Link2, Settings }

const CONFIGURATOR_HREF = '/paramotors/disruptor/configurador'

const disruptorFallback = {
  id: 3,
  name: 'Disruptor Paramotor',
  tagline: DISRUPTOR_PARAMOTOR_SUMMARY.tagline,
  description: DISRUPTOR_PARAMOTOR_SUMMARY.description,
  body: DISRUPTOR_PARAMOTOR_SUMMARY.body,
  image: DISRUPTOR_PARAMOTOR_HERO,
  year: 2026,
  brand: 'Wing Concept',
  philosophy: 'Break the Status Quo',
  basePrice: DISRUPTOR_PARAMOTOR_BASE_PRICE,
  model: DISRUPTOR_PARAMOTOR_SUMMARY.model,
  chassisSubtitle: DISRUPTOR_PARAMOTOR_SUMMARY.subtitle,
  included: DISRUPTOR_PARAMOTOR_INCLUDED,
  features: DISRUPTOR_PARAMOTOR_FEATURES.map((f) => ({
    ...f,
    icon: ICON_MAP[f.icon] || Package,
  })),
  engines: DISRUPTOR_PARAMOTOR_ENGINES,
  specs: DISRUPTOR_PARAMOTOR_SPECS,
  gallery: DISRUPTOR_PARAMOTOR_GALLERY,
}

function pickHeroImage(urls, fallback) {
  const first = (urls || []).find((url) => url && typeof url === 'string')
  return first || fallback
}

export default function DisruptorParamotorPage() {
  const [disruptor, setDisruptor] = useState(disruptorFallback)

  useEffect(() => {
    api.productos.obtener('disruptor-paramotor').then((p) => {
      const extra = p.contenido_extra || {}
      const heroImage = pickHeroImage(
        [extra.listing?.image, ...(extra.gallery || []), ...(p.imagenes || [])].filter(Boolean),
        DISRUPTOR_PARAMOTOR_HERO,
      )
      setDisruptor((prev) => ({
        ...prev,
        name: p.nombre || prev.name,
        description: p.descripcion || prev.description,
        body: extra.body || prev.body,
        tagline: extra.tagline || prev.tagline,
        philosophy: extra.philosophy || prev.philosophy,
        year: extra.year || prev.year,
        brand: extra.brand || prev.brand,
        basePrice: DISRUPTOR_PARAMOTOR_BASE_PRICE,
        image: heroImage,
        features: (extra.features?.length ? extra.features : prev.features).map((f) => ({
          ...f,
          icon: ICON_MAP[f.icon] || Package,
        })),
        engines: extra.engines_list?.length ? extra.engines_list : prev.engines,
        specs: extra.specs && Object.keys(extra.specs).length ? extra.specs : prev.specs,
        gallery: extra.gallery?.length
          ? extra.gallery.map((src, i) => ({ src, alt: `Disruptor Paramotor ${i + 1}` }))
          : DISRUPTOR_PARAMOTOR_GALLERY,
      }))
    }).catch(() => {})
  }, [])

  const galleryItems = disruptor.gallery || DISRUPTOR_PARAMOTOR_GALLERY
  const includedItems = disruptor.included || DISRUPTOR_PARAMOTOR_INCLUDED

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky-below-nav bg-white border-b border-borderline py-4 sm:py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/paramotors"
            className="group inline-flex items-center gap-2 pl-2 pr-4 py-2 rounded-full border border-borderline bg-white text-ink text-sm font-bold uppercase tracking-wide hover:border-brand hover:text-brand hover:bg-brand-soft transition-all">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-bg2 group-hover:bg-brand transition-colors">
              <ArrowLeft className="w-4 h-4 text-ink2 group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
            </span>
            Back to Selection
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative min-h-screen bg-gradient-to-b from-bg2 to-white pt-20">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8">
              <div>
                <p className="text-brand font-bold uppercase tracking-widest text-sm mb-4">
                  {disruptor.brand} — {disruptor.model || 'Disruptor'} · {disruptor.year}
                </p>
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase text-ink leading-tight mb-4">
                  {disruptor.name}
                </h1>
                <div className="h-2 w-24 bg-brand" />
              </div>

              <p className="text-xl sm:text-2xl md:text-3xl font-black text-ink italic">{disruptor.tagline}</p>
              <p className="text-lg text-ink leading-relaxed">{disruptor.description}</p>
              {disruptor.body && (
                <p className="text-base text-ink2 leading-relaxed">{disruptor.body}</p>
              )}

              <div className="bg-brand-soft border-2 border-brand rounded-xl p-6">
                <p className="text-brand font-bold uppercase tracking-widest text-sm mb-2">Philosophy</p>
                <p className="text-3xl font-black text-brand">{disruptor.philosophy}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={CONFIGURATOR_HREF} className="inline-flex items-center justify-center gap-3 bg-brand text-white px-8 py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-brand/90 transition">
                  Customize Now
                  <ChevronDown className="w-4 h-4 rotate-180" />
                </Link>
                <a href="#included" className="inline-flex items-center justify-center border-2 border-brand text-brand px-8 py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-brand hover:text-white transition">
                  What&apos;s Included
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <SafeImage
                src={disruptor.image}
                alt={disruptor.name}
                fill
                className="object-cover"
                priority
                fallbackSrc={FALLBACK_IMAGES.product}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section id="included" className="py-24 px-6 bg-white border-t border-borderline">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16">
            <p className="text-brand font-bold uppercase tracking-[0.3em] text-sm mb-4">Standard Paramotor Package</p>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink mb-4">What&apos;s Included</h2>
            <div className="h-1 w-16 bg-brand mx-auto mb-8" />
            <p className="text-4xl sm:text-5xl font-black text-brand">
              ${Number(disruptor.basePrice ?? DISRUPTOR_PARAMOTOR_BASE_PRICE).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-xl text-ink2 font-bold ml-2">USD</span>
            </p>
            <p className="text-ink2 mt-4 max-w-2xl mx-auto text-lg">
              {disruptor.chassisSubtitle || DISRUPTOR_PARAMOTOR_SUMMARY.subtitle}. All characteristics below are included by default in every basic Disruptor.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {includedItems.map((item, i) => {
              const IconComponent = ICON_MAP[item.icon] || Package
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-bg2 rounded-2xl border border-borderline p-8 hover:border-brand hover:shadow-lg transition-all">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 shrink-0 bg-brand-soft rounded-xl flex items-center justify-center">
                      <IconComponent className="w-7 h-7 text-brand" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="w-4 h-4 text-brand shrink-0" />
                        <h3 className="text-xl font-black text-ink uppercase tracking-wide">{item.title}</h3>
                      </div>
                      <p className="text-ink2 leading-relaxed text-sm">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-brand to-brand/85 rounded-2xl p-8 sm:p-12 text-white text-center">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/80 mb-3">Configure Your Build</p>
            <p className="text-xl sm:text-2xl font-black uppercase mb-6">
              Add engine, propeller & accessories in the configurator
            </p>
            <Link href={CONFIGURATOR_HREF} className="inline-block bg-white text-brand px-10 py-4 font-black uppercase tracking-widest rounded-lg hover:bg-white/90 transition">
              Open Configurator
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink">Why Disruptor?</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {disruptor.features.map((feature, i) => {
              const IconComponent = feature.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl border border-borderline p-8 hover:shadow-lg hover:border-brand transition-all">
                  <div className="w-12 h-12 bg-brand-soft rounded-lg flex items-center justify-center mb-6">
                    <IconComponent className="w-6 h-6 text-brand" />
                  </div>
                  <h3 className="text-2xl font-black text-ink mb-3">{feature.title}</h3>
                  <p className="text-ink2">{feature.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <Gallery images={galleryItems} eyebrow="Disruptor Paramotor" title="Photo Gallery" bgClass="bg-white" />

      {/* Engines */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink">Compatible Engines</h2>
            <p className="text-ink2 text-lg mt-4">Multi-engine mount supports the following powerplants</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {disruptor.engines.map((engine, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-bg2 border border-borderline rounded-xl p-8 text-center hover:shadow-lg hover:border-brand transition-all">
                <p className="text-3xl font-black text-brand mb-2">{engine.power}</p>
                <p className="text-ink font-bold uppercase tracking-widest text-sm">{engine.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Specs */}
      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink">Specifications</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(disruptor.specs).map(([key, value], i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-xl border border-borderline p-8">
                <p className="text-brand font-bold uppercase tracking-widest text-sm mb-2">{key}</p>
                <p className="text-xl font-black text-ink">{value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-r from-brand to-brand/80">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.h2 initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} className="text-3xl sm:text-6xl font-black uppercase mb-8">
            Ready to Disrupt?
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xl text-white/90 mb-12">
            Configure your Disruptor Paramotor and evolve with every flight.
          </motion.p>
          <Link href={CONFIGURATOR_HREF} className="inline-block bg-white text-brand px-12 py-5 font-black uppercase tracking-widest rounded-lg hover:bg-white/90 transition text-lg">
            Build Your Disruptor
          </Link>
        </div>
      </section>
    </div>
  )
}
