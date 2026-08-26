'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Check, X, ChevronLeft, ChevronRight } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'
import { FALLBACK_IMAGES } from '@/lib/imageDefaults'
import { useCart } from '@/hooks/useCart'
import { loadPublicCatalog, parseListPrice } from '@/lib/loadPartsCatalog'
import { resolveAccessoryImage, resolveAccessoryGallery, normalizeAccessoryId } from '@/lib/accessoryImages'
import PartCardImageCarousel from '@/components/parts/PartCardImageCarousel'

const MODEL_LABEL = { vanguard: 'Vanguard', nomadic: 'Nomadic' }

function mapApiProduct(item) {
  const accessoryId = normalizeAccessoryId(item.slug || item.id)
  const price = parseListPrice(item)
  const images = resolveAccessoryGallery(accessoryId, {
    cmsImage: item.image || item.imagenes?.[0],
    productImages: item.imagenes,
    productoId: item.id,
  })
  return {
    id: item.id,
    productoId: item.id,
    slug: item.slug,
    name: item.name || item.nombre,
    price,
    image: images[0] || resolveAccessoryImage(accessoryId, item.image || item.imagenes?.[0]),
    images,
    description: item.desc || item.descripcion_corta || item.descripcion || '',
    compatibleWith: item.compatible_with?.length ? item.compatible_with : ['vanguard', 'nomadic'],
  }
}

export default function PartsPage() {
  const [parts, setParts] = useState([])
  const [accessories, setAccessories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [partsRows, accRows] = await Promise.all([
          loadPublicCatalog('repuestos'),
          loadPublicCatalog('accesorios'),
        ])
        setParts(partsRows.map(mapApiProduct))
        setAccessories(accRows.map(mapApiProduct))
      } catch {
        setParts([])
        setAccessories([])
        setError('Could not load catalog from the server.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky-below-nav bg-white border-b border-borderline py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/paratrike"
            className="group inline-flex items-center gap-2 pl-2 pr-4 py-2 rounded-full border border-borderline bg-white text-ink text-sm font-bold uppercase tracking-wide hover:border-brand hover:text-brand hover:bg-brand-soft transition-all">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-bg2 group-hover:bg-brand transition-colors">
              <ArrowLeft className="w-4 h-4 text-ink2 group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
            </span>
            Back
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-ink">Parts & Accessories</h1>
          <p className="text-xl text-ink2 mt-2">Structural parts and accessories sold separately for Vanguard and Nomadic</p>
          {error && (
            <p className="text-sm text-amber-700 mt-2">{error}</p>
          )}
        </div>

        {loading && (
          <p className="text-sm text-ink2 mb-4">Loading catalog...</p>
        )}

        <>
          <section className="mb-16">
            <h2 className="text-xl font-black uppercase tracking-tight text-ink mb-6">Parts</h2>
            {!loading && parts.length === 0 ? (
              <p className="text-ink2">No parts listed yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {parts.map((part) => (
                  <PartCard key={part.productoId || part.id} part={part} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight text-ink mb-6">Accessories</h2>
            {!loading && accessories.length === 0 ? (
              <p className="text-ink2">No accessories listed yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {accessories.map((accessory) => (
                  <PartCard key={accessory.productoId || accessory.id} part={accessory} />
                ))}
              </div>
            )}
          </section>
        </>
      </div>
    </div>
  )
}

function PartCard({ part }) {
  const { addToCart } = useCart()
  const [status, setStatus] = useState('idle')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const hasPrice = typeof part.price === 'number' && part.price > 0
  const canAddToCart = Boolean(part.productoId) && hasPrice
  const galleryImages = part.images?.length ? part.images : part.image ? [part.image] : []

  const openLightbox = (index = 0) => {
    if (!galleryImages.length) return
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const lightboxPrev = (event) => {
    event.stopPropagation()
    setLightboxIndex((index) => (index - 1 + galleryImages.length) % galleryImages.length)
  }

  const lightboxNext = (event) => {
    event.stopPropagation()
    setLightboxIndex((index) => (index + 1) % galleryImages.length)
  }

  const handleAdd = async () => {
    if (!part.productoId) return
    setStatus('loading')
    try {
      await addToCart({ producto_id: part.productoId, cantidad: 1 })
      setStatus('added')
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4 }}
      className="border-2 border-borderline rounded-xl overflow-hidden hover:border-brand/50 transition-all flex flex-col">
      <PartCardImageCarousel
        images={galleryImages}
        alt={part.name}
        fallbackSrc={FALLBACK_IMAGES.part}
        onEnlarge={openLightbox}
      />

      <div className="p-4 flex flex-col flex-1">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {(part.compatibleWith || []).map((m) => (
            <span key={m} className="text-[10px] font-bold uppercase tracking-wide text-brand bg-brand-soft px-2 py-0.5 rounded-full">
              {MODEL_LABEL[m] || m}
            </span>
          ))}
        </div>

        <p className="text-sm font-bold uppercase text-ink">{part.name}</p>
        {part.description && (
          <p className="text-xs text-ink2 mt-1.5 line-clamp-3 flex-1">{part.description}</p>
        )}
        {hasPrice ? (
          <p className="text-xl font-black text-brand mt-2 mb-3">${part.price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
        ) : (
          <p className="text-xl font-black text-ink2 mt-2 mb-3">Price on request</p>
        )}

        {canAddToCart ? (
          <button
            type="button"
            onClick={handleAdd}
            disabled={status === 'loading'}
            className="mt-auto inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand text-white font-black uppercase tracking-wide text-xs hover:bg-brand/90 disabled:opacity-50 transition-all w-full">
            {status === 'added' ? (
              <>
                <Check className="w-4 h-4" /> Added
              </>
            ) : status === 'error' ? (
              <>Try again</>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                {status === 'loading' ? 'Adding...' : 'Add to Cart'}
              </>
            )}
          </button>
        ) : hasPrice ? (
          <button
            type="button"
            disabled
            className="mt-auto inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-bg2 text-ink2 font-black uppercase tracking-wide text-xs w-full cursor-not-allowed">
            <ShoppingCart className="w-4 h-4 opacity-50" />
            Unavailable
          </button>
        ) : (
          <Link
            href="/contact"
            className="mt-auto inline-flex items-center justify-center gap-2 py-2.5 rounded-lg border border-brand text-brand font-black uppercase tracking-wide text-xs hover:bg-brand-soft transition-all w-full">
            Contact Us
          </Link>
        )}

        {status === 'error' && canAddToCart && (
          <p className="text-red-600 text-xs font-semibold mt-2">Could not add to cart.</p>
        )}
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6"
            onClick={() => setLightboxOpen(false)}>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 text-white/80 hover:text-white"
              aria-label="Close">
              <X className="w-8 h-8" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl aspect-square">
              <SafeImage
                src={galleryImages[lightboxIndex]}
                alt={part.name}
                fill
                className="object-contain"
                fallbackSrc={FALLBACK_IMAGES.part}
                unoptimized
              />
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={lightboxPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={lightboxNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
