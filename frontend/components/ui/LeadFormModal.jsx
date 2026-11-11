'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, X } from 'lucide-react'
import TurnstileWidget, { isCaptchaEnabled } from '@/components/ui/TurnstileWidget'

const EMPTY = { nombre: '', email: '', telefono: '', pais: '', participantes: 1, mensaje: '' }

/**
 * Formulario en modal que envía al backend (→ andres@wingconcept.com).
 * Usado por "Register Now" (WC Events) y "Get a Quote" (configuradores).
 *
 * onSubmit(values, captchaToken) debe lanzar error si falla.
 */
export default function LeadFormModal({
  open,
  onClose,
  title,
  subtitle,
  submitLabel = 'Send',
  successMessage = 'Thank you! We received your request and will contact you soon.',
  showCountry = false,
  showParticipants = false,
  messageLabel = 'Message (optional)',
  children,
  onSubmit,
}) {
  const [mounted, setMounted] = useState(false)
  const [values, setValues] = useState(EMPTY)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaKey, setCaptchaKey] = useState(0)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return undefined
    setStatus('idle')
    setError('')
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

  const set = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (isCaptchaEnabled() && !captchaToken) {
      setError('Please complete the captcha verification.')
      return
    }
    setStatus('sending')
    try {
      await onSubmit(
        {
          nombre: values.nombre.trim(),
          email: values.email.trim().toLowerCase(),
          telefono: values.telefono.trim() || undefined,
          pais: values.pais.trim() || undefined,
          participantes: Number(values.participantes) || 1,
          mensaje: values.mensaje.trim() || undefined,
        },
        captchaToken,
      )
      setStatus('sent')
      setValues(EMPTY)
    } catch (err) {
      setStatus('idle')
      setError(err?.detail || err?.message || 'Could not send your request. Please try again.')
      setCaptchaKey((k) => k + 1)
      setCaptchaToken('')
    }
  }

  if (!mounted) return null

  const input = 'w-full rounded-lg border border-borderline bg-white px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none'
  const label = 'block text-xs font-bold uppercase tracking-wide text-ink2 mb-1'

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[950] flex items-start sm:items-center justify-center bg-black/60 p-0 sm:p-6 overflow-y-auto"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            className="relative w-full max-w-lg bg-white sm:rounded-2xl shadow-2xl p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 rounded-full bg-bg2 p-2 text-ink hover:bg-brand hover:text-white transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black uppercase text-ink pr-10">{title}</h2>
            {subtitle && <p className="text-sm text-ink2 mt-1">{subtitle}</p>}

            {status === 'sent' ? (
              <div className="py-10 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <p className="text-ink font-semibold">{successMessage}</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 px-6 py-2.5 rounded-lg bg-brand text-white text-sm font-bold uppercase tracking-wide hover:bg-brand/90"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {children}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={label} htmlFor="lead-nombre">Full name *</label>
                    <input id="lead-nombre" name="nombre" required minLength={2} maxLength={120} value={values.nombre} onChange={set} className={input} />
                  </div>
                  <div>
                    <label className={label} htmlFor="lead-email">Email *</label>
                    <input id="lead-email" name="email" type="email" required maxLength={255} value={values.email} onChange={set} className={input} />
                  </div>
                  <div>
                    <label className={label} htmlFor="lead-telefono">Phone / WhatsApp</label>
                    <input id="lead-telefono" name="telefono" maxLength={40} value={values.telefono} onChange={set} className={input} />
                  </div>
                  {showCountry && (
                    <div>
                      <label className={label} htmlFor="lead-pais">Country</label>
                      <input id="lead-pais" name="pais" maxLength={80} value={values.pais} onChange={set} className={input} />
                    </div>
                  )}
                  {showParticipants && (
                    <div>
                      <label className={label} htmlFor="lead-participantes">Participants</label>
                      <input id="lead-participantes" name="participantes" type="number" min={1} max={50} value={values.participantes} onChange={set} className={input} />
                    </div>
                  )}
                </div>
                <div>
                  <label className={label} htmlFor="lead-mensaje">{messageLabel}</label>
                  <textarea id="lead-mensaje" name="mensaje" rows={3} maxLength={3000} value={values.mensaje} onChange={set} className={input} />
                </div>

                <TurnstileWidget resetKey={captchaKey} onToken={setCaptchaToken} onExpire={() => setCaptchaToken('')} />

                {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full py-3 rounded-lg bg-brand text-white font-black uppercase tracking-wide text-sm hover:bg-brand/90 disabled:opacity-50 transition"
                >
                  {status === 'sending' ? 'Sending…' : submitLabel}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
