'use client'
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'
import { filterNomadicImages, NOMADIC_GALLERY } from '@/lib/nomadicContent'
import { filterVanguardImages, VANGUARD_GALLERY, VANGUARD_HERO_IMAGE } from '@/lib/vanguardContent'

const DEFAULT_IMAGES = VANGUARD_GALLERY

function isVanguardGallery(images) {
  return (images || []).some((img) => /vanguard/i.test(img?.src || ''))
}

function isNomadicGallery(images) {
  return (images || []).some((img) => /nomadic/i.test(img?.src || ''))
}

function sanitizeGalleryImages(images) {
  if (isVanguardGallery(images)) {
    const local = filterVanguardImages((images || []).map((img) => img?.src)).filter((src) =>
      /\/images\/vanguard\//.test(src),
    )
    const uniqueLocal = [...new Set(local)]
    if (uniqueLocal.length >= 2) {
      const allowed = new Set(uniqueLocal)
      const cleaned = (images || []).filter((img) => img?.src && allowed.has(img.src))
      if (cleaned.length >= 2) return cleaned
    }
    return VANGUARD_GALLERY
  }

  const srcs = (images || []).map((img) => img?.src).filter(Boolean)
  const filteredSrcs = filterNomadicImages(srcs)
  if (!filteredSrcs.length) {
    if (isNomadicGallery(images)) return NOMADIC_GALLERY
    return images?.length ? DEFAULT_IMAGES : NOMADIC_GALLERY
  }
  const allowed = new Set(filteredSrcs)
  const cleaned = (images || []).filter((img) => img?.src && allowed.has(img.src))
  if (cleaned.length) return cleaned
  return isNomadicGallery(images) ? NOMADIC_GALLERY : VANGUARD_GALLERY
}

export default function Gallery({ images = DEFAULT_IMAGES, eyebrow = 'In Flight', title = 'Gallery', bgClass = 'bg-white' }) {
  const [openIndex, setOpenIndex] = useState(null)
  const galleryImages = useMemo(() => sanitizeGalleryImages(images), [images])

  return (
    <section className={`py-24 px-6 ${bgClass}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-brand font-bold uppercase tracking-[0.3em] text-sm mb-4">{eyebrow}</p>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink tracking-tight">{title}</h2>
          <div className="h-1 w-24 bg-brand mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map((img, i) => (
            <motion.button
              key={`${img.src}-${i}`}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => setOpenIndex(i)}
              className="relative aspect-square rounded-xl overflow-hidden bg-bg2 border border-borderline group"
            >
              <SafeImage
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                fallbackSrc={/\/images\/vanguard\//.test(img.src) ? VANGUARD_HERO_IMAGE : undefined}
              />
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {openIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenIndex(null)}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(null)}
              className="absolute top-6 right-6 text-white/80 hover:text-white"
              aria-label="Close"
            >
              <X className="w-8 h-8" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl aspect-square"
            >
              <SafeImage
                src={galleryImages[openIndex].src}
                alt={galleryImages[openIndex].alt}
                fill
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
