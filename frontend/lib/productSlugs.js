/** Canonical public product slugs + legacy aliases (must match backend seed). */
export const PRODUCT_SLUG_ALIASES = {
  vanguard: 'vanguard-v8',
  'vanguard-v8-0': 'vanguard-v8',
  nomadic: 'nomadic-trike',
  disruptor: 'disruptor-trike',
  'disruptor-paramotor': 'disruptor-paramotor',
}

export function resolveProductSlug(slug) {
  if (!slug) return slug
  const key = String(slug).trim().toLowerCase()
  return PRODUCT_SLUG_ALIASES[key] || slug
}
