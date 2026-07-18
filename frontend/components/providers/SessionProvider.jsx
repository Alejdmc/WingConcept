'use client'
import { useEffect } from 'react'
import { ensureValidSession } from '@/lib/auth'

/**
 * Refresca el access token al cargar la app si hay refresh token válido.
 * Evita redirecciones innecesarias a login cuando el JWT de 15 min expiró.
 */
export default function SessionProvider({ children }) {
  useEffect(() => {
    ensureValidSession().catch(() => {})
  }, [])

  return children
}
