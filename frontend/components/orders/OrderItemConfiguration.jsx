'use client'

import { formatConfigSummary } from '@/lib/configSummary'

export default function OrderItemConfiguration({ snapshot, className = '' }) {
  const lines = formatConfigSummary(snapshot || {})
  if (!lines.length) return null

  return (
    <ul className={`mt-2 space-y-1 text-sm text-ink2 ${className}`.trim()}>
      {lines.map((line) => (
        <li key={`${line.label}-${line.value}`}>
          <span className="font-semibold text-ink">{line.label}:</span> {line.value}
        </li>
      ))}
    </ul>
  )
}
