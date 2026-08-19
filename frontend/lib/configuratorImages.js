/**
 * Galería de hasta 3 imágenes por opción del configurador.
 * Convención de archivos: /images/disruptor/options/{optionId}-1.jpg … -3.jpg
 * Hasta que existan, se usa primaryImage o la galería base del producto.
 */

const MAX_OPTION_IMAGES = 3

export function buildOptionGallery(optionId, primaryImage, fallbackUrls = []) {
  if (!optionId) {
    return normalizeGallery(fallbackUrls)
  }

  const urls = []
  if (primaryImage && typeof primaryImage === 'string') {
    urls.push(primaryImage.trim())
  }

  for (let i = 1; i <= MAX_OPTION_IMAGES; i++) {
    urls.push(`/images/disruptor/options/${optionId}-${i}.jpg`)
  }

  const unique = [...new Set(urls.filter(Boolean))]
  if (unique.length === 0) {
    return normalizeGallery(fallbackUrls)
  }

  return unique.slice(0, MAX_OPTION_IMAGES).map((src, index) => ({
    src,
    alt: `${optionId} view ${index + 1}`,
  }))
}

function normalizeGallery(urls) {
  const list = (urls || [])
    .map((item, index) => {
      if (typeof item === 'string') return { src: item, alt: `Product view ${index + 1}` }
      if (item?.src) return { src: item.src, alt: item.alt || `Product view ${index + 1}` }
      return null
    })
    .filter(Boolean)

  return list.slice(0, MAX_OPTION_IMAGES)
}
