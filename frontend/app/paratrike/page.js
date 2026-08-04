'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import SafeImage from '@/components/ui/SafeImage'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'
import { useSiteBlocks } from '@/hooks/useCms'
import { PARATRIKE_HREFS } from '@/lib/cmsLabels'

const FALLBACK_TRIKES = [
  {
    slug: 'vanguard-v8',
    name: 'Vanguard V8.0',
    tagline: 'Performance Meets Precision',
    description: 'The ultimate high-performance trike for serious enthusiasts. Built with cutting-edge engineering and premium materials.',
    image: '/images/vanguard/1.png',
    basePrice: 5950,
    features: ['Premium aluminum construction', 'Advanced aerodynamic design', 'Multiple engine options', 'Precision-engineered suspension'],
    href: '/paratrike/vanguard',
    ctaLabel: 'Explore Vanguard',
    compare: {
      description: 'Perfect for pilots who prioritize performance, precision, and high-speed capability. Built with premium materials and advanced engineering.',
      bullets: ['High-performance engines', 'Precision control systems', 'Premium comfort features'],
    },
  },
  {
    slug: 'nomadic-trike',
    name: 'Nomadic Trike',
    tagline: 'The Ultimate Off-Grid Adventure',
    description: 'Built for extreme conditions and remote expeditions. Go further, land anywhere with our ruggedized design.',
    image: '/images/nomadic/1.jpg',
    basePrice: 8950,
    features: ['High-durability stainless steel', 'All-terrain suspension system', 'Full cage protection', 'Expedition-ready capacity'],
    href: '/paratrike/nomadic',
    ctaLabel: 'Explore Nomadic',
    compare: {
      description: 'Ideal for adventurers seeking versatility and durability in extreme conditions. Built to handle off-grid expeditions and challenging terrain.',
      bullets: ['All-terrain capability', 'Expedition-ready features', 'Rugged construction'],
    },
  },
]

function mapProductToTrike(product, fallback) {
  const extra = product.contenido_extra || {}
  const listing = extra.listing || {}
  const compare = extra.compare || fallback?.compare || { description: '', bullets: [] }
  const price = typeof product.precio_desde === 'number'
    ? product.precio_desde
    : fallback?.basePrice

  return {
    slug: product.slug,
    name: product.nombre || product.name || fallback?.name,
    tagline: listing.tagline || extra.tagline || fallback?.tagline,
    description: listing.description || product.descripcion_corta || product.desc || fallback?.description,
    image: listing.image || product.image || product.imagenes?.[0] || fallback?.image,
    basePrice: price,
    features: listing.features?.length ? listing.features : fallback?.features || [],
    href: PARATRIKE_HREFS[product.slug] || fallback?.href || '#',
    ctaLabel: listing.cta_label || fallback?.ctaLabel || `Explore ${(product.nombre || '').split(' ')[0]}`,
    compare,
  }
}

