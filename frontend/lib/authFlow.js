const AUTH_NEXT_KEY = 'auth_next'

/** Guarda la ruta de retorno tras login/registro (ej. /checkout). */
export function saveAuthNext(url) {
  if (typeof window === 'undefined' || !url || !url.startsWith('/')) return
  sessionStorage.setItem(AUTH_NEXT_KEY, url)
}

/** Lee la ruta de retorno: prioridad query param > sessionStorage > fallback. */
export function getAuthNext(paramNext, fallback = '/') {
  if (paramNext && paramNext.startsWith('/')) return paramNext
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem(AUTH_NEXT_KEY)
    if (stored && stored.startsWith('/')) return stored
  }
  return fallback
}

export function clearAuthNext() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(AUTH_NEXT_KEY)
  }
}

export function buildAuthUrl(path, nextUrl, inviteToken = '') {
  const params = new URLSearchParams()
  const next = getAuthNext(nextUrl, '')
  if (next) params.set('next', next)
  if (inviteToken) params.set('invite', inviteToken)
  const q = params.toString()
  return q ? `${path}?${q}` : path
}

export function getInviteToken(searchParams) {
  const token = searchParams?.get?.('invite') || ''
  return typeof token === 'string' ? token.trim() : ''
}
