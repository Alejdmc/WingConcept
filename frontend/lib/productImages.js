import {
  NOMADIC_GALLERY,
  NOMADIC_HERO_IMAGE,
  isLegacyNomadicImage,
  pickNomadicImage,
} from './nomadicContent'
import {
  VANGUARD_GALLERY,
  VANGUARD_HERO_IMAGE,
  isLegacyVanguardImage,
  pickVanguardImage,
} from './vanguardContent'

/** Prefer CMS gallery/listing images over legacy product.imagenes entries. */
export function resolveProductImage(product, fallback) {
  const extra = product?.contenido_extra || {}
  const listing = extra.listing || {}
  const slug = product?.slug

  if (slug === 'vanguard-v8') {
    const hero = pickVanguardImage(
      [listing.image, ...(extra.gallery || []), ...(product?.imagenes || []), product?.image].filter(Boolean),
      null,
    )
    if (hero) return hero
    return fallback || VANGUARD_HERO_IMAGE
  }

  if (slug === 'disruptor-trike') {
    const hero = [listing.image, ...(extra.gallery || []), ...(product?.imagenes || [])].find(
      (url) => url && typeof url === 'string' && url.includes('/disruptor/'),
    )
    if (hero) return hero
    return fallback || '/images/disruptor/trike-1.jpg'
  }

  if (slug === 'nomadic-trike') {
    const fromListing = pickNomadicImage([listing.image].filter(Boolean), null)
    if (fromListing) return fromListing

    const fromGallery = pickNomadicImage(extra.gallery, null)
    if (fromGallery) return fromGallery

    const legacy = product?.imagenes?.[0] || product?.image
    if (!legacy || isLegacyNomadicImage(legacy)) {
      return fallback || NOMADIC_HERO_IMAGE
    }
    return legacy
  }

  const fromListing = pickNomadicImage([listing.image].filter(Boolean), null)
  if (fromListing && !isLegacyVanguardImage(fromListing)) return fromListing

  const fromGallery = pickNomadicImage(extra.gallery, null)
  if (fromGallery && !isLegacyVanguardImage(fromGallery)) return fromGallery

  const fromImagenes = pickNomadicImage(product?.imagenes, null)
  if (fromImagenes && !isLegacyVanguardImage(fromImagenes)) return fromImagenes

  if (product?.image && !isLegacyNomadicImage(product.image) && !isLegacyVanguardImage(product.image)) {
    return product.image
  }
  return fallback || null
}

/** Always use on-disk trike photos 1–10; CMS may list broken or duplicate Supabase URLs. */
export function resolveVanguardGallery(_extra) {
  return VANGUARD_GALLERY
}

/** Always use on-disk trike photos 2–6; CMS may still list the old paramotor render. */
export function resolveNomadicGallery(_extra) {
  return NOMADIC_GALLERY
}
