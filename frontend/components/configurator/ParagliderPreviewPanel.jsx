'use client'

import OptionImageGallery from '@/components/configurator/OptionImageGallery'
import ParagliderSpecSheet from '@/components/configurator/ParagliderSpecSheet'
import SafeImage from '@/components/ui/SafeImage'
import { getParagliderColorGallery } from '@/lib/trikeParagliderOptions'

/**
 * Left preview column for the paraglider step — follows the UI guide mockup:
 * collapsible technical sheet, main wing photo, color thumbnails below.
 */
export default function ParagliderPreviewPanel({
  wing,
  previewGallery,
  selectedColorId,
  onSelectColor,
}) {
  if (!wing) return null

  return (
    <div className="space-y-4">
      <ParagliderSpecSheet wing={wing} />

      <OptionImageGallery images={previewGallery} fallbackSrc={null} />

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-ink2">Colors</p>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {wing.colors.map((color) => {
            const isActive = selectedColorId === color.id
            const thumbSrc = color.thumb || color.images[0]?.src

            return (
              <button
                key={color.id}
                type="button"
                onClick={() => onSelectColor(color.id, getParagliderColorGallery(wing, color.id))}
                className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  isActive ? 'border-brand' : 'border-borderline hover:border-brand/50'
                }`}
                aria-label={color.name}
                aria-pressed={isActive}
              >
                {thumbSrc ? (
                  <SafeImage
                    src={thumbSrc}
                    alt={color.name}
                    fill
                    className="object-contain p-1"
                    blankOnError
                  />
                ) : (
                  <span
                    className="absolute inset-0 flex items-end justify-center pb-1"
                    style={{ backgroundColor: color.swatch }}
                    aria-hidden
                  >
                    <span className="text-[9px] font-bold uppercase text-white drop-shadow px-1 text-center leading-tight">
                      {color.name}
                    </span>
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
