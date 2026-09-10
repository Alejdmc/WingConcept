'use client'

import { useState } from 'react'
import { ChevronDown, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SafeImage from '@/components/ui/SafeImage'

/** Collapsible technical sheet — layout per paraglider UI guide. */
export default function ParagliderSpecSheet({ wing }) {
  const [open, setOpen] = useState(false)

  if (!wing) return null

  const specs = wing.techSpecs || []

  return (
    <div className="border border-borderline rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left font-black uppercase tracking-wide text-sm text-ink hover:bg-bg2 transition-colors"
        aria-expanded={open}
      >
        <span>Technical sheet</span>
        <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-borderline space-y-4">
              {wing.techImages?.length > 0 && (
                <div className="space-y-3">
                  {wing.techImages.map((src) => (
                    <div key={src} className="relative w-full aspect-[16/9] bg-bg2 rounded-lg overflow-hidden">
                      <SafeImage src={src} alt={`${wing.name} technical diagram`} fill className="object-contain p-2" blankOnError />
                    </div>
                  ))}
                </div>
              )}

              {specs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-bg2">
                        {specs[0].columns.map((col) => (
                          <th key={col} className="px-3 py-2 font-bold uppercase text-ink2 border border-borderline">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {specs[0].rows.map((row) => (
                        <tr key={row.label}>
                          <td className="px-3 py-2 font-semibold text-ink border border-borderline whitespace-nowrap">
                            {row.label}
                          </td>
                          {row.spanAll ? (
                            <td
                              colSpan={specs[0].columns.length - 1}
                              className="px-3 py-2 text-ink2 border border-borderline text-center"
                            >
                              {row.values[0] || '—'}
                            </td>
                          ) : (
                            row.values.map((val, i) => (
                              <td
                                key={`${row.label}-${i}`}
                                className="px-3 py-2 text-ink2 border border-borderline"
                              >
                                {val || '—'}
                              </td>
                            ))
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-ink2 leading-relaxed">
                  Full technical specifications and available sizes are on the manufacturer page.
                </p>
              )}

              {wing.infoUrl && (
                <a
                  href={wing.infoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:underline"
                >
                  View full specs on manufacturer site
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
