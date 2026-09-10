'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import {
  CHASSIS_COLOR_PRESETS,
  CUSTOM_COLOR_ID,
  CUSTOM_COLOR_SURCHARGE,
} from '@/lib/chassisColors'
import OptionCard from '@/components/configurator/OptionCard'

export default function ChassisColorStep({
  selectedColorId,
  customColorText,
  onSelectPreset,
  onSelectCustom,
  onCustomTextChange,
  presets = CHASSIS_COLOR_PRESETS,
  customColorId = CUSTOM_COLOR_ID,
  customSurcharge = CUSTOM_COLOR_SURCHARGE,
  title = 'Chassis Color. Choose your finish',
  presetIncludedLabel = 'Included in base price',
}) {
  return (
    <div>
      <h2 className="text-2xl font-black uppercase text-ink mb-6 tracking-tight">
        {title}
      </h2>
      <div className="space-y-3">
        {presets.map((color) => (
          <OptionCard
            key={color.id}
            selected={selectedColorId === color.id}
            onClick={() => onSelectPreset(color)}
          >
            <div className="flex items-center gap-4 pr-8">
              <span
                className="w-12 h-12 rounded-full shrink-0 border-2 border-borderline flex items-center justify-center overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${color.hex} 50%, ${color.accent} 50%)` }}
                aria-hidden
              />
              <div>
                <p className="font-bold uppercase text-ink">{color.name}</p>
                <p className="text-sm text-ink2 mt-1">{presetIncludedLabel}</p>
              </div>
            </div>
          </OptionCard>
        ))}

        <OptionCard
          selected={selectedColorId === customColorId}
          onClick={onSelectCustom}
        >
          <div className="pr-8">
            <p className="font-bold uppercase text-ink">Custom Color</p>
            <p className="text-sm text-ink2 mt-1">
              Describe your desired color — +${customSurcharge}
            </p>
            {selectedColorId === customColorId && (
              <input
                type="text"
                value={customColorText}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onCustomTextChange(e.target.value)}
                placeholder="e.g. Matte black & gold accents"
                maxLength={120}
                className="mt-3 w-full px-3 py-2 border border-borderline rounded-lg text-sm text-ink focus:outline-none focus:border-brand"
              />
            )}
          </div>
        </OptionCard>
      </div>
    </div>
  )
}
