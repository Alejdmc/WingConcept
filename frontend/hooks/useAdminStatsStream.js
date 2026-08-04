'use client'

import { useEffect, useRef } from 'react'
import { apiUrl } from '@/lib/api'

function parseSseEvents(buffer, chunk) {
  const combined = buffer + chunk
  const parts = combined.split('\n\n')
  const remaining = parts.pop() || ''
  const events = []

  for (const part of parts) {
    const line = part.split('\n').find((l) => l.startsWith('data: '))
    if (!line) continue
    try {
      events.push(JSON.parse(line.slice(6)))
    } catch {
      // ignore malformed chunks
    }
  }

  return { events, remaining }
}

/**
 * Conecta al stream SSE de stats admin y actualiza el callback en cada push.
 * Usa fetch + ReadableStream porque EventSource no soporta Authorization header.
 */
export function useAdminStatsStream(onStats, enabled = true) {
  const onStatsRef = useRef(onStats)
  onStatsRef.current = onStats

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const controller = new AbortController()
    let buffer = ''
    let reconnectTimer = null

    const connect = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) return

      try {
        const res = await fetch(apiUrl('/admin/stats/stream'), {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })

        if (!res.ok || !res.body) return

        const reader = res.body.getReader()
        const decoder = new TextDecoder()

        while (!controller.signal.aborted) {
          const { done, value } = await reader.read()
          if (done) break

          const parsed = parseSseEvents(buffer, decoder.decode(value, { stream: true }))
          buffer = parsed.remaining
          for (const stats of parsed.events) {
            onStatsRef.current(stats)
          }
        }
      } catch (err) {
        if (err?.name === 'AbortError') return
      }

      if (!controller.signal.aborted) {
        reconnectTimer = setTimeout(connect, 5000)
      }
    }

    connect()

    return () => {
      controller.abort()
      if (reconnectTimer) clearTimeout(reconnectTimer)
    }
  }, [enabled])
}
