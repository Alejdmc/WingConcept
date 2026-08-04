'use client'
import { useState } from 'react'
import Image from 'next/image'

/**
 * next/image wrapper: skips invalid src, retries once on error, shows placeholder on failure.
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
  fallbackSrc,
  ...props
}) {
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const baseSrc = typeof src === 'string' && src.trim().length > 0 ? src.trim() : null
  const retrySrc = baseSrc && attempt === 1 && !baseSrc.includes('?')
    ? `${baseSrc}${baseSrc.includes('?') ? '&' : '?'}_r=1`
    : baseSrc
  const validSrc = attempt === 2 && fallbackSrc ? fallbackSrc : retrySrc

  if (!validSrc || failed) {
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
    if (fallbackSrc && attempt === 1) {
      setAttempt(2)
      return
    }
    setFailed(true)
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
