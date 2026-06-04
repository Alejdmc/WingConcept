const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API = `${BASE}/api/v1`

async function request(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  const sessionId = typeof window !== 'undefined' ? localStorage.getItem('session_id') : null

  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(sessionId && { 'X-Session-ID': sessionId }),
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw { status: res.status, detail: err.detail || 'Unknown error' }
  }
  return res.status === 204 ? null : res.json()
}

export const api = {
  auth: {
    login:    (data) => request('/auth/login',    { method: 'POST', body: JSON.stringify(data) }),
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    refresh:  (data) => request('/auth/refresh',  { method: 'POST', body: JSON.stringify(data) }),
    me:       ()     => request('/auth/me'),
  },
  carrito: {
    obtener: () => request('/carrito'),
    agregar: (data) => request('/carrito/items', { method: 'POST', body: JSON.stringify(data) }),
    actualizar: (itemId, cantidad) => request(`/carrito/items/${itemId}`, { method: 'PUT', body: JSON.stringify({ cantidad }) }),
    eliminar: (itemId) => request(`/carrito/items/${itemId}`, { method: 'DELETE' }),
    vaciar: () => request('/carrito', { method: 'DELETE' }),
    merge: () => request('/carrito/merge', { method: 'POST' }),
  },
}