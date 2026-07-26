const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'tempmail.com',
  'throwaway.email',
  'yopmail.com',
  '10minutemail.com',
  'trashmail.com',
  'fakeinbox.com',
  'maildrop.cc',
  'getnada.com',
  'dispostable.com',
  'sharklasers.com',
  'grr.la',
  'mailnesia.com',
])

export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export function isValidEmail(email) {
  const normalized = normalizeEmail(email)
  if (!normalized || normalized.length > 254) return false
  if (!EMAIL_REGEX.test(normalized)) return false
  const domain = normalized.split('@')[1]
  if (!domain || DISPOSABLE_DOMAINS.has(domain)) return false
  return true
}

export function emailValidationMessage(email) {
  if (!String(email || '').trim()) return 'Please enter your email address.'
  if (!isValidEmail(email)) return 'Please enter a valid email address.'
  return ''
}

export function buildVerifyPendingUrl(email, nextUrl = '/') {
  const params = new URLSearchParams()
  if (email) params.set('email', email)
  if (nextUrl && nextUrl.startsWith('/')) params.set('next', nextUrl)
  const query = params.toString()
  return query ? `/verify-email-pending?${query}` : '/verify-email-pending'
}

export function shouldRequireEmailVerification(user) {
  return user?.rol !== 'admin' && user?.email_verificado === false
}
