'use client'
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { FALLBACK_IMAGES } from '@/lib/imageDefaults'
import { isLegacyNomadicImage } from '@/lib/nomadicContent'
import { isLegacyVanguardImage } from '@/lib/vanguardContent'

/** Local paths referenced in code but not yet uploaded to public/images. */
const PENDING_LOCAL_IMAGES = new Set([
  '/images/founder-portrait.jpg',
])

function normalizeSrc(src) {
  if (typeof src !== 'string' || !src.trim()) return null
  const trimmed = src.trim()
  const pathOnly = trimmed.split('?')[0]
  if (isLegacyNomadicImage(pathOnly) || isLegacyVanguardImage(pathOnly)) return null
  if (pathOnly.startsWith('/images/') && PENDING_LOCAL_IMAGES.has(pathOnly)) return null
  return trimmed
}

/**
 * next/image wrapper: skips known-bad URLs, falls back once on load failure.
 * Avoids cache-bust retries that only produced extra 404 noise in the console.
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
  const primary = useMemo(() => normalizeSrc(src), [src])
  const fallback = normalizeSrc(fallbackSrc) || FALLBACK_IMAGES.product
  const [failedPrimary, setFailedPrimary] = useState(false)

  useEffect(() => {
    setFailedPrimary(false)
  }, [primary])

  const displaySrc = !primary || failedPrimary ? fallback : primary

  if (!displaySrc) {
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
    if (!failedPrimary && primary && fallback && primary !== fallback) {
      setFailedPrimary(true)
    }
  }

  const imageProps = {
    src: displaySrc,
    alt,
    className,
    priority,
    loading: priority ? undefined : 'lazy',
    sizes: sizes || (fill ? '(max-width: 768px) 100vw, 50vw' : undefined),
    onError: handleError,
    unoptimized: displaySrc.startsWith('http'),
    ...props,
  }

  if (fill) {
    return <Image fill {...imageProps} />
  }

  return <Image width={width || 400} height={height || 400} {...imageProps} />
}
