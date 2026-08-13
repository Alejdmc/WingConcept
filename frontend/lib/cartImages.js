import { resolveAccessoryImage, normalizeAccessoryId } from './accessoryImages'
import { FALLBACK_IMAGES } from './imageDefaults'
import { NOMADIC_HERO_IMAGE, isLegacyNomadicImage } from './nomadicContent'
import { VANGUARD_HERO_IMAGE, isLegacyVanguardImage } from './vanguardContent'

function isUsableImage(url) {
  return (
    typeof url === 'string'
    && url.trim()
    && !isLegacyNomadicImage(url)
    && !isLegacyVanguardImage(url)
  )
}

/** Pick the correct thumbnail for a cart line item. */
export function resolveCartItemImage(item) {
  const slug = item?.producto_slug
  const categoria = item?.producto_categoria
  const raw = item?.producto_imagen || item?.image

  if (slug === 'vanguard-v8') return VANGUARD_HERO_IMAGE
  if (slug === 'nomadic-trike') return NOMADIC_HERO_IMAGE

  if (slug && (categoria === 'repuestos' || categoria === 'accesorios')) {
    const mapped = resolveAccessoryImage(normalizeAccessoryId(slug), null, null, null)
    if (mapped) return mapped
  }

  if (slug) {
    const mapped = resolveAccessoryImage(normalizeAccessoryId(slug), null, null, null)
    if (mapped) return mapped
  }

  if (isUsableImage(raw)) {
    if (raw.startsWith('http')) {
      return null
    }
    if (raw.includes('/images/vanguard/')) return raw.trim()
    if (raw.includes('/images/nomadic/')) return raw.trim()
    if (raw.includes('/images/parts/')) return raw.trim()
    return raw.trim()
  }

  const label = [
    item?.producto_nombre,
    item?.name,
    item?.variante_nombre,
    slug,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (label.includes('nomadic')) return NOMADIC_HERO_IMAGE
  if (label.includes('vanguard')) return VANGUARD_HERO_IMAGE
  if (label.includes('i-pro') || label.includes('ipro')) return '/images/ipro_ejemplo.PNG'

  return FALLBACK_IMAGES.part
}

export function cartItemFallback(item) {
  if (item?.producto_slug === 'vanguard-v8') return VANGUARD_HERO_IMAGE
  if (item?.producto_slug === 'nomadic-trike') return NOMADIC_HERO_IMAGE
  return FALLBACK_IMAGES.part
}
