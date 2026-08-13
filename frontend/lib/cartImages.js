import { FALLBACK_IMAGES } from './imageDefaults'
import { NOMADIC_HERO_IMAGE, isLegacyNomadicImage } from './nomadicContent'
import { VANGUARD_HERO_IMAGE, isLegacyVanguardImage } from './vanguardContent'

/** Pick the correct thumbnail for a cart line item. */
export function resolveCartItemImage(item) {
  const raw = item?.producto_imagen || item?.image
  if (typeof raw === 'string' && raw.trim() && !isLegacyNomadicImage(raw) && !isLegacyVanguardImage(raw)) {
    return raw.trim()
  }

  const label = [
    item?.producto_nombre,
    item?.name,
    item?.variante_nombre,
    item?.producto_slug,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (label.includes('nomadic')) return NOMADIC_HERO_IMAGE
  if (label.includes('vanguard')) return VANGUARD_HERO_IMAGE
  if (label.includes('i-pro') || label.includes('ipro')) return '/images/ipro_ejemplo.PNG'

  return FALLBACK_IMAGES.part
}
