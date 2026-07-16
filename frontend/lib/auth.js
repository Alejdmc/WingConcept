import { api } from './api'

export function persistAuthSession(data) {
  if (typeof window === 'undefined') return

  const expiresIn = Number(data?.expires_in || 60 * 60 * 24 * 7)
  const maxAge = Math.max(expiresIn, 60)

  localStorage.setItem('access_token', data.access_token)
  localStorage.setItem('refresh_token', data.refresh_token)
  localStorage.setItem('user', JSON.stringify({ nombre: data.nombre, rol: data.rol }))

  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:'
  const secureFlag = secure ? '; Secure' : ''
  document.cookie = `access_token=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`
  document.cookie = `user=${encodeURIComponent(JSON.stringify({ nombre: data.nombre, rol: data.rol }))}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`
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

export async function validateToken() {
  try {
    const user = await api.auth.me()
    return user
  } catch (err) {
    clearAuthSession()
    return null
  }
}