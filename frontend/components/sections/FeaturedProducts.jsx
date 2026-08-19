'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SafeImage from '@/components/ui/SafeImage'
import Reveal from '@/components/ui/Reveal'
import Link from 'next/link'
import { api } from '@/lib/api'
import { resolveProductImage } from '@/lib/productImages'
import { mergeFeaturedProducts, FEATURED_CATALOG } from '@/lib/featuredProductsContent'
import { ArrowRight, Zap } from 'lucide-react'

const fallbackItems = mergeFeaturedProducts([])

export default function FeaturedProducts() {
  const [selectedId, setSelectedId] = useState(null)
  const [items, setItems] = useState(fallbackItems)

  useEffect(() => {
    api.productos.destacados()
      .then((featured) => {
        setItems(mergeFeaturedProducts(featured || []))
      })
      .catch(() => {})
  }, [])

  return (
    <section
      id="featured-products"
      className="py-32 px-6 scroll-mt-24 relative bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: 'url(/images/cloudfeatured.png)' }}>

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />

      <Reveal className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <Reveal delay={0.1}>
            <p className="text-brand font-bold uppercase tracking-[0.3em] text-sm mb-4">Premium Selection</p>
          </Reveal>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase text-white mb-6 tracking-tight">
            Featured Products
          </h2>
          <Reveal delay={0.2} className="h-1 bg-gradient-to-r from-transparent via-brand to-transparent max-w-md mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-stretch">
          {items.map((product, i) => {
            const catalog = FEATURED_CATALOG[product.slug]
            const imageSrc = resolveProductImage(
              { slug: product.slug, imagenes: [product.image], contenido_extra: { listing: { image: product.image } } },
              catalog?.image || product.image,
            )

            return (
              <Reveal
                key={product.id}
                delay={i * 0.1}
                viewport
                className="h-full">
                <article
                  className="h-full flex flex-col cursor-pointer"
                  onClick={() => setSelectedId(selectedId === product.id ? null : product.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedId(selectedId === product.id ? null : product.id)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={selectedId === product.id}>
                  <motion.div
                    layout
                    className={`relative flex flex-col h-full overflow-hidden rounded-xl border-2 backdrop-blur-sm transition-all duration-500
                      ${selectedId === product.id
                        ? 'border-brand shadow-[0_0_40px_rgba(192,57,43,0.6)] bg-neutral-900/80'
                        : 'border-white/20 bg-neutral-900/60 hover:border-brand/50 hover:shadow-[0_0_30px_rgba(192,57,43,0.3)]'}`}>

                    <div className="absolute top-4 right-4 z-20">
                      <span className="bg-brand text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                        {product.badge || 'Featured'}
                      </span>
                    </div>

                    <div className="relative h-64 w-full shrink-0 bg-gradient-to-b from-neutral-800 to-neutral-900 overflow-hidden">
                      <SafeImage
                        src={imageSrc}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-contain p-4 transition-transform duration-500 hover:scale-105"
                        fallbackSrc={catalog?.image || '/images/nomadic/2.jpg'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    </div>

                    <div className="flex flex-col flex-1 p-6">
                      <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight leading-tight">
                        {product.name}
                      </h3>
                      <p className="text-white/60 text-xs uppercase tracking-[0.15em] mt-3 min-h-[2.75rem] line-clamp-2 leading-relaxed">
                        {product.desc}
                      </p>

                      <div className="mt-auto pt-4 border-t border-white/10">
                        <span className="text-brand font-black text-2xl">{product.price}</span>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">Starting at</p>
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {selectedId === product.id && (
                        <motion.div
                          key="details"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden border-t border-brand/50 bg-gradient-to-b from-neutral-900 to-black">
                          <div className="p-6 space-y-4">
                            <div>
                              <p className="text-white/40 text-xs uppercase tracking-[0.15em] mb-2">Key features</p>
                              <div className="flex items-start gap-2 text-white/90 text-sm min-h-[2.5rem]">
                                <Zap className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{product.specs}</span>
                              </div>
                            </div>

                            <Link
                              href={product.href}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full py-3 bg-gradient-to-r from-brand to-brand/80 hover:from-brand/90 hover:to-brand/70 text-white font-black uppercase tracking-widest text-sm rounded-lg flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(192,57,43,0.5)]">
                              Discover More
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </Reveal>
    </section>
  )
}
