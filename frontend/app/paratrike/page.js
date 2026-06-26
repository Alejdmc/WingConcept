'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ChevronRight } from 'lucide-react'

const TRIKES = [
  {
    id: 1,
    name: 'Vanguard V8.0',
    brand: 'Wing Concept',
    year: 2024,
    tagline: 'Performance Meets Precision',
    description: 'The ultimate high-performance trike for serious enthusiasts. Built with cutting-edge engineering and premium materials.',
    image: '/images/vanguard_hero.png',
    basePrice: 5950,
    features: [
      'Premium aluminum construction',
      'Advanced aerodynamic design',
      'Multiple engine options',
      'Precision-engineered suspension'
    ],
    href: '/paratrike/vanguard',
    color: 'from-blue-500 to-blue-600',
    accent: 'bg-blue-100'
  },
  {
    id: 2,
    name: 'Nomadic Trike',
    brand: 'Limitless',
    year: 2026,
    tagline: 'The Ultimate Off-Grid Adventure',
    description: 'Built for extreme conditions and remote expeditions. Go further, land anywhere with our ruggedized design.',
    image: '/images/nomadic1.png',
    basePrice: 8950,
    features: [
      'High-durability stainless steel',
      'All-terrain suspension system',
      'Full cage protection',
      'Expedition-ready capacity'
    ],
    href: '/paratrike/nomadic',
    color: 'from-green-600 to-green-700',
    accent: 'bg-green-100'
  }
]

export default function ParaTrikeSelectionPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-borderline py-6 px-6 sticky top-0 z-40 bg-white">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-ink hover:text-brand transition">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-32 px-6 bg-gradient-to-b from-bg2 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}>
            <h1 className="text-7xl font-black uppercase text-ink tracking-tighter mb-4">
              Paratrikes
            </h1>
            <div className="h-2 w-24 bg-brand mx-auto mb-8" />
            <p className="text-3xl font-black text-ink max-w-3xl mx-auto">
              Choose Your Adventure
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-ink2 max-w-2xl mx-auto mt-8">
            Two exceptional trike platforms designed for different flying styles. Whether you seek precision performance or rugged expedition capability, we have your perfect match.
          </motion.p>
        </div>
      </section>

      {/* Trikes Selection */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {TRIKES.map((trike, i) => (
              <motion.div
                key={trike.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, duration: 0.8 }}
                className="group">
                
                {/* Card */}
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-borderline hover:shadow-2xl hover:border-brand transition-all duration-300 h-full flex flex-col">
                  
                  {/* Image Section */}
                  <div className="relative h-96 overflow-hidden bg-bg2">
                    <Image
                      src={trike.image}
                      alt={trike.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Badge */}
                    <div className="absolute top-6 right-6">
                      <div className={`${trike.accent} text-ink px-4 py-2 rounded-full font-bold uppercase text-xs tracking-widest`}>
                        {trike.brand} — {trike.year}
                      </div>
                    </div>

                    {/* Title Over Image */}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <h2 className="text-5xl font-black uppercase text-white mb-2 leading-tight">
                        {trike.name}
                      </h2>
                      <p className="text-xl font-bold text-white/90">{trike.tagline}</p>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8 flex flex-col flex-grow">
                    <p className="text-ink leading-relaxed mb-8 flex-grow">
                      {trike.description}
                    </p>

                    {/* Features List */}
                    <div className="mb-8 space-y-3">
                      {trike.features.map((feature, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: j * 0.1 }}>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-brand rounded-full" />
                            <p className="text-ink font-semibold">{feature}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Price */}
                    <div className="mb-8 pb-8 border-t border-borderline pt-8">
                      <p className="text-sm text-ink2 uppercase tracking-widest font-bold mb-2">Starting at</p>
                      <p className="text-4xl font-black text-brand">${trike.basePrice.toLocaleString()}</p>
                    </div>

                    {/* CTA Button */}
                    <Link
                      href={trike.href}
                      className="w-full flex items-center justify-center gap-3 bg-brand text-white px-8 py-4 rounded-lg font-black uppercase tracking-widest hover:bg-brand/90 transition-all group/btn">
                      Explore {trike.name.split(' ')[0]}
                      <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16">
            <h2 className="text-5xl font-black uppercase text-ink">Choose Your Path</h2>
            <p className="text-ink2 text-lg mt-4">Both platforms deliver exceptional performance in their respective domains</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vanguard */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-xl border border-borderline p-8 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mb-4" />
              <h3 className="text-2xl font-black text-ink mb-4 uppercase">Vanguard V8.0</h3>
              <p className="text-ink2 mb-6">
                Perfect for pilots who prioritize performance, precision, and high-speed capability. Built with premium materials and advanced engineering.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-ink">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  High-performance engines
                </li>
                <li className="flex items-center gap-2 text-ink">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Precision control systems
                </li>
                <li className="flex items-center gap-2 text-ink">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Premium comfort features
                </li>
              </ul>
            </motion.div>

            {/* Nomadic */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-xl border border-borderline p-8 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-lg mb-4" />
              <h3 className="text-2xl font-black text-ink mb-4 uppercase">Nomadic Trike</h3>
              <p className="text-ink2 mb-6">
                Ideal for adventurers seeking versatility and durability in extreme conditions. Built to handle off-grid expeditions and challenging terrain.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-ink">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                  All-terrain capability
                </li>
                <li className="flex items-center gap-2 text-ink">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                  Expedition-ready features
                </li>
                <li className="flex items-center gap-2 text-ink">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                  Rugged construction
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-black uppercase text-ink mb-8">Ready to Fly?</h2>
          <p className="text-xl text-ink2 mb-12 max-w-2xl mx-auto">
            Explore both platforms, customize your perfect configuration, and experience the freedom of flight.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/paratrike/vanguard" className="inline-block bg-brand text-white px-8 py-4 font-black uppercase tracking-widest rounded-lg hover:bg-brand/90 transition">
              Vanguard V8.0
            </Link>
            <Link href="/paratrike/nomadic" className="inline-block border-2 border-brand text-brand px-8 py-4 font-black uppercase tracking-widest rounded-lg hover:bg-brand-soft transition">
              Nomadic Trike
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}