'use client'

import OptionCard from '@/components/configurator/OptionCard'
import {
  NO_PARAGLIDER_ID,
  TRIKE_PARAGLIDERS,
  findTrikeParaglider,
  getParagliderColorGallery,
  getParagliderDefaultGallery,
} from '@/lib/trikeParagliderOptions'

function RadioOption({ name, value, checked, label, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer py-1">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="w-4 h-4 accent-green-600 shrink-0"
      />
      <span className="text-sm text-ink">{label}</span>
    </label>
  )
}

export default function ParagliderStep({
  selectedParagliderId,
  selectedColorId,
  selectedSize,
  onSelectParaglider,
  onSelectColor,
  onSelectSize,
  onPreviewChange,
}) {
  const updatePreview = (wingId, colorId) => {
    const selectedWing = findTrikeParaglider(wingId)
    if (!selectedWing) {
      onPreviewChange?.({ wingId, gallery: [], initialIndex: 0 })
      return
    }
    const gallery = colorId
      ? getParagliderColorGallery(selectedWing, colorId)
      : getParagliderDefaultGallery(selectedWing)
    onPreviewChange?.({ wingId, gallery, initialIndex: 0 })
  }

  const handleSelectParaglider = (id) => {
    onSelectParaglider(id)
    onSelectColor('')
    onSelectSize('')
    if (id === NO_PARAGLIDER_ID) {
      onPreviewChange?.({ wingId: NO_PARAGLIDER_ID, gallery: [], initialIndex: 0 })
    } else {
      const wing = findTrikeParaglider(id)
      const defaultColor = wing?.colors?.[0]?.id || ''
      if (defaultColor) onSelectColor(defaultColor)
      updatePreview(id, defaultColor)
    }
  }

  const handleSelectColor = (colorId, wingId = selectedParagliderId) => {
    onSelectColor(colorId)
    updatePreview(wingId, colorId)
  }

  return (
    <div>
      <h2 className="text-2xl font-black uppercase text-ink mb-6 tracking-tight">
        Choose your paraglider
      </h2>

      <div className="space-y-3">
        <OptionCard
          selected={selectedParagliderId === NO_PARAGLIDER_ID}
          onClick={() => handleSelectParaglider(NO_PARAGLIDER_ID)}
        >
          <p className="font-bold uppercase text-ink pr-8">No paraglider</p>
          <p className="text-sm text-ink2 mt-1">Trike only — add a wing later or supply your own.</p>
        </OptionCard>

        {TRIKE_PARAGLIDERS.map((item) => {
          const isSelected = selectedParagliderId === item.id

          return (
            <OptionCard
              key={item.id}
              selected={isSelected}
              onClick={() => handleSelectParaglider(item.id)}
            >
              <div className="pr-8">
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand mb-1">{item.brand}</p>
                <p className="font-bold uppercase text-ink">{item.name}</p>
              </div>
              <p className="text-sm text-ink2 mt-2 leading-relaxed">{item.description}</p>

              {isSelected && (
                <div
                  className="mt-4 pt-4 border-t border-green-200 grid sm:grid-cols-2 gap-6"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  role="presentation"
                >
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-ink mb-2">
                      Choose color
                    </p>
                    <div className="space-y-0.5">
                      {item.colors.map((color) => (
                        <RadioOption
                          key={color.id}
                          name={`paraglider-color-${item.id}`}
                          value={color.id}
                          label={color.name}
                          checked={selectedColorId === color.id}
                          onChange={(id) => handleSelectColor(id, item.id)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-ink mb-2">
                      Choose size
                    </p>
                    <div className="space-y-0.5">
                      {item.sizes.map((size) => (
                        <RadioOption
                          key={size}
                          name={`paraglider-size-${item.id}`}
                          value={size}
                          label={size}
                          checked={selectedSize === size}
                          onChange={onSelectSize}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {isSelected && item.infoUrl && (
                <a
                  href={item.infoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(ev) => ev.stopPropagation()}
                  className="inline-block text-sm text-brand font-bold hover:underline mt-3">
                  More wing info →
                </a>
              )}
            </OptionCard>
          )
        })}
      </div>
    </div>
  )
}
