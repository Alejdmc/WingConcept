'use client'
import { useState } from 'react'
import Image from 'next/image'

/**
 * next/image wrapper: skips invalid src, shows placeholder on error,
 * uses lazy loading by default to reduce layout thrashing.
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
  ...props
}) {
  const [failed, setFailed] = useState(false)
  const validSrc = typeof src === 'string' && src.trim().length > 0 ? src.trim() : null

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

  const imageProps = {
    src: validSrc,
    alt,
    className,
    priority,
    loading: priority ? undefined : 'lazy',
    sizes: sizes || (fill ? '(max-width: 768px) 100vw, 50vw' : undefined),
    onError: () => setFailed(true),
    ...props,
  }

  if (fill) {
    return <Image fill {...imageProps} />
  }

  return <Image width={width || 400} height={height || 400} {...imageProps} />
}
