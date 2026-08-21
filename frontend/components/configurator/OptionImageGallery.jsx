'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'
import { FALLBACK_IMAGES } from '@/lib/imageDefaults'

/**
 * Hasta 3 imágenes por opción; click en principal o miniatura abre vista ampliada.
 */
export default function OptionImageGallery({ images = [], fallbackSrc = FALLBACK_IMAGES.product }) {
  const gallery = images.length ? images : [{ src: fallbackSrc, alt: 'Product' }]
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    setActiveIndex(0)
  }, [images])

  const active = gallery[activeIndex] || gallery[0]

  const goPrev = () => setActiveIndex((i) => (i === 0 ? gallery.length - 1 : i - 1))
  const goNext = () => setActiveIndex((i) => (i === gallery.length - 1 ? 0 : i + 1))

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative aspect-square w-full bg-bg2 rounded-2xl overflow-hidden shadow-lg group cursor-zoom-in"
          aria-label="Enlarge image"
        >
          <SafeImage
            src={active.src}
            alt={active.alt}
            fill
            className="object-contain p-2 transition-transform group-hover:scale-[1.02]"
            priority
            fallbackSrc={fallbackSrc}
          />
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/55 text-white text-xs font-semibold px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-3.5 h-3.5" />
            Enlarge
          </span>
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goPrev() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-ink shadow-md transition hover:bg-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goNext() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-ink shadow-md transition hover:bg-white"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </button>

        {gallery.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {gallery.map((image, index) => (
              <motion.button
                key={`${image.src}-${index}`}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveIndex(index)
                  setLightboxOpen(true)
                }}
                className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  activeIndex === index ? 'border-brand' : 'border-borderline hover:border-brand/50'
                }`}
              >
                <SafeImage
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-contain"
                  fallbackSrc={fallbackSrc}
                />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goPrev() }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goNext() }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                  aria-label="Next"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            <div
              className="relative w-full max-w-5xl aspect-[4/3] max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <SafeImage
                src={active.src}
                alt={active.alt}
                fill
                className="object-contain"
                fallbackSrc={fallbackSrc}
                unoptimized
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
