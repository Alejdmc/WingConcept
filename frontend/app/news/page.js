'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Calendar, Tag, ArrowRight } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'
import Reveal from '@/components/ui/Reveal'
import { api } from '@/lib/api'
import { useContenido } from '@/hooks/useContenido'
import { FALLBACK_IMAGES } from '@/lib/imageDefaults'

import { NEWS_FALLBACK } from '@/lib/staticContent'

const FALLBACK = NEWS_FALLBACK

export default function NewsPage() {
  const { content, loading } = useContenido('news', () => api.contenidos.news(), FALLBACK)

  const hero = content.hero
  const intro = content.intro
  const noticias = content.noticias?.length
    ? content.noticias
    : (content.items?.length ? content.items : FALLBACK.noticias)

  function articleHref(article) {
    if (article.href) return article.href
    if (typeof article.capacidad === 'string' && article.capacidad.startsWith('/')) {
      return article.capacidad
    }
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky-below-nav bg-white border-b border-borderline py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 pl-2 pr-4 py-2 rounded-full border border-borderline bg-white text-ink text-sm font-bold uppercase tracking-wide hover:border-brand hover:text-brand hover:bg-brand-soft transition-all">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-bg2 group-hover:bg-brand transition-colors">
              <ArrowLeft className="w-4 h-4 text-ink2 group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
            </span>
            Back
          </Link>
        </div>
      </div>

      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <SafeImage src={hero.imagen} alt="News" fill className="object-cover" priority fallbackSrc="/images/front1.jpg" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <Reveal>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase text-white tracking-tighter mb-4 drop-shadow-2xl">
              {hero.titulo}
            </h1>
            <div className="h-2 w-24 bg-brand mx-auto mb-8" />
            <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-xl">{hero.descripcion}</p>
          </Reveal>
        </div>
      </section>

      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-lg text-ink leading-relaxed">
            {intro.descripcion}
          </motion.p>
        </div>
      </section>

      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink mb-4">Latest News</h2>
            <div className="h-1 w-16 bg-brand mx-auto" />
          </motion.div>

          {loading ? (
            <p className="text-center text-ink2">Loading news...</p>
          ) : noticias.length === 0 ? (
            <p className="text-center text-ink2">New articles coming soon.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {noticias.map((article, i) => {
                const href = articleHref(article)
                const CardWrapper = href ? Link : 'div'
                const cardProps = href ? { href } : {}

                return (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden border border-borderline hover:shadow-lg hover:border-brand transition-all">

                  <CardWrapper {...cardProps} className={href ? 'block group' : undefined}>
                  <div className="relative h-64 bg-bg2">
                    <SafeImage
                      src={article.imagen}
                      alt={article.titulo}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      fallbackSrc={FALLBACK_IMAGES.expedition}
                    />
                    {article.ubicacion && (
                      <div className="absolute top-4 right-4 bg-brand text-white px-4 py-2 rounded-full font-bold text-sm uppercase">
                        {article.ubicacion}
                      </div>
                    )}
                  </div>

                  <div className="p-8">
                    <h3 className="text-2xl font-black text-ink mb-4 uppercase group-hover:text-brand transition-colors">{article.titulo}</h3>

                    <div className="space-y-3 mb-6 pb-6 border-b border-borderline">
                      {article.fecha && (
                        <div className="flex items-center gap-3 text-ink2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{article.fecha}</span>
                        </div>
                      )}
                      {article.ubicacion && (
                        <div className="flex items-center gap-3 text-ink2">
                          <Tag className="w-4 h-4" />
                          <span className="text-sm">{article.ubicacion}</span>
                        </div>
                      )}
                    </div>

                    {article.descripcion && (
                      <p className="text-ink mb-6 leading-relaxed">{article.descripcion}</p>
                    )}

                    {article.highlights?.length > 0 && (
                      <div>
                        <p className="font-bold text-ink mb-3 uppercase text-sm tracking-widest">Highlights:</p>
                        <ul className="space-y-2">
                          {article.highlights.map((item, j) => (
                            <li key={j} className="flex items-center gap-2 text-ink2 text-sm">
                              <div className="w-1.5 h-1.5 bg-brand rounded-full" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {href && (
                      <p className="mt-6 inline-flex items-center gap-2 text-brand font-bold uppercase text-sm tracking-wide">
                        View section <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </p>
                    )}
                  </div>
                  </CardWrapper>
                </motion.article>
              )})}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 px-6 bg-gradient-to-r from-brand to-brand/80">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-5xl font-black uppercase mb-8">Stay in the Loop</h2>
          <p className="text-xl mb-12">Contact us for press inquiries, product updates, or to share your Wing Concept story.</p>
          <Link href="/contact" className="inline-block bg-white text-brand px-12 py-5 font-black uppercase tracking-widest rounded-lg hover:bg-white/90 transition">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  )
}
