/** Canonical public site URL — override with NEXT_PUBLIC_SITE_URL in production. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wingconcept.com').replace(/\/$/, '')

export const SITE_NAME = 'Wing Concept'

export const SITE_DESCRIPTION =
  'Paramotors, paratrikes, parts and accessories. Vanguard and Nomadic trikes engineered for performance and expedition flying.'