export default function ParaTrikeSelectionPage() {
  const router = useRouter()
  const { get } = useSiteBlocks('paratrike')
  const [trikes, setTrikes] = useState(FALLBACK_TRIKES)

  useEffect(() => {
    api.productos.listar({ categoria: 'paratrike', por_pagina: 50 })
      .then((res) => {
        const items = (res.items || []).filter((p) => p.activo !== false)
        if (!items.length) return
        const mapped = items.map((p) => {
          const fb = FALLBACK_TRIKES.find((t) => t.slug === p.slug)
          return mapProductToTrike(p, fb)
        })
        mapped.sort((a, b) => {
          const order = ['vanguard-v8', 'nomadic-trike']
          return order.indexOf(a.slug) - order.indexOf(b.slug)
        })
        setTrikes(mapped.length ? mapped : FALLBACK_TRIKES)
      })
      .catch(() => {})
  }, [])

  const heroBg = get('paratrike.hero.background', '/images/front1.jpg')

  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-[70vh] min-h-[540px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <SafeImage src={heroBg} alt="WINGCONCEPT Paratrikes" fill className="object-cover" priority fallbackSrc="/images/front1.jpg" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="mb-8 flex justify-center">
              <Image src="/images/logo.png" alt="Wing Concept" width={500} height={200} className="drop-shadow-lg brightness-0 invert" />
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase text-white tracking-tighter mb-4 drop-shadow-2xl">
              {get('paratrike.hero.title', 'Paratrikes')}
            </h1>
            <div className="h-2 w-24 bg-brand mx-auto" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-4xl font-black text-white max-w-3xl mx-auto leading-tight mt-8 drop-shadow-xl">
            {get('paratrike.hero.subtitle', 'Choose Your Adventure')}
          </motion.p>
        </div>
      </section>

      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {trikes.map((trike, i) => (
              <motion.div
                key={trike.slug || trike.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, duration: 0.8 }}>

                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-borderline hover:shadow-2xl hover:border-brand transition-all h-full flex flex-col">
                  <div className="relative h-96 overflow-hidden bg-white cursor-pointer" onClick={() => router.push(trike.href)}>
                    <SafeImage src={trike.image} alt={trike.name} fill className="object-contain p-6 hover:scale-105 transition-transform duration-500" fallbackSrc="/images/logo.png" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <h2 className="text-3xl sm:text-5xl font-black uppercase text-white mb-2 leading-tight">{trike.name}</h2>
                      <p className="text-xl font-bold text-white/90">{trike.tagline}</p>
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-grow cursor-pointer" onClick={() => router.push(trike.href)}>
                    <p className="text-ink leading-relaxed mb-8 flex-grow">{trike.description}</p>

                    <div className="mb-8 space-y-3">
                      {trike.features.map((feature, j) => (
                        <div key={j} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-brand rounded-full shrink-0" />
                          <p className="text-ink font-semibold">{feature}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mb-8 pb-8 border-t border-borderline pt-8">
                      <p className="text-sm text-ink2 uppercase tracking-widest font-bold mb-2">Starting at</p>
                      <p className="text-4xl font-black text-brand">
                        {typeof trike.basePrice === 'number' ? `$${trike.basePrice.toLocaleString()}` : 'Contact for pricing'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); router.push(trike.href) }}
                      className="w-full flex items-center justify-center gap-3 bg-brand text-white px-8 py-4 rounded-lg font-black uppercase tracking-widest hover:bg-brand/90 transition">
                      {trike.ctaLabel}
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-ink2 max-w-2xl mx-auto mt-16 text-center">
            {get('paratrike.selection.footer', FALLBACK_TRIKES.length ? 'Two exceptional trike platforms designed for different flying styles.' : '')}
          </motion.p>
        </div>
      </section>

      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink">{get('paratrike.compare.title', 'Choose Your Path')}</h2>
            <p className="text-ink2 text-lg mt-4">{get('paratrike.compare.subtitle', 'Both platforms deliver exceptional performance in their respective domains')}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {trikes.map((trike, i) => (
              <motion.div
                key={`compare-${trike.slug}`}
                initial={{ opacity: 0, x: i === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-xl border border-borderline p-8 hover:shadow-lg transition-all">
                <div className={`w-12 h-12 rounded-lg mb-4 ${i === 0 ? 'bg-blue-100' : 'bg-green-100'}`} />
                <h3 className="text-2xl font-black text-ink mb-4 uppercase">{trike.name}</h3>
                <p className="text-ink2 mb-6">{trike.compare?.description}</p>
                <ul className="space-y-2">
                  {(trike.compare?.bullets || []).map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2 text-ink">
                      <span className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-green-600'}`} />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink mb-8">{get('paratrike.cta.title', 'Ready to Fly?')}</h2>
          <p className="text-xl text-ink2 mb-12 max-w-2xl mx-auto">{get('paratrike.cta.text', 'Explore both platforms, customize your perfect configuration, and experience the freedom of flight.')}</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {trikes.map((trike) => (
              <button
                key={`cta-${trike.slug}`}
                type="button"
                onClick={() => router.push(trike.href)}
                className="inline-block bg-brand text-white px-8 py-4 font-black uppercase tracking-widest rounded-lg hover:bg-brand/90 transition">
                {trike.name}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
