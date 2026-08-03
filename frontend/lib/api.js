function getApiBase() {
  if (typeof window !== 'undefined') {
    // Dev: mismo origen vía rewrite de Next.js (uploads multipart sin CORS)
    if (process.env.NODE_ENV === 'development') {
      return ''
    }
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
    }
    return ''
  }
  return (
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
    'http://localhost:8000'
  )
}

function apiUrl(path = '') {
  const base = getApiBase()
  return `${base}/api/v1${path}`
}

const PUBLIC_PATHS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/recuperar',
  '/auth/reset-password',
  '/auth/refresh',
  '/auth/resend-verification',
  '/manuals',
  '/contenidos/adventure',
  '/contenidos/shows',
  '/contenidos/events',
  '/contenidos/manuals',
  '/dealers',
  '/contact',
  '/productos',
])

const PROTECTED_PREFIXES = ['/checkout', '/orders', '/cuenta', '/admin']

function isProtectedPage(pathname) {
  if (!pathname) return false
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function isPublicPath(path) {
  const base = path.split('?')[0]
  if (PUBLIC_PATHS.has(base)) return true
  if (base.startsWith('/auth/verify-email')) return true
  if (base.startsWith('/productos')) return true
  return false
}

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
  localStorage.removeItem('user')
  document.cookie = 'access_token=; path=/; max-age=0'
  document.cookie = 'refresh_token=; path=/; max-age=0'
  document.cookie = 'user=; path=/; max-age=0'
  const path = window.location.pathname
  if (path.startsWith('/login') || path.startsWith('/register') || path.includes('forgot-password')) {
    return
  }
  if (!isProtectedPage(path)) {
    return
  }
  window.location.href = '/login?session_expired=true'
}

