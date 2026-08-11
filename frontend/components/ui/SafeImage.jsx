'use client'
import { useState } from 'react'
import Image from 'next/image'
import { FALLBACK_IMAGES } from '@/lib/imageDefaults'
import { isLegacyNomadicImage } from '@/lib/nomadicContent'

/**
 * next/image wrapper: always renders an image when fallbackSrc is set.
 * Retries the primary src once, then falls back — never leaves an empty slot.
 */
export default function SafeImage({
  src,
  alt = '',
  fill,
  width,
  height,
  className = '',
  priority = false,
  sizes,
  fallbackSrc = FALLBACK_IMAGES.product,
  ...props
}) {
  const [attempt, setAttempt] = useState(0)

  const rawSrc = typeof src === 'string' && src.trim().length > 0 ? src.trim() : null
  const baseSrc = rawSrc && isLegacyNomadicImage(rawSrc) ? null : rawSrc
  const primary = baseSrc || fallbackSrc
  const retrySrc = attempt === 1 && primary && !primary.includes('?')
    ? `${primary}${primary.includes('?') ? '&' : '?'}_r=1`
    : primary
  const validSrc = attempt >= 2 && fallbackSrc ? fallbackSrc : retrySrc

  if (!validSrc) {
    return (
      <div
        className={`bg-bg2 flex items-center justify-center text-ink2/40 text-xs uppercase tracking-widest ${className}`}
        aria-hidden={!alt}
      >
        {alt ? alt.slice(0, 1) : '—'}
      </div>
    )
  }

  const handleError = () => {
    if (attempt === 0) {
      setAttempt(1)
      return
    }
    if (fallbackSrc && validSrc !== fallbackSrc) {
      setAttempt(2)
      return
    }
    if (attempt < 3 && fallbackSrc) {
      setAttempt(3)
    }
  }

  const imageProps = {
    src: validSrc,
    alt,
    className,
    priority,
    loading: priority ? undefined : 'lazy',
    sizes: sizes || (fill ? '(max-width: 768px) 100vw, 50vw' : undefined),
    onError: handleError,
    unoptimized: validSrc.startsWith('http'),
    ...props,
  }

  if (fill) {
    return <Image fill {...imageProps} />
  }

  return <Image width={width || 400} height={height || 400} {...imageProps} />
}
