'use client'

import { useEffect, useState } from 'react'
import { mergeContent, sleep } from '@/lib/contentUtils'

const MAX_ATTEMPTS = 1

/**
 * Loads CMS page content with retries and fallback merge (empty fields keep defaults).
 */
export function useContenido(key, fetcher, fallback) {
  const [content, setContent] = useState(fallback)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async (attempt = 0) => {
      try {
        const data = await fetcher()
        if (!cancelled) {
          setContent(mergeContent(fallback, data))
        }
      } catch {
        if (attempt + 1 < MAX_ATTEMPTS && !cancelled) {
          await sleep(400 * (attempt + 1))
          return load(attempt + 1)
        }
        if (!cancelled) setContent(fallback)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [key])

  return { content, loading }
}
