import { ACCESSORIES } from './accessories'
import { PARTS } from './parts'
import { FALLBACK_IMAGES } from './imageDefaults'
import { PRODUCT_IDS } from './products'

const SLUG_ALIASES = {
  mirror: 'rear-mirror',
  'rear-view-mirror': 'rear-mirror',
}

const IMAGE_BY_ID = Object.fromEntries(
  [...ACCESSORIES, ...PARTS]
    .filter((item) => item.id && item.image)
    .flatMap((item) => {
      const entries = [[item.id, item.image]]
      if (item.id === 'instrument-kit-vanguard') {
        entries.push(['instrument-kit', item.image])
      }
      return entries
    }),
)

const GENERIC_CMS_IMAGES = new Set([
  FALLBACK_IMAGES.accessory,
  '/images/parts/cockpit-liner.png',
])

/** Strip product / legacy prefixes (e.g. vanguard-parachute-container, acc-cruise-control). */
export function normalizeAccessoryId(id) {
  if (!id) return null
  const stripped = String(id).replace(/^(vanguard|nomadic|acc|part)-/, '')
  return SLUG_ALIASES[stripped] || stripped
}

function isGenericAccessoryImage(src) {
  if (typeof src !== 'string' || !src.trim()) return true
  const normalized = src.trim().split('?')[0]
  return GENERIC_CMS_IMAGES.has(normalized) || normalized.includes('cockpit-liner')
}

/**
 * Prefer on-disk part photos mapped by accessory id.
 * CMS/DB rows often share one uploaded image for every option.
 */
export function resolveAccessoryImage(id, cmsImage, productoId, fallbackImage) {
  const key = normalizeAccessoryId(id)

  if (key === 'instrument-kit' || key === 'electrical-kit') {
    if (productoId === PRODUCT_IDS.nomadic) {
      return IMAGE_BY_ID['instrument-kit-nomadic'] || IMAGE_BY_ID[key] || normalizeImage(fallbackImage)
    }
    return IMAGE_BY_ID['instrument-kit-vanguard'] || IMAGE_BY_ID[key] || normalizeImage(fallbackImage)
  }

  if (key && IMAGE_BY_ID[key]) {
    return IMAGE_BY_ID[key]
  }

  const fallback = normalizeImage(fallbackImage)
  if (fallback) return fallback

  const cms = normalizeImage(cmsImage)
  if (cms) return cms

  if (key) {
    return `/images/parts/${key}.png`
  }

  return null
}

function normalizeImage(src) {
  if (typeof src !== 'string' || !src.trim() || isGenericAccessoryImage(src)) {
    return null
  }
  return src.trim()
}
