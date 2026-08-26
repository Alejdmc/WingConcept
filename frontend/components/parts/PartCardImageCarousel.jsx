'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'

/**
 * Product card image area — cycles through gallery on hover when multiple images exist.
 */
export default function PartCardImageCarousel({
  images = [],
  alt,
  fallbackSrc,
  onEnlarge,
}) {
  const gallery = (images || []).filter(Boolean)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hovering, setHovering] = useState(false)
  const hasMultiple = gallery.length > 1
  const activeSrc = gallery[activeIndex] || gallery[0]

  const goPrev = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setActiveIndex((index) => (index - 1 + gallery.length) % gallery.length)
  }

  const goNext = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setActiveIndex((index) => (index + 1) % gallery.length)
  }

  const handleLeave = () => {
    setHovering(false)
    setActiveIndex(0)
  }

  const openLightbox = () => onEnlarge?.(activeIndex)

  if (!activeSrc) {
    return (
      <div className="relative aspect-square bg-bg2" aria-hidden />
    )
  }

  return (
    <div
      className="relative aspect-square bg-bg2 group w-full"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={handleLeave}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={openLightbox}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openLightbox()
          }
        }}
        className="relative h-full w-full cursor-zoom-in"
        aria-label={`Enlarge ${alt}`}
      >
        <SafeImage
          src={activeSrc}
          alt={alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          fallbackSrc={fallbackSrc}
          unoptimized
        />
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/55 text-white text-[10px] font-semibold px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <ZoomIn className="w-3 h-3" /> Enlarge
        </span>
      </div>

      {hasMultiple && hovering && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-ink shadow-md transition hover:bg-white z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-ink shadow-md transition hover:bg-white z-10"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="absolute bottom-2 left-2 rounded-full bg-black/55 text-white text-[10px] font-semibold px-2 py-1 pointer-events-none">
            {activeIndex + 1}/{gallery.length}
          </span>
        </>
      )}
    </div>
  )
}
