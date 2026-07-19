'use client'
import { useEffect } from 'react'

const RELOAD_KEY = 'chunk_reload_attempted'

function isChunkLoadError(message = '') {
  return /ChunkLoadError|Loading chunk .* failed/i.test(message)
}

/**
 * Recarga una vez si falla la carga de un chunk (caché .next desactualizada en dev).
 */
export default function ChunkLoadRecovery({ children }) {
  useEffect(() => {
    const handleFailure = (message) => {
      if (!isChunkLoadError(message)) return

      if (!sessionStorage.getItem(RELOAD_KEY)) {
        sessionStorage.setItem(RELOAD_KEY, '1')
        window.location.reload()
        return
      }

      sessionStorage.removeItem(RELOAD_KEY)
    }

    const onError = (event) => handleFailure(event?.message || '')
    const onRejection = (event) => {
      const reason = event?.reason
      handleFailure(typeof reason === 'string' ? reason : reason?.message || '')
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  return children
}
