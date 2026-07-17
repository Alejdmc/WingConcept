'use client'

import { Check } from 'lucide-react'

export default function WizardProgress({ steps, currentStep, onStepClick }) {
  return (
    <div className="flex items-center max-w-4xl mx-auto mb-10 overflow-x-auto pb-2">
      {steps.map((label, i) => {
        const isDone = i < currentStep
        const isActive = i === currentStep
        const clickable = isDone && !!onStepClick

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick(i)}
              className={`flex flex-col items-center gap-2 shrink-0 ${clickable ? 'cursor-pointer' : 'cursor-default'}`}>
              <span
                className={`flex items-center justify-center w-9 h-9 rounded-full border-2 text-sm font-bold transition-all
                  ${isDone ? 'bg-green-600 border-green-600 text-white' : isActive ? 'border-brand text-brand bg-brand-soft' : 'border-borderline text-ink2'}`}>
                {isDone ? <Check className="w-4 h-4" /> : i + 1}
              </span>
              <span
                className={`text-[11px] font-bold uppercase tracking-wide whitespace-nowrap
                  ${isDone ? 'text-green-600' : isActive ? 'text-brand' : 'text-ink2'}`}>
                {label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 transition-colors ${isDone ? 'bg-green-600' : 'bg-borderline'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
