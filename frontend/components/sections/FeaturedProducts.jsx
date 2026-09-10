'use client'

import { useEffect, useState } from 'react'
import SafeImage from '@/components/ui/SafeImage'
import Reveal from '@/components/ui/Reveal'
import Link from 'next/link'
import { api } from '@/lib/api'
import { resolveProductImage } from '@/lib/productImages'
import { mergeFeaturedProducts, FEATURED_CATALOG } from '@/lib/featuredProductsContent'

const fallbackItems = mergeFeaturedProducts([])

export default function FeaturedProducts() {
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
                <Link
                  href={product.href}
                  className="relative flex flex-col h-full overflow-hidden rounded-xl border-2 backdrop-blur-sm transition-all duration-500 border-white/20 bg-neutral-900/60 hover:border-brand hover:shadow-[0_0_30px_rgba(192,57,43,0.45)] hover:bg-neutral-900/80 group">

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
                      className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      fallbackSrc={catalog?.image || '/images/nomadic/2.jpg'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  </div>

                  <div className="flex flex-col flex-1 p-6">
                    <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight leading-tight group-hover:text-brand transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-white/60 text-xs uppercase tracking-[0.15em] mt-3 min-h-[2.75rem] line-clamp-2 leading-relaxed">
                      {product.desc}
                    </p>

                    <div className="mt-auto pt-4 border-t border-white/10">
                      <span className="text-brand font-black text-2xl">{product.price}</span>
                      <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">Starting at · View trike</p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </Reveal>
    </section>
  )
}
