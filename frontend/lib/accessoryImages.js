import { ACCESSORIES } from './accessories'
import { PARTS } from './parts'
import { FALLBACK_IMAGES } from './imageDefaults'
import { PRODUCT_IDS } from './products'
import { galleryPathsForOption, MAX_OPTION_IMAGES } from './configuratorImages'

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

function normalizeImage(src) {
  if (typeof src !== 'string' || !src.trim() || isGenericAccessoryImage(src)) {
    return null
  }
  return src.trim()
}

function pickExplicitGallery(cmsGallery, productImages) {
  const cms = Array.isArray(cmsGallery) ? cmsGallery.filter(Boolean) : []
  const product = Array.isArray(productImages) ? productImages.filter(Boolean) : []
  if (product.length && cms.length) {
    return (product.length >= cms.length ? product : cms).slice(0, MAX_OPTION_IMAGES)
  }
  if (product.length) return product.slice(0, MAX_OPTION_IMAGES)
  if (cms.length) return cms.slice(0, MAX_OPTION_IMAGES)
  return null
}

function resolveSingleThumbnail(id, cmsImage, productoId, fallbackImage) {
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

  return FALLBACK_IMAGES.logo
}

/**
 * Shared gallery (up to 3) for the same accessory/part slug across
 * /parts, configurators (Vanguard/Nomadic), and cart thumbnails.
 */
export function resolveAccessoryGallery(id, options = {}) {
  const key = normalizeAccessoryId(id)
  if (!key) return []

  const {
    cmsImage,
    cmsGallery,
    productImages,
    productoId,
    fallbackImage,
  } = options

  const explicit = pickExplicitGallery(cmsGallery, productImages)
  const staticPaths = galleryPathsForOption(key, null, null).filter(Boolean)

  // Admin uploaded a full gallery (2–3 images)
  if (explicit?.length >= 2) {
    return explicit.slice(0, MAX_OPTION_IMAGES)
  }

  // Catalog triplet from OPTION_GALLERY_BY_ID — beats a single DB thumbnail
  if (staticPaths.length >= 2) {
    return staticPaths.slice(0, MAX_OPTION_IMAGES)
  }

  if (explicit?.length === 1) {
    return explicit
  }

  if (staticPaths.length === 1) {
    return staticPaths
  }

  const single = resolveSingleThumbnail(id, cmsImage, productoId, fallbackImage)
  return single ? [single] : [FALLBACK_IMAGES.logo]
}

/**
 * Primary thumbnail — first image of the shared gallery.
 */
export function resolveAccessoryImage(id, cmsImage, productoId, fallbackImage, options = {}) {
  const gallery = resolveAccessoryGallery(id, {
    cmsImage,
    productoId,
    fallbackImage,
    ...options,
  })
  return gallery[0] || null
}
