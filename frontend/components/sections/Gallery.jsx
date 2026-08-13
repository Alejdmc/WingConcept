'use client'
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'
import { NOMADIC_GALLERY } from '@/lib/nomadicContent'
import { VANGUARD_GALLERY, VANGUARD_HERO_IMAGE } from '@/lib/vanguardContent'

/** preset forces on-disk gallery — ignores CMS duplicates / broken Supabase URLs. */
export default function Gallery({
  images = VANGUARD_GALLERY,
  preset,
  eyebrow = 'In Flight',
  title = 'Gallery',
  bgClass = 'bg-white',
}) {
  const [openIndex, setOpenIndex] = useState(null)

  const galleryImages = useMemo(() => {
    if (preset === 'vanguard') return VANGUARD_GALLERY
    if (preset === 'nomadic') return NOMADIC_GALLERY
    return images?.length ? images : VANGUARD_GALLERY
  }, [images, preset])

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
                fallbackSrc={VANGUARD_HERO_IMAGE}
                unoptimized
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
                fallbackSrc={VANGUARD_HERO_IMAGE}
                unoptimized
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
