'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'

/**
 * Option row — the gallery lives in the left preview panel.
 * `thumbnail` adds a small photo on mobile, where the panel sits above the list and scrolls away.
 */
export default function OptionCard({ selected, onClick, children, thumbnail }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full p-4 border-2 rounded-xl text-left transition-all
        ${selected ? 'border-green-600 bg-green-50' : 'border-borderline hover:border-brand/50'}`}
    >
      {selected && (
        <span className="absolute top-3 right-3 flex items-center justify-center w-5 h-5 rounded-full bg-green-600">
          <Check className="w-3 h-3 text-white" />
        </span>
      )}
      {thumbnail ? (
        <div className="flex gap-3 items-start">
          <span className="relative lg:hidden h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-bg2">
            <SafeImage src={thumbnail} alt="" fill sizes="64px" className="object-contain" blankOnError />
          </span>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      ) : children}
    </motion.button>
  )
}
