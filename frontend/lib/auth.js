import { api } from './api'

export async function validateToken() {
  try {
    const user = await api.auth.me()
    return user
  } catch (err) {
    // Token inválido o expirado
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    document.cookie = 'access_token=; path=/; max-age=0'
    document.cookie = 'user=; path=/; max-age=0'
    return null
  }
}