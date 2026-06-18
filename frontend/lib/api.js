const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API = `${BASE}/api/v1`

function getSessionId() {
  if (typeof window === 'undefined') return null
  let sessionId = localStorage.getItem('session_id')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('session_id', sessionId)
  }
  return sessionId
}

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

async function request(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  const sessionId = getSessionId()

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
    login:          (data) => request('/auth/login',    { method: 'POST', body: JSON.stringify(data) }),
    register:       (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    refresh:        (data) => request('/auth/refresh',  { method: 'POST', body: JSON.stringify(data) }),
    forgotPassword: (data) => request('/auth/recuperar', { method: 'POST', body: JSON.stringify(data) }),
    resetPassword:  (data) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
    me:             ()     => request('/auth/me'),
  },

  carrito: {
    obtener: () => request('/carrito'),
    agregar: (data) => request('/carrito/items', { method: 'POST', body: JSON.stringify(data) }),
    actualizar: (itemId, cantidad) => request(`/carrito/items/${itemId}`, { method: 'PUT', body: JSON.stringify({ cantidad }) }),
    eliminar: (itemId) => request(`/carrito/items/${itemId}`, { method: 'DELETE' }),
    vaciar: () => request('/carrito', { method: 'DELETE' }),
    merge: () => request('/carrito/merge', { method: 'POST' }),
  },

  configurador: {
    guardar: (data) => request('/configurador', { method: 'POST', body: JSON.stringify(data) }),
    obtener: (configId) => request(`/configurador/${configId}`),
    miConfiguraciones: () => request('/configurador'),
  },

  productos: {
    destacados: () => request('/productos/destacados'),
    obtener: (slug) => request(`/productos/${slug}`),
    listar: (params = {}) => request(`/productos${buildQuery(params)}`),
  },

  admin: {
    stats: () => request('/admin/stats'),
    productos: (params = {}) => request(`/admin/productos${buildQuery(params)}`),
    crearProducto: (data) => request('/admin/productos', { method: 'POST', body: JSON.stringify(data) }),
    actualizarProducto: (productoId, data) => request(`/admin/productos/${productoId}`, { method: 'PUT', body: JSON.stringify(data) }),
    eliminarProducto: (productoId) => request(`/admin/productos/${productoId}`, { method: 'DELETE' }),
    ordenes: (params = {}) => request(`/admin/ordenes${buildQuery(params)}`),
    actualizarOrden: (ordenId, data) => request(`/admin/ordenes/${ordenId}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
}