'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, Zap, Shield, Gauge, Package, Truck, Fuel, Backpack, Wind, Feather, Users, Link2, Settings } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'
import Gallery from '@/components/sections/Gallery'
import { api } from '@/lib/api'
import { FALLBACK_IMAGES } from '@/lib/imageDefaults'
import {
  VANGUARD_BASE_PRICE,
  VANGUARD_CHASSIS_SUMMARY,
  VANGUARD_INCLUDED,
} from '@/lib/vanguardContent'

const ICON_MAP = { Zap, Shield, Gauge, Package, Truck, Fuel, Backpack, Wind, Feather, Users, Link: Link2, Settings }

const VANGUARD_GALLERY = Array.from({ length: 10 }, (_, i) => ({
  src: `/images/vanguard/${i + 1}.png`,
  alt: `Vanguard V8.0 ${i + 1}`,
}))

const vanguardFallback = {
  id: 1,
  name: 'Vanguard V8.0',
  tagline: 'The Ultimate High-Performance Trike',
  description: 'Developed in collaboration with pilots and engineers using state-of-the-art software, the Vanguard V8.0 is the benchmark in high-performance trikes. It features a safe, lightweight, durable, and functional chassis designed for pilots who seek extreme adventure.',
  image: '/images/vanguard/1.png',
  year: 2020,
  brand: 'Wing Concept',
  philosophy: 'Passion, Science, and Freedom',
  basePrice: VANGUARD_BASE_PRICE,
  model: VANGUARD_CHASSIS_SUMMARY.model,
  chassisSubtitle: VANGUARD_CHASSIS_SUMMARY.subtitle,
  included: VANGUARD_INCLUDED,

  features: [
    {
      icon: Zap,
      title: 'In-Flight Movable Center of Gravity',
      desc: 'Adjust the center of gravity while in the air. Perfect for tandem paragliding with precise transition from Tandem to Single configuration during flight.',
    },
    {
      icon: Shield,
      title: 'SSS (Seat Swap System)',
      desc: 'Easy removal of passenger seat with passive safety through suspended seat system rather than rigid attachment.',
    },
    {
      icon: Gauge,
      title: 'ECMB (Electrical Maintenance Box)',
      desc: 'Centralized electrical management with simple component inspection and flexible accessory integration.',
    },
    {
      icon: Shield,
      title: 'S.A. Shock Absorber (Active Suspension)',
      desc: '1200N resistance per unit. Only 350g each. Safe takeoffs on unprepared terrain and short runways.',
    },
    {
      icon: Package,
      title: 'Interchangeable Mission Pod',
      desc: 'Swap the passenger basket to match the mission: Commercial for tandem flights and rental fleets, Adventure for backcountry exploration, or Reportage for aerial photography and filming — all on the same airframe.',
    },
    {
      icon: Truck,
      title: 'Tool-Free Field Disassembly',
      desc: 'Breaks down quickly for effortless ground transport — no trailer required. The compact footprint is engineered to load straight into the bed of a pickup truck.',
    },
    {
      icon: Fuel,
      title: 'Onboard Fuel Gauge & Dual USB Charging',
      desc: 'Every trike ships with an integrated fuel gauge and dual USB charging ports, keeping the pilot informed and devices powered throughout the flight.',
    },
    {
      icon: Backpack,
      title: 'Passenger Backrest Instrument & Hydration Pocket',
      desc: 'The passenger seat backrest doubles as an instrument holder and carries a dedicated Camel Back pocket, keeping the pilot informed and hydrated, plus side pockets and retention straps for the communication radio.',
    },
    {
      icon: Wind,
      title: 'Low-Drag Propeller Protection Mesh',
      desc: 'The only trike in the world with a low propeller guard mesh that shields against sand and small stones kicked up by the wheels, while its dynamic design still allows full airflow to the propeller without adding drag.',
    },
    {
      icon: Feather,
      title: 'Ultra-Light Airframe',
      desc: 'The bare structure — fully instrumented, without engine or propeller — weighs just 60 kg (132 lb), delivering an exceptional power-to-weight ratio.',
    },
  ],

  engines: [
    { name: 'Rotax 912', power: '80 HP' },
    { name: 'Simonini Victor 2 Super', power: '112 HP' },
    { name: 'RMZ500', power: '' },
    { name: 'Vanguard EFI w/ reduction', power: '70 HP' },
    { name: 'Hirth 3503', power: '70 HP' },
  ],

  specs: {
    'Orientation': 'Tandem flight & short runway operations',
    'Development Year': '2020',
    'Chassis Type': 'Lightweight & Durable',
    'Suspension': 'Active (S.A. System)',
    'Safety': 'Passive seat suspension',
  },
}

