'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'
import { padGallery, firstGalleryIndex } from '@/lib/configuratorImages'

function isEmptySlot(item) {
  return !item?.src || item.empty
}

/**
 * Siempre 3 slots; vacíos si no hay foto (sin placeholder).
 */
export default function OptionImageGallery({
  images = [],
  fallbackSrc = null,
  initialIndex = 0,
}) {
  const gallery = useMemo(() => padGallery(images), [images])
  const filledIndexes = useMemo(
    () => gallery.map((item, index) => (isEmptySlot(item) ? -1 : index)).filter((i) => i >= 0),
    [gallery],
  )
  const safeInitial = useMemo(() => {
    if (filledIndexes.includes(initialIndex)) return initialIndex
    return firstGalleryIndex(gallery)
  }, [gallery, initialIndex, filledIndexes])

  const [activeIndex, setActiveIndex] = useState(safeInitial)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    setActiveIndex(safeInitial)
  }, [gallery, safeInitial])

  const active = gallery[activeIndex] || gallery[0]
  const activeHasImage = !isEmptySlot(active)
  const hasMultipleFilled = filledIndexes.length > 1

  const goPrev = () => {
    if (!filledIndexes.length) return
    const pos = filledIndexes.indexOf(activeIndex)
    const nextPos = pos <= 0 ? filledIndexes.length - 1 : pos - 1
    setActiveIndex(filledIndexes[nextPos])
  }

  const goNext = () => {
    if (!filledIndexes.length) return
    const pos = filledIndexes.indexOf(activeIndex)
    const nextPos = pos < 0 || pos >= filledIndexes.length - 1 ? 0 : pos + 1
    setActiveIndex(filledIndexes[nextPos])
  }

  const openLightbox = () => {
    if (activeHasImage) setLightboxOpen(true)
  }

  return (
    <>
      <div className="space-y-4">
        <div className="relative aspect-square w-full bg-bg2 rounded-2xl overflow-hidden shadow-lg group">
          <div
            role={activeHasImage ? 'button' : undefined}
            tabIndex={activeHasImage ? 0 : -1}
            onClick={openLightbox}
            onKeyDown={(e) => {
              if (!activeHasImage) return
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                openLightbox()
              }
            }}
            className={`relative h-full w-full ${activeHasImage ? 'cursor-zoom-in' : ''}`}
            aria-label={activeHasImage ? 'Enlarge image' : undefined}
          >
            {activeHasImage ? (
              <>
                <SafeImage
                  src={active.src}
                  alt={active.alt}
                  fill
                  className="object-contain p-2 transition-transform group-hover:scale-[1.02]"
                  priority
                  fallbackSrc={fallbackSrc}
                  blankOnError
                />
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/55 text-white text-xs font-semibold px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <ZoomIn className="w-3.5 h-3.5" />
                  Enlarge
                </span>
              </>
            ) : (
              <div className="absolute inset-0 bg-bg2" aria-hidden />
            )}
          </div>

          {hasMultipleFilled && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-ink shadow-md transition hover:bg-white z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-ink shadow-md transition hover:bg-white z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1">
          {gallery.map((image, index) => {
            const filled = !isEmptySlot(image)
            return (
              <motion.button
                key={`slot-${index}`}
                type="button"
                whileTap={filled ? { scale: 0.95 } : undefined}
                disabled={!filled}
                onClick={() => {
                  if (!filled) return
                  setActiveIndex(index)
                  setLightboxOpen(true)
                }}
                className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  !filled
                    ? 'border-borderline/40 bg-bg2 cursor-default'
                    : activeIndex === index
                      ? 'border-brand'
                      : 'border-borderline hover:border-brand/50'
                }`}
                aria-label={filled ? image.alt : 'Empty image slot'}
              >
                {filled ? (
                  <SafeImage
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-contain"
                    fallbackSrc={fallbackSrc}
                    blankOnError
                  />
                ) : null}
              </motion.button>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {lightboxOpen && activeHasImage && (
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
            {hasMultipleFilled && (
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
                blankOnError
                unoptimized
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
