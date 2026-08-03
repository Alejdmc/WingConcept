'use client'
import { useEffect, useRef } from 'react'

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

export function isCaptchaEnabled() {
  return Boolean(SITE_KEY)
}

/**
 * Cloudflare Turnstile widget. Calls onToken when solved; onExpire when it expires.
 * If NEXT_PUBLIC_TURNSTILE_SITE_KEY is empty, auto-invokes onToken('') (dev mode).
 */
export default function TurnstileWidget({ onToken, onExpire, resetKey = 0, className = '' }) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const onTokenRef = useRef(onToken)
  const onExpireRef = useRef(onExpire)

  onTokenRef.current = onToken
  onExpireRef.current = onExpire

  useEffect(() => {
    if (!isCaptchaEnabled()) {
      onTokenRef.current?.('')
      return undefined
    }

    let cancelled = false

    const render = () => {
      if (cancelled || !containerRef.current || !window.turnstile) return
      if (widgetIdRef.current != null) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // ignore
        }
        widgetIdRef.current = null
      }
      containerRef.current.innerHTML = ''
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token) => onTokenRef.current?.(token),
        'expired-callback': () => onExpireRef.current?.(),
        'error-callback': () => onTokenRef.current?.(''),
        theme: 'light',
      })
    }

    if (window.turnstile) {
      render()
    } else {
      const existing = document.querySelector('script[data-turnstile]')
      if (existing) {
        existing.addEventListener('load', render)
      } else {
        const script = document.createElement('script')
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        script.async = true
        script.defer = true
        script.dataset.turnstile = 'true'
        script.onload = render
        document.head.appendChild(script)
      }
    }

    return () => {
      cancelled = true
      if (widgetIdRef.current != null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // ignore
        }
        widgetIdRef.current = null
      }
    }
  }, [resetKey])

  if (!isCaptchaEnabled()) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className={`min-h-[65px] ${className}`.trim()}
      aria-label="Captcha verification"
    />
  )
}
