'use client'
import { Check, Circle, Clock } from 'lucide-react'

export const ORDER_STEPS = [
  { estado: 'pendiente', label: 'Order placed' },
  { estado: 'pagado', label: 'Payment confirmed' },
  { estado: 'procesando', label: 'Preparing order' },
  { estado: 'enviado', label: 'Shipped' },
  { estado: 'entregado', label: 'Delivered' },
]

const TERMINAL = {
  cancelado: { label: 'Cancelled', color: 'text-red-600 bg-red-50 border-red-200' },
  reembolsado: { label: 'Refunded', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  error_stock: { label: 'Stock issue', color: 'text-orange-700 bg-orange-50 border-orange-200' },
}

function formatDate(value) {
  if (!value) return null
  return new Date(value).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function eventMap(timeline = []) {
  const map = {}
  timeline.forEach((event) => {
    if (!map[event.estado]) map[event.estado] = event
  })
  return map
}

export default function OrderTimeline({ order, timeline = [], compact = false }) {
  const events = eventMap(timeline)
  const currentEstado = order?.estado
  const isTerminal = TERMINAL[currentEstado]
  const currentIdx = ORDER_STEPS.findIndex((s) => s.estado === currentEstado)

  if (isTerminal) {
    const terminalEvent = timeline.find((e) => e.estado === currentEstado) || timeline[timeline.length - 1]
    return (
      <div className={`rounded-xl border p-5 ${isTerminal.color}`}>
        <p className="font-black text-lg">{isTerminal.label}</p>
        {terminalEvent?.mensaje && <p className="text-sm mt-2 opacity-90">{terminalEvent.mensaje}</p>}
        {terminalEvent?.created_at && (
          <p className="text-xs mt-2 opacity-75">{formatDate(terminalEvent.created_at)}</p>
        )}
      </div>
    )
  }

  return (
    <div className={compact ? 'space-y-0' : 'bg-white border border-borderline rounded-xl p-6'}>
      {!compact && <h2 className="font-black text-ink mb-6">Order progress</h2>}
      <ol className="relative">
        {ORDER_STEPS.map((step, index) => {
          const event = events[step.estado]
          const isComplete = currentIdx >= 0 ? index < currentIdx : Boolean(event)
          const isCurrent = step.estado === currentEstado
          const isLast = index === ORDER_STEPS.length - 1

          return (
            <li key={step.estado} className={`relative flex gap-4 ${!isLast ? 'pb-8' : ''}`}>
              {!isLast && (
                <span
                  className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${isComplete ? 'bg-brand' : 'bg-borderline'}`}
                  aria-hidden
                />
              )}
              <div className="relative z-10 shrink-0">
                {isComplete ? (
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand text-white">
                    <Check className="w-4 h-4" />
                  </span>
                ) : isCurrent ? (
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand/15 border-2 border-brand text-brand">
                    <Clock className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-bg2 border border-borderline text-ink2">
                    <Circle className="w-3 h-3" />
                  </span>
                )}
              </div>
              <div className="pt-0.5 min-w-0">
                <p className={`font-bold ${isCurrent ? 'text-brand' : isComplete ? 'text-ink' : 'text-ink2'}`}>
                  {step.label}
                </p>
                {event?.created_at && (
                  <p className="text-xs text-ink2 mt-1">{formatDate(event.created_at)}</p>
                )}
                {isCurrent && event?.mensaje && (
                  <p className="text-sm text-ink2 mt-1">{event.mensaje}</p>
                )}
                {isCurrent && !event?.mensaje && step.estado === 'enviado' && order?.numero_guia && (
                  <p className="text-sm text-ink2 mt-1">
                    Tracking: <span className="font-semibold text-ink">{order.numero_guia}</span>
                    {order.transportadora ? ` · ${order.transportadora}` : ''}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export { formatDate as formatOrderDate, TERMINAL as ORDER_TERMINAL }
