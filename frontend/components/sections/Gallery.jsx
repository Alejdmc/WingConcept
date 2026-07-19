'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X } from 'lucide-react'

const DEFAULT_IMAGES = [
  { src: '/images/vanguard/1.png', alt: 'Vanguard V8.0' },
  { src: '/images/nomadic/1.jpg', alt: 'Nomadic Trike' },
  { src: '/images/vanguard/2.png', alt: 'Vanguard V8.0' },
  { src: '/images/vanguard/3.png', alt: 'Vanguard V8.0' },
  { src: '/images/vanguard/4.png', alt: 'Vanguard V8.0' },
  { src: '/images/vanguard/5.png', alt: 'Vanguard V8.0' },
  { src: '/images/vanguard/6.png', alt: 'Vanguard V8.0' },
  { src: '/images/vanguard/7.png', alt: 'Vanguard V8.0' },
  { src: '/images/vanguard/8.png', alt: 'Vanguard V8.0' },
  { src: '/images/vanguard/9.png', alt: 'Vanguard V8.0' },
  { src: '/images/vanguard/10.png', alt: 'Vanguard V8.0' },
]

export default function Gallery({ images = DEFAULT_IMAGES, eyebrow = 'In Flight', title = 'Gallery', bgClass = 'bg-white' }) {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className={`py-24 px-6 ${bgClass}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-brand font-bold uppercase tracking-[0.3em] text-sm mb-4">{eyebrow}</p>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink tracking-tight">{title}</h2>
          <div className="h-1 w-24 bg-brand mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <motion.button
              key={img.src}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => setOpenIndex(i)}
              className="relative aspect-square rounded-xl overflow-hidden bg-bg2 border border-borderline group"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
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
              <Image
                src={images[openIndex].src}
                alt={images[openIndex].alt}
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
