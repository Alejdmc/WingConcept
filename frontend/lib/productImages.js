import {
  NOMADIC_GALLERY,
  NOMADIC_HERO_IMAGE,
  isLegacyNomadicImage,
  pickNomadicImage,
} from './nomadicContent'

/** Prefer CMS gallery/listing images over legacy product.imagenes entries. */
export function resolveProductImage(product, fallback) {
  const extra = product?.contenido_extra || {}
  const listing = extra.listing || {}

  const fromListing = pickNomadicImage([listing.image].filter(Boolean), null)
  if (fromListing) return fromListing

  const fromGallery = pickNomadicImage(extra.gallery, null)
  if (fromGallery) return fromGallery

  if (product?.slug === 'nomadic-trike') {
    const legacy = product?.imagenes?.[0] || product?.image
    if (!legacy || isLegacyNomadicImage(legacy)) {
      return fallback || NOMADIC_HERO_IMAGE
    }
    return legacy
  }

  const fromImagenes = pickNomadicImage(product?.imagenes, null)
  if (fromImagenes) return fromImagenes

  if (product?.image && !isLegacyNomadicImage(product.image)) {
    return product.image
  }
  return fallback || null
}

/** Always use on-disk trike photos 2–6; CMS may still list the old paramotor render. */
export function resolveNomadicGallery(_extra) {
  return NOMADIC_GALLERY
}
