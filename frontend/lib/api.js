const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API = `${BASE}/api/v1`

function getSessionId() {
  if (typeof window === 'undefined') return null
  let sessionId = localStorage.getItem('session_id')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('session_id', sessionId)
  }
  document.cookie = `session_id=${sessionId}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
  return sessionId
}

function clearSessionAndRedirect() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login?session_expired=true'
  }
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

  if (res.status === 401 && typeof window !== 'undefined') {
    // Try refresh token once
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        })
        if (refreshRes.ok) {
          const r = await refreshRes.json()
          if (r.access_token) {
            localStorage.setItem('access_token', r.access_token)
            // retry original request with new token
            const retry = await fetch(`${API}${path}`, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${r.access_token}`,
                ...(sessionId && { 'X-Session-ID': sessionId }),
                ...options.headers,
              },
              ...options,
            })
            if (!retry.ok) {
              const err = await retry.json().catch(() => ({}))
              throw { status: retry.status, detail: err.detail || 'Unknown error' }
            }
            return retry.status === 204 ? null : retry.json()
          }
        }
        // Refresh request completed but did not return a usable token: session is dead
        clearSessionAndRedirect()
        throw { status: 401, detail: 'Session expired' }
      } catch (e) {
        if (e?.status === 401) throw e
        console.warn('Refresh token failed', e)
        clearSessionAndRedirect()
        throw { status: 401, detail: 'Session expired' }
      }
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw { status: res.status, detail: err.detail || 'Unknown error' }
  }
  return res.status === 204 ? null : res.json()
}

export const api = {
  auth: {
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    refresh: (data) => request('/auth/refresh', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/auth/me'),
    verifyEmail: (token) => request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) }),
    resendVerificationEmail: (email) => request('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    forgotPassword: (email) => request('/auth/recuperar', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (data) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
    acceptAdminInvite: (token) =>
      request('/auth/accept-admin-invite', { method: 'POST', body: JSON.stringify({ token }) }),
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
    obtenerProducto: (productoId) => request(`/admin/productos/${productoId}`),
    crearProducto: (data) => request('/admin/productos', { method: 'POST', body: JSON.stringify(data) }),
    actualizarProducto: (productoId, data) => request(`/admin/productos/${productoId}`, { method: 'PUT', body: JSON.stringify(data) }),
    eliminarProducto: (productoId) => request(`/admin/productos/${productoId}`, { method: 'DELETE' }),
    crearVariante: (productoId, data) => request(`/admin/productos/${productoId}/variantes`, { method: 'POST', body: JSON.stringify(data) }),
    actualizarStock: (varianteId, data) => request(`/admin/variantes/${varianteId}/stock`, { method: 'PATCH', body: JSON.stringify(data) }),
    ordenes: (params = {}) => request(`/admin/ordenes${buildQuery(params)}`),
    actualizarOrden: (ordenId, data) => request(`/admin/ordenes/${ordenId}`, { method: 'PUT', body: JSON.stringify(data) }),
    contenidos: (params = {}) => request(`/admin/contenidos${buildQuery(params)}`),
    obtenerContenido: (contenidoId) => request(`/admin/contenidos/${contenidoId}`),
    crearContenido: (data) => request('/admin/contenidos', { method: 'POST', body: JSON.stringify(data) }),
    actualizarContenido: (contenidoId, data) => request(`/admin/contenidos/${contenidoId}`, { method: 'PUT', body: JSON.stringify(data) }),
    eliminarContenido: (contenidoId, permanente = false) =>
      request(`/admin/contenidos/${contenidoId}${permanente ? '?permanente=true' : ''}`, { method: 'DELETE' }),
    usuarios: (params = {}) => request(`/admin/usuarios${buildQuery(params)}`),
    actualizarUsuario: (usuarioId, data) => request(`/admin/usuarios/${usuarioId}`, { method: 'PUT', body: JSON.stringify(data) }),
    cambiarRolUsuario: (usuarioId, rol) => request(`/admin/usuarios/${usuarioId}/rol`, { method: 'PATCH', body: JSON.stringify({ rol }) }),
    crearInvitacion: (email) =>
      request('/admin/invitaciones', { method: 'POST', body: JSON.stringify({ email }) }),
    listarInvitaciones: (params = {}) => request(`/admin/invitaciones${buildQuery(params)}`),
    revocarInvitacion: (invitacionId) =>
      request(`/admin/invitaciones/${invitacionId}`, { method: 'DELETE' }),
    cupones: (params = {}) => request(`/admin/cupones${buildQuery(params)}`),
    crearCupon: (data) => request('/admin/cupones', { method: 'POST', body: JSON.stringify(data) }),
  },
  contenidos: {
    adventure: () => request('/contenidos/adventure'),
    shows: () => request('/contenidos/shows'),
    events: () => request('/contenidos/events'),
  },
  ordenes: {
    crear: (data) => request('/ordenes', { method: 'POST', body: JSON.stringify(data) }),
    listar: (params = {}) => request(`/ordenes${buildQuery(params)}`),
    detalle: (ordenId) => request(`/ordenes/${ordenId}`),
    actualizar: (ordenId, data) => request(`/ordenes/${ordenId}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  cupones: {
    validar: (codigo, subtotal) =>
      request(`/cupones/validar${buildQuery({ subtotal })}`, {
        method: 'POST',
        body: JSON.stringify({ codigo }),
      }),
  },
  pagos: {
    checkout: (data) => request('/pagos/checkout', { method: 'POST', body: JSON.stringify(data) }),
  },
  usuarios: {
    perfil: () => request('/usuarios/me'),
    actualizarPerfil: (data) => request('/usuarios/me', { method: 'PUT', body: JSON.stringify(data) }),
    cambiarPassword: (data) => request('/usuarios/me/password', { method: 'PUT', body: JSON.stringify(data) }),
    cupones: () => request('/usuarios/me/cupones'),
    obtener: (userId) => request(userId ? `/usuarios/${userId}` : '/usuarios/me'),
    actualizar: (userId, data) => request(userId ? `/usuarios/${userId}` : '/usuarios/me', { method: 'PUT', body: JSON.stringify(data) }),
    direcciones: (userId) => request(userId ? `/usuarios/${userId}/direcciones` : '/usuarios/me/direcciones'),
    crearDireccion: (data) => request('/usuarios/me/direcciones', { method: 'POST', body: JSON.stringify(data) }),
  },
}