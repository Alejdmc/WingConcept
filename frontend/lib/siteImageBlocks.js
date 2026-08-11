/** Site blocks that store image URL(s) — edited via upload in admin, not manual URLs. */

export const SITE_IMAGE_BLOCKS = {
  'homepage.hero.images': { maxImages: 10, multiLine: true },
  'paratrike.hero.background': { maxImages: 1, multiLine: false },
}

export function isSiteImageBlock(clave) {
  return Boolean(SITE_IMAGE_BLOCKS[clave])
}

export function parseSiteImageValue(val, multiLine) {
  if (!val) return []
  if (multiLine) {
    return val.split('\n').map((s) => s.trim()).filter(Boolean)
  }
  return val.trim() ? [val.trim()] : []
}

export function serializeSiteImageValue(urls, multiLine) {
  if (multiLine) return urls.filter(Boolean).join('\n')
  return urls[0] || ''
}
