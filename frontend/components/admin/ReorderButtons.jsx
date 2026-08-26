'use client'

import { ChevronUp, ChevronDown, GripVertical } from 'lucide-react'

export default function ReorderButtons({ index, total, onMoveUp, onMoveDown, disabled = false, showGrip = true }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {showGrip && (
        <span className="text-ink2/40 p-1" aria-hidden>
          <GripVertical className="w-4 h-4" />
        </span>
      )}
      <button
        type="button"
        title="Move up"
        disabled={disabled || index <= 0}
        onClick={onMoveUp}
        className="p-1.5 rounded border border-borderline hover:border-brand disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronUp className="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Move down"
        disabled={disabled || index >= total - 1}
        onClick={onMoveDown}
        className="p-1.5 rounded border border-borderline hover:border-brand disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  )
}
