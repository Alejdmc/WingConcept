import { api } from './api'

const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7

export function persistAuthSession(data) {
  if (typeof window === 'undefined') return

  const accessTtl = Number(data?.expires_in || 60 * 15)
  const cookieMaxAge = Math.max(REFRESH_TTL_SECONDS, accessTtl, 60)
  const secureFlag = window.location.protocol === 'https:' ? '; Secure' : ''

  localStorage.setItem('access_token', data.access_token)
  if (data.refresh_token) {
    localStorage.setItem('refresh_token', data.refresh_token)
  }
  localStorage.setItem('user', JSON.stringify({ nombre: data.nombre, rol: data.rol }))

  document.cookie = `access_token=${data.access_token}; path=/; max-age=${cookieMaxAge}; SameSite=Lax${secureFlag}`
  document.cookie = `user=${encodeURIComponent(JSON.stringify({ nombre: data.nombre, rol: data.rol }))}; path=/; max-age=${cookieMaxAge}; SameSite=Lax${secureFlag}`
  window.dispatchEvent(new Event('auth-changed'))
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return

  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  document.cookie = 'access_token=; path=/; max-age=0'
  document.cookie = 'user=; path=/; max-age=0'
  window.dispatchEvent(new Event('auth-changed'))
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem('user')
  if (!stored) return null

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function isAdminUser() {
  return getStoredUser()?.rol === 'admin'
}

export function hasStoredSession() {
  if (typeof window === 'undefined') return false
  return Boolean(localStorage.getItem('access_token') || localStorage.getItem('refresh_token'))
}

/**
 * Valida sesión actual o renueva con refresh token.
 * Retorna true si hay sesión usable.
 */
export async function ensureValidSession() {
  if (typeof window === 'undefined') return false

  const accessToken = localStorage.getItem('access_token')
  const refreshToken = localStorage.getItem('refresh_token')

  if (accessToken) {
    try {
      await api.auth.me()
      return true
    } catch (err) {
      if (err?.status !== 401 || !refreshToken) {
        if (err?.status === 401) clearAuthSession()
        return false
      }
    }
  }

  if (!refreshToken) return false

  try {
    const res = await api.auth.refresh({ refresh_token: refreshToken })
    let nombre = getStoredUser()?.nombre || ''
    let rol = getStoredUser()?.rol || 'client'
    try {
      const me = await api.auth.me()
      nombre = me.nombre
      rol = me.rol
    } catch {
      // keep stored user metadata
    }
    persistAuthSession({
      ...res,
      nombre,
      rol,
      expires_in: res.expires_in || 60 * 15,
    })
    return true
  } catch {
    clearAuthSession()
    return false
  }
}

export async function validateToken() {
  try {
    const user = await api.auth.me()
    return user
  } catch {
    const ok = await ensureValidSession()
    if (!ok) return null
    try {
      return await api.auth.me()
    } catch {
      clearAuthSession()
      return null
    }
  }
}
