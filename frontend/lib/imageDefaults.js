/** Shared fallback images so UI never renders empty image slots. */
export const FALLBACK_IMAGES = {
  card: '/images/front1.jpg',
  expedition: '/images/colombia.jpg',
  show: '/images/acrobatic.jpg',
  event: '/images/bootcamp.jpg',
  product: '/images/nomadic/2.jpg',
  part: '/images/nomadic/2.jpg',
  engine: '/images/motor.png',
  accessory: '/images/parts/cockpit-liner.png',
  hero: '/images/front1.jpg',
  founder: '/images/front1.jpg',
}

/** Resolve CMS / catalog image paths; empty values use the section fallback. */
export function resolveImage(src, fallback = FALLBACK_IMAGES.product) {
  if (typeof src === 'string' && src.trim()) return src.trim()
  return fallback
}

