/** Clearance — equipo de segunda mano publicado por usuarios (Wing Concept solo intermedia). */

export const CLEARANCE_MAX_PHOTOS = 10

export const CLEARANCE_CATEGORIES = [
  { id: 'trike', label: 'Trikes' },
  { id: 'paramotor', label: 'Paramotors' },
  { id: 'paraglider', label: 'Paragliders' },
  { id: 'engine', label: 'Engines' },
  { id: 'accessory', label: 'Accessories' },
  { id: 'other', label: 'Other' },
]

export function categoryLabel(id) {
  return CLEARANCE_CATEGORIES.find((c) => c.id === id)?.label || 'Other'
}

export function isGmail(email) {
  return /^[^\s@]+@(gmail|googlemail)\.com$/i.test(String(email || '').trim())
}

export function formatClearancePrice(price) {
  const n = Number(price)
  if (!Number.isFinite(n)) return ''
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`
}

/** wa.me solo acepta dígitos con código de país. */
export function whatsappLink(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  return digits.length >= 8 ? `https://wa.me/${digits}` : null
}