export default function ParatrikePage() {
  const [vanguard, setVanguard] = useState(vanguardFallback)

  useEffect(() => {
    api.productos.obtener('vanguard-v8').then((p) => {
      const extra = p.contenido_extra || {}
      setVanguard((prev) => ({
        ...prev,
        name: p.nombre || prev.name,
        description: p.descripcion || prev.description,
        tagline: extra.tagline || prev.tagline,
        philosophy: extra.philosophy || prev.philosophy,
        features: (extra.features || prev.features).map((f) => ({
          ...f,
          icon: ICON_MAP[f.icon] || Package,
        })),
        engines: extra.engines_list?.length ? extra.engines_list : prev.engines,
        specs: extra.specs && Object.keys(extra.specs).length ? extra.specs : prev.specs,
        gallery: extra.gallery?.length
          ? extra.gallery.map((src, i) => ({ src, alt: `Vanguard ${i + 1}` }))
          : VANGUARD_GALLERY,
      }))
    }).catch(() => {})
  }, [])

  const galleryItems = vanguard.gallery || VANGUARD_GALLERY
  const includedItems = vanguard.included || VANGUARD_INCLUDED

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-32 pb-16 px-6 bg-gradient-to-b from-bg2 to-white">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-brand font-bold uppercase tracking-[0.3em] text-sm mb-4">Premium Trike</p>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase text-ink mb-6 leading-tight">{vanguard.name}</h1>
            <p className="text-xl text-ink2 font-semibold mb-4">{vanguard.tagline}</p>
            <p className="text-lg text-ink leading-relaxed mb-8">{vanguard.description}</p>

            <div className="bg-brand-soft border-l-4 border-brand rounded p-6 mb-8">
              <p className="text-sm uppercase tracking-widest font-bold text-brand mb-2">Philosophy</p>
              <p className="text-ink font-black text-lg">{vanguard.philosophy}</p>
            </div>

            <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
              <Link href="/paratrike/vanguard/configuration" className="bg-brand text-white px-8 py-4 font-black uppercase tracking-widest rounded hover:bg-brand/90 transition text-center">Customize Now</Link>
              <a href="#included" className="border-2 border-brand text-brand px-8 py-4 font-black uppercase tracking-widest rounded hover:bg-brand hover:text-white transition text-center">What&apos;s Included</a>
              <a href="#specs" className="border-2 border-borderline text-ink px-8 py-4 font-black uppercase tracking-widest rounded hover:border-brand hover:text-brand transition text-center">View Specs</a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative h-96 lg:h-full lg:min-h-[600px]">
            <div className="relative w-full h-full bg-transparent rounded-xl overflow-hidden">
              <SafeImage src={vanguard.image} alt={vanguard.name} fill className="object-contain" priority fallbackSrc={FALLBACK_IMAGES.product} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* What's Included — standard chassis package */}
      <section id="included" className="py-24 px-6 bg-white border-t border-borderline">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16">
            <p className="text-brand font-bold uppercase tracking-[0.3em] text-sm mb-4">Standard Chassis Package</p>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink mb-4">What&apos;s Included</h2>
            <div className="h-1 w-16 bg-brand mx-auto mb-8" />
            <p className="text-4xl sm:text-5xl font-black text-brand">
              ${Number(vanguard.basePrice ?? VANGUARD_BASE_PRICE).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-xl text-ink2 font-bold ml-2">USD</span>
            </p>
            <p className="text-ink2 mt-4 max-w-2xl mx-auto text-lg">
              {vanguard.chassisSubtitle || VANGUARD_CHASSIS_SUMMARY.subtitle}. All characteristics below are included by default in every basic trike.
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
            <Link href="/paratrike/vanguard/configuration" className="inline-block bg-white text-brand px-10 py-4 font-black uppercase tracking-widest rounded-lg hover:bg-white/90 transition">
              Open Configurator
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink mb-4">Key Innovations</h2>
            <div className="w-12 h-1 bg-brand mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vanguard.features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: (i % 3) * 0.1, duration: 0.4 }}
                  className="p-6 rounded-lg border-2 border-borderline bg-bg2/40">
                  <Icon className="w-8 h-8 text-brand mb-4" />
                  <h3 className="font-black text-ink uppercase tracking-wide mb-2">{feature.title}</h3>
                  <p className="text-ink2 text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <Gallery images={galleryItems} eyebrow="Vanguard V8.0" title="Photo Gallery" bgClass="bg-white" />

      {/* Engine Compatibility */}
      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink mb-16 text-center">Compatible Engines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vanguard.engines.map((engine, i) => (
              <div key={i} className="bg-white border border-borderline rounded-lg p-6 hover:shadow-lg transition">
                <div className="flex items-center gap-3 mb-2">
                  <Check className="w-5 h-5 text-brand" />
                  <h3 className="font-black text-ink">{engine.name}</h3>
                </div>
                <p className="text-sm text-brand font-bold uppercase tracking-widest">{engine.power}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specs Section */}
      <section id="specs" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink mb-16 text-center">Technical Specifications</h2>
          <div className="bg-bg2 rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
            {Object.entries(vanguard.specs).map(([key, value]) => (
              <div key={key} className="p-8 border-b border-borderline">
                <p className="text-sm font-bold uppercase text-ink2 tracking-widest mb-2">{key}</p>
                <p className="text-2xl font-black text-ink">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Every Mission */}
      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink mb-4">Built for Every Mission</h2>
          <div className="w-12 h-1 bg-brand mx-auto mb-8" />
          <p className="text-lg text-ink2 leading-relaxed">
            Wing Concept engineers every trike to perform across the full spectrum of flight: tandem instruction, drop-back skydive support, cross-country expeditions, aerobatics, aerial advertising, commercial operations, and long-range touring — or anything else a pilot can imagine. Gravity and the sky are no longer the limit.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-r from-brand to-brand/80 text-white text-center">
        <h2 className="text-3xl sm:text-5xl font-black uppercase mb-6">Ready to Customize?</h2>
        <Link href="/paratrike/vanguard/configuration" className="inline-block bg-white text-brand px-10 py-4 font-black uppercase tracking-widest rounded hover:shadow-lg transition">
          Start Customizing
        </Link>
      </section>
    </main>
  )
}