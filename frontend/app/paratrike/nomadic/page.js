'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, ArrowLeft, Zap, Shield, Gauge } from 'lucide-react'

const nomadic = {
  id: 2,
  name: 'Nomadic Trike',
  tagline: 'The Ultimate Off-Grid Adventure Machine',
  description: 'The Nomadic is a high-strength trike designed for pilots who demand versatility in extreme conditions. Built with high-grade stainless steel, its adjustable geometry and robust design make it the perfect platform for remote expeditions and off-grid adventures.',
  image: '/images/nomadic1.png',
  price: 'Contact for pricing',
  year: 2026,
  brand: 'Limitless',
  philosophy: 'Go Further, Land Anywhere',

  features: [
    {
      icon: Zap,
      title: 'Adjustable Anchor Points',
      desc: 'In-flight adjustments for perfect weight distribution, ideal when switching from Tandem to Single configuration.',
    },
    {
      icon: Shield,
      title: 'Integral Chassis Protection',
      desc: 'Anti-roll cage keeps pilot and passenger within the structural frame in any incident.',
    },
    {
      icon: Gauge,
      title: 'Expedition Ready',
      desc: 'Expanded load capacity and reinforced suspension, optimized for carrying all your camping gear.',
    },
    {
      icon: Shield,
      title: 'All-Terrain Suspension',
      desc: 'System designed to absorb impacts on irregular terrain, unprepared strips, and difficult landings.',
    },
  ],

  engines: [
    { name: 'Polini Thor 303', power: '38 HP' },
    { name: 'Polini Thor 260', power: '24 HP' },
    { name: 'Vittorazi Cosmos 300', power: '36 HP' },
    { name: 'Hirth 3503', power: '70 HP' },
  ],

  accessories: [
    { id: 'prop-guard', name: 'Propeller Guard', price: 280 },
    { id: 'cage-hoop-clear', name: 'Clear Cage Hoop', price: 150 },
    { id: 'lateral-bag', name: 'Expedition Side Bag', price: 220 },
    { id: 'passenger-pad', name: 'Passenger Pads', price: 95 },
    { id: 'nomadic-cover', name: 'Nomadic Protective Cover', price: 180 },
    { id: 'front-handle', name: 'Front Handling Grip', price: 60 },
  ],

  specs: {
    'Orientation': 'Expedition and Off-Grid Flight',
    'Development Year': '2026',
    'Chassis Type': 'High-Durability Stainless Steel',
    'Suspension': 'High-Resistance All-Terrain',
    'Safety': 'Full Cage Structural Protection',
  },
}

export default function NomadicPage() {
  const [expandedAccordion, setExpandedAccordion] = useState(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-borderline py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/paratrike" className="flex items-center gap-2 text-ink hover:text-brand transition">
            <ArrowLeft className="w-4 h-4" />
            Back to Selection
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-b from-bg2 to-white pt-20">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8">
              
              <div>
                <p className="text-brand font-bold uppercase tracking-widest text-sm mb-4">Limitless — {nomadic.year}</p>
                <h1 className="text-7xl font-black uppercase text-ink leading-tight mb-4">
                  {nomadic.name}
                </h1>
                <div className="h-2 w-24 bg-brand" />
              </div>

              <p className="text-3xl font-black text-ink italic">{nomadic.tagline}</p>

              <p className="text-lg text-ink leading-relaxed">
                {nomadic.description}
              </p>

              <div className="bg-brand-soft border-2 border-brand rounded-xl p-6">
                <p className="text-brand font-bold uppercase tracking-widest text-sm mb-2">Philosophy</p>
                <p className="text-3xl font-black text-brand">{nomadic.philosophy}</p>
              </div>

              <Link href="/nomadic/configurador" className="inline-flex items-center gap-3 bg-brand text-white px-8 py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-brand/90 transition">
                Customize Now
                <ChevronDown className="w-4 h-4 rotate-180" />
              </Link>
            </motion.div>

            {/* Right: Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={nomadic.image}
                alt={nomadic.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16">
            <h2 className="text-5xl font-black uppercase text-ink">Why Nomadic?</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {nomadic.features.map((feature, i) => {
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

      {/* Engines Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16">
            <h2 className="text-5xl font-black uppercase text-ink">Engine Options</h2>
            <p className="text-ink2 text-lg mt-4">Choose the power that suits your adventure</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {nomadic.engines.map((engine, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-bg2 border border-borderline rounded-xl p-8 text-center hover:shadow-lg hover:border-brand transition-all">
                <p className="text-4xl font-black text-brand mb-2">{engine.power}</p>
                <p className="text-ink font-bold uppercase tracking-widest text-sm">{engine.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Specs Section */}
      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16">
            <h2 className="text-5xl font-black uppercase text-ink">Specifications</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(nomadic.specs).map(([key, value], i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl border border-borderline p-8">
                <p className="text-brand font-bold uppercase tracking-widest text-sm mb-2">{key}</p>
                <p className="text-2xl font-black text-ink">{value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessories Accordion */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16">
            <h2 className="text-5xl font-black uppercase text-ink">Available Accessories</h2>
          </motion.div>

          <div className="space-y-4">
            {nomadic.accessories.map((accessory, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group border-2 border-borderline rounded-xl overflow-hidden hover:border-brand transition-all">
                <summary className="flex justify-between items-center cursor-pointer p-6 bg-bg2 font-bold uppercase tracking-widest text-ink hover:bg-brand-soft transition">
                  {accessory.name}
                  <div className="flex items-center gap-4">
                    <span className="text-brand font-black text-lg">${accessory.price}</span>
                    <ChevronDown className="group-open:rotate-180 transition-transform" />
                  </div>
                </summary>
                <div className="p-6 bg-white border-t border-borderline text-ink2">
                  Optional accessory to enhance your Nomadic Trike configuration and adventure capabilities.
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-brand to-brand/80">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.h2
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-6xl font-black uppercase mb-8">
            Ready to Go Further?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/90 mb-12">
            Configure your Nomadic Trike and start planning your next expedition.
          </motion.p>
          <Link href="/nomadic/configurador" className="inline-block bg-white text-brand px-12 py-5 font-black uppercase tracking-widest rounded-lg hover:bg-white/90 transition text-lg">
            Build Your Nomadic
          </Link>
        </div>
      </section>
    </div>
  )
}