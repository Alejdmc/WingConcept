'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Check, Zap, Shield, Gauge } from 'lucide-react'

const vanguard = {
  id: 1,
  name: 'Vanguard V7.0',
  tagline: 'The Ultimate High-Performance Trike',
  description: 'Developed in collaboration with pilots and engineers using state-of-the-art software, the Vanguard V7.0 is the benchmark in high-performance trikes. It features a safe, lightweight, durable, and functional chassis designed for pilots who seek extreme adventure.',
  image: '/images/vanguard_hero.png',
  price: 'Contact for pricing',
  year: 2020,
  brand: 'Wing Concept',
  philosophy: 'Passion, Science, and Freedom',

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
  ],

  engines: [
    { name: 'Rotax 912', power: '80 HP' },
    { name: 'Simonini Victor 2 Super', power: '112 HP' },
    { name: 'Rotax 582', power: '64 HP' },
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
  const [activeFeature, setActiveFeature] = useState(0)

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-32 pb-16 px-6 bg-gradient-to-b from-bg2 to-white">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-brand font-bold uppercase tracking-[0.3em] text-sm mb-4">Premium Trike</p>
            <h1 className="text-6xl lg:text-7xl font-black uppercase text-ink mb-6 leading-tight">{vanguard.name}</h1>
            <p className="text-xl text-ink2 font-semibold mb-4">{vanguard.tagline}</p>
            <p className="text-lg text-ink leading-relaxed mb-8">{vanguard.description}</p>

            <div className="bg-brand-soft border-l-4 border-brand rounded p-6 mb-8">
              <p className="text-sm uppercase tracking-widest font-bold text-brand mb-2">Philosophy</p>
              <p className="text-ink font-black text-lg">{vanguard.philosophy}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/paratrike/configurador" className="bg-brand text-white px-8 py-4 font-black uppercase tracking-widest rounded hover:bg-brand/90 transition text-center">Customize Now</Link>
              <a href="#specs" className="border-2 border-brand text-brand px-8 py-4 font-black uppercase tracking-widest rounded hover:bg-brand hover:text-white transition text-center">View Specs</a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative h-96 lg:h-full lg:min-h-[600px]">
            <div className="relative w-full h-full bg-gradient-to-br from-bg2 to-bg rounded-xl overflow-hidden">
              <Image src={vanguard.image} alt={vanguard.name} fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16">
            <h2 className="text-5xl font-black uppercase text-ink mb-4">Key Innovations</h2>
            <div className="w-12 h-1 bg-brand mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              {vanguard.features.map((feature, i) => {
                const Icon = feature.icon
                return (
                  <button key={i} onClick={() => setActiveFeature(i)} className={`w-full text-left p-6 rounded-lg border-2 transition-all ${activeFeature === i ? 'border-brand bg-brand-soft' : 'border-borderline hover:border-brand/50'}`}>
                    <div className="flex items-start gap-4">
                      <Icon className={`w-6 h-6 mt-1 ${activeFeature === i ? 'text-brand' : 'text-ink2'}`} />
                      <div>
                        <h3 className="font-black text-ink uppercase tracking-wide mb-2">{feature.title}</h3>
                        {activeFeature === i && <p className="text-ink2 text-sm leading-relaxed">{feature.desc}</p>}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <motion.div key={activeFeature} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-bg2 rounded-xl p-10 flex flex-col justify-center">
              <div className="mb-6">
                {(() => {
                  const Icon = vanguard.features[activeFeature].icon;
                  return <Icon className="w-16 h-16 text-brand mb-4" />;
                })()}
              </div>
              <h3 className="text-3xl font-black text-ink mb-4">{vanguard.features[activeFeature].title}</h3>
              <p className="text-lg text-ink2 leading-relaxed mb-6">{vanguard.features[activeFeature].desc}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Engine Compatibility */}
      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-black uppercase text-ink mb-16 text-center">Compatible Engines</h2>
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
          <h2 className="text-5xl font-black uppercase text-ink mb-16 text-center">Technical Specifications</h2>
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

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-brand to-brand/80 text-white text-center">
        <h2 className="text-5xl font-black uppercase mb-6">Ready to Customize?</h2>
        <Link href="/paratrike/configurador" className="inline-block bg-white text-brand px-10 py-4 font-black uppercase tracking-widest rounded hover:shadow-lg transition">
          Start Customizing
        </Link>
      </section>
    </main>
  )
}