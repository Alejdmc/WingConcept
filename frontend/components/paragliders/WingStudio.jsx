'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, X } from 'lucide-react'
import ParagliderPreviewPanel from '@/components/configurator/ParagliderPreviewPanel'
import OptionImageGallery from '@/components/configurator/OptionImageGallery'
import ParagliderSpecSheet from '@/components/configurator/ParagliderSpecSheet'
import {
  getParagliderColorGallery,
  getParagliderDefaultGallery,
} from '@/lib/trikeParagliderOptions'

/** Normaliza un ala del catálogo /paragliders al formato de los configuradores. */
export function toStudioWing(item) {
  const fallback = item.image ? [{ src: item.image, alt: `${item.brand || ''} ${item.name}`.trim() }] : []
  return {
    ...item,
    techImages: item.techImages?.length ? item.techImages : (item.techImage ? [item.techImage] : []),
    techSpecs: item.techSpecs || [],
    galleryImages: item.galleryImages?.length ? item.galleryImages : fallback,
    colors: item.colors || [],
    sizes: item.sizes?.length ? item.sizes : ['Standard'],
  }
}

export function wingGallery(wing, colorId) {
  return colorId ? getParagliderColorGallery(wing, colorId) : getParagliderDefaultGallery(wing)
}

/** Primera foto del color (no la ficha técnica) para la tarjeta. */
export function wingCardImage(wing, colorId) {
  const color = wing.colors.find((c) => c.id === colorId)
  return color?.images?.[0]?.src || wing.galleryImages?.[0]?.src || wing.techImages?.[0] || wing.image || null
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-lg border-2 text-xs font-bold uppercase tracking-wide transition-all ${
        active ? 'border-green-600 bg-green-50 text-ink' : 'border-borderline text-ink2 hover:border-brand/50'
      }`}
    >
      {children}
    </button>
  )
}

export function WingPickers({ wing, colorId, size, onSelectColor, onSelectSize }) {
  const showSizes = wing.sizes.length > 1 || wing.sizes[0] !== 'Standard'
  return (
    <div className="space-y-4">
      {wing.colors.length > 0 && (
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-ink mb-2">Choose color</p>
          <div className="flex flex-wrap gap-2">
            {wing.colors.map((c) => (
              <Chip key={c.id} active={colorId === c.id} onClick={() => onSelectColor(c.id)}>{c.name}</Chip>
            ))}
          </div>
        </div>
      )}
      {showSizes && (
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-ink mb-2">Choose size</p>
          <div className="flex flex-wrap gap-2">
            {wing.sizes.map((s) => (
              <Chip key={s} active={size === s} onClick={() => onSelectSize(s)}>{s}</Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Vista "configurador" de un ala: ficha técnica, galería por color y selección de color/talla.
 */
export default function WingStudio({ open, onClose, wing, colorId, size, onSelectColor, onSelectSize, price, actions }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return undefined
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const gallery = useMemo(() => wingGallery(wing, colorId), [wing, colorId])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[900] bg-black/60 flex items-start sm:items-center justify-center p-0 sm:p-6 overflow-y-auto"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${wing.brand} ${wing.name}`}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            className="relative bg-white w-full max-w-5xl sm:rounded-2xl shadow-2xl p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 z-10 rounded-full bg-bg2 p-2 text-ink hover:bg-brand hover:text-white transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              {wing.colors.length > 0 ? (
                <ParagliderPreviewPanel
                  wing={wing}
                  previewGallery={gallery}
                  selectedColorId={colorId}
                  onSelectColor={(id) => onSelectColor(id)}
                />
              ) : (
                <div className="space-y-4">
                  {(wing.techSpecs.length > 0 || wing.techImages.length > 0) && <ParagliderSpecSheet wing={wing} />}
                  <OptionImageGallery images={gallery} fallbackSrc={null} />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-5">
              <div className="pr-10">
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand mb-1">{wing.brand}</p>
                <h2 className="text-2xl font-black uppercase text-ink">{wing.name}</h2>
                {wing.description && <p className="text-ink2 text-sm mt-3 leading-relaxed">{wing.description}</p>}
              </div>

              <WingPickers
                wing={wing}
                colorId={colorId}
                size={size}
                onSelectColor={onSelectColor}
                onSelectSize={onSelectSize}
              />

              <p className="text-2xl font-black text-brand">{price}</p>

              {wing.infoUrl && (
                <a href={wing.infoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold uppercase text-brand hover:underline">
                  More wing info <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {actions}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
