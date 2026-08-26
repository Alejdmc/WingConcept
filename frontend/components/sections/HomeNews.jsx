'use client'

import Link from 'next/link'
import { Calendar, Tag, ArrowRight } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'
import Reveal from '@/components/ui/Reveal'
import { api } from '@/lib/api'
import { useContenido } from '@/hooks/useContenido'
import { FALLBACK_IMAGES } from '@/lib/imageDefaults'
import { NEWS_FALLBACK } from '@/lib/staticContent'

function articleHref(article) {
  if (article.href) return article.href
  if (typeof article.capacidad === 'string' && article.capacidad.startsWith('/')) {
    return article.capacidad
  }
  return null
}

export default function HomeNews() {
  const { content, loading } = useContenido('news', () => api.contenidos.news(), NEWS_FALLBACK)

  const noticias = content.noticias?.length
    ? content.noticias
    : (content.items?.length ? content.items : NEWS_FALLBACK.noticias)

  return (
    <section id="news" className="py-16 sm:py-24 px-4 sm:px-6 bg-bg2 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-10 sm:mb-16">
          <p className="text-brand font-bold uppercase tracking-[0.3em] text-sm mb-4">W.C News</p>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink mb-4 tracking-tighter">
            Latest News
          </h2>
          <p className="text-ink2 text-base sm:text-lg max-w-2xl mx-auto">
            {content.intro?.descripcion || NEWS_FALLBACK.intro.descripcion}
          </p>
          <div className="h-1 w-16 bg-brand mx-auto mt-6" />
        </Reveal>

        {loading ? (
          <p className="text-center text-ink2">Loading news...</p>
        ) : noticias.length === 0 ? (
          <p className="text-center text-ink2">New articles coming soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {noticias.map((article, i) => {
              const href = articleHref(article)
              const CardWrapper = href ? Link : 'div'
              const cardProps = href ? { href } : {}

              return (
                <Reveal key={article.id} delay={i * 0.05} viewport>
                  <article className="h-full bg-white rounded-2xl overflow-hidden border border-borderline hover:shadow-lg hover:border-brand transition-all">
                    <CardWrapper {...cardProps} className={href ? 'block group h-full flex flex-col' : 'h-full flex flex-col'}>
                      <div className="relative h-52 bg-bg2 shrink-0">
                        <SafeImage
                          src={article.imagen}
                          alt={article.titulo}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          fallbackSrc={FALLBACK_IMAGES.expedition}
                        />
                        {article.ubicacion && (
                          <div className="absolute top-4 right-4 bg-brand text-white px-3 py-1.5 rounded-full font-bold text-xs uppercase">
                            {article.ubicacion}
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-xl font-black text-ink mb-3 uppercase group-hover:text-brand transition-colors">
                          {article.titulo}
                        </h3>

                        {(article.fecha || article.ubicacion) && (
                          <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-borderline text-ink2 text-sm">
                            {article.fecha && (
                              <span className="inline-flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {article.fecha}
                              </span>
                            )}
                            {article.ubicacion && (
                              <span className="inline-flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                {article.ubicacion}
                              </span>
                            )}
                          </div>
                        )}

                        {article.descripcion && (
                          <p className="text-ink2 text-sm leading-relaxed mb-4 line-clamp-3">{article.descripcion}</p>
                        )}

                        {href && (
                          <p className="mt-auto inline-flex items-center gap-2 text-brand font-bold uppercase text-xs tracking-wide">
                            View section
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </p>
                        )}
                      </div>
                    </CardWrapper>
                  </article>
                </Reveal>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