async function parseErrorResponse(res) {
  try {
    const data = await res.json()
    const detail = data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail.map((item) => item?.msg || item?.message || String(item)).join(', ')
    }
    return data?.message || `Error ${res.status}`
  } catch {
    return res.status === 500
      ? 'Service temporarily unavailable. Please try again in a moment.'
      : `Error ${res.status}`
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
  const { skipAuth = false, ...fetchOptions } = options
  const isPublic = skipAuth || isPublicPath(path)
  const token = !isPublic && typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  const sessionId = getSessionId()

  let res
  try {
    res = await fetch(apiUrl(path), {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(sessionId && { 'X-Session-ID': sessionId }),
        ...options.headers,
      },
      ...fetchOptions,
    })
  } catch {
    throw {
      status: 0,
      detail: `Cannot reach the API${getApiBase() ? ` at ${getApiBase()}` : ''}. Make sure the backend is running on port 8000.`,
    }
  }

  if (res.status === 401 && !isPublic && typeof window !== 'undefined') {
    const refreshToken = localStorage.getItem('refresh_token')
    if (path !== '/auth/refresh') {
      try {
        const refreshRes = await fetch(apiUrl('/auth/refresh'), {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(refreshToken ? { refresh_token: refreshToken } : {}),
        })
        if (refreshRes.ok) {
          const r = await refreshRes.json()
          if (r.access_token) {
            localStorage.setItem('access_token', r.access_token)
            if (r.refresh_token) localStorage.setItem('refresh_token', r.refresh_token)
            const retry = await fetch(apiUrl(path), {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${r.access_token}`,
                ...(sessionId && { 'X-Session-ID': sessionId }),
                ...fetchOptions.headers,
              },
              ...fetchOptions,
            })
            if (!retry.ok) {
              throw { status: retry.status, detail: await parseErrorResponse(retry) }
            }
            return retry.status === 204 ? null : retry.json()
          }
        }
        clearSessionAndRedirect()
        throw { status: 401, detail: 'Session expired' }
      } catch (e) {
        if (e?.status === 401) throw e
        clearSessionAndRedirect()
        throw { status: 401, detail: 'Session expired' }
      }
    }
  }

  if (!res.ok) {
    throw { status: res.status, detail: await parseErrorResponse(res) }
  }
  return res.status === 204 ? null : res.json()
}

async function uploadRequest(path, file, extraFields = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  const sessionId = getSessionId()

  const doUpload = async (authToken) => fetch(apiUrl(path), {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...(sessionId && { 'X-Session-ID': sessionId }),
    },
    body: (() => {
      const formData = new FormData()
      formData.append('file', file)
      Object.entries(extraFields).forEach(([key, value]) => {
        if (value != null && value !== '') formData.append(key, String(value))
      })
      return formData
    })(),
  })

  let res
  try {
    res = await doUpload(token)
  } catch {
    throw {
      status: 0,
      detail: `Cannot reach the API${getApiBase() ? ` at ${getApiBase()}` : ''}. Make sure the backend is running on port 8000.`,
    }
  }

  if (res.status === 401 && typeof window !== 'undefined') {
    const refreshToken = localStorage.getItem('refresh_token')
    try {
      const refreshRes = await fetch(apiUrl('/auth/refresh'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(refreshToken ? { refresh_token: refreshToken } : {}),
      })
      if (refreshRes.ok) {
        const r = await refreshRes.json()
        if (r.access_token) {
          localStorage.setItem('access_token', r.access_token)
          if (r.refresh_token) localStorage.setItem('refresh_token', r.refresh_token)
          res = await doUpload(r.access_token)
        }
      }
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    throw { status: res.status, detail: await parseErrorResponse(res) }
  }
  return res.json()
}

export const api = {
  auth: {
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data), skipAuth: true }),
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data), skipAuth: true }),
    refresh: (data) => request('/auth/refresh', { method: 'POST', body: JSON.stringify(data), skipAuth: true }),
    me: () => request('/auth/me'),
    verifyEmail: (token) =>
      request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }), skipAuth: true }),
    resendVerificationEmail: (email) =>
      request('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }), skipAuth: true }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    forgotPassword: (email, captchaToken = '') =>
      request('/auth/recuperar', { method: 'POST', body: JSON.stringify({ email, captchaToken }), skipAuth: true }),
    resetPassword: (data) =>
      request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data), skipAuth: true }),
    acceptAdminInvite: (data) =>
      request('/auth/accept-admin-invite', { method: 'POST', body: JSON.stringify(data) }),
  },

  contact: {
    send: (data) =>
      request('/contact', { method: 'POST', body: JSON.stringify(data), skipAuth: true }),
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
    stockAlertas: () => request('/admin/stock/alertas'),
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
    dealers: (params = {}) => request(`/admin/dealers${buildQuery(params)}`),
    obtenerDealer: (dealerId) => request(`/admin/dealers/${dealerId}`),
    crearDealer: (data) => request('/admin/dealers', { method: 'POST', body: JSON.stringify(data) }),
    actualizarDealer: (dealerId, data) => request(`/admin/dealers/${dealerId}`, { method: 'PUT', body: JSON.stringify(data) }),
    eliminarDealer: (dealerId, permanente = false) =>
      request(`/admin/dealers/${dealerId}${permanente ? '?permanente=true' : ''}`, { method: 'DELETE' }),
    manuals: (params = {}) => request(`/admin/manuals${buildQuery(params)}`),
    obtenerManual: (manualId) => request(`/admin/manuals/${manualId}`),
    crearManual: (data) => request('/admin/manuals', { method: 'POST', body: JSON.stringify(data) }),
    actualizarManual: (manualId, data) => request(`/admin/manuals/${manualId}`, { method: 'PUT', body: JSON.stringify(data) }),
    eliminarManual: (manualId, permanente = false) =>
      request(`/admin/manuals/${manualId}${permanente ? '?permanente=true' : ''}`, { method: 'DELETE' }),
    uploadManual: (file) => uploadRequest('/admin/uploads/manual', file),
    uploadImagen: (file, productoId = null) =>
      uploadRequest('/admin/uploads/imagen', file, productoId ? { producto_id: productoId } : {}),
    actualizarVariante: (varianteId, data) =>
      request(`/admin/variantes/${varianteId}/stock`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  contenidos: {
    adventure: () => request('/contenidos/adventure', { skipAuth: true }),
    shows: () => request('/contenidos/shows', { skipAuth: true }),
    events: () => request('/contenidos/events', { skipAuth: true }),
    manuals: () => request('/contenidos/manuals', { skipAuth: true }),
  },
  dealers: {
    list: () => request('/dealers', { skipAuth: true }),
  },
  manuals: {
    list: () => request('/manuals', { skipAuth: true }),
    downloadUrl: (manualId) => apiUrl(`/manuals/${manualId}/download`),
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