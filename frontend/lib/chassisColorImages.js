/** Per-color preview galleries for trike configurators (Vanguard, Nomadic, Disruptor trike). */

import { CUSTOM_COLOR_ID } from './chassisColors'
import { vanguardColorGalleryPaths } from './vanguardContent'

/** Flat filenames: /images/disruptor/colors/white-blue-candy-1.jpg */
function flatTriplet(basePath, ext = 'jpg') {
  return [1, 2, 3].map((n) => `${basePath}-${n}.${ext}`)
}

/** Nested folder: /images/vanguard/colors/red/red-1.png */
function folderTriplet(baseDir, colorSlug, ext = 'jpg') {
  return [1, 2, 3].map((n) => `${baseDir}/${colorSlug}/${colorSlug}-${n}.${ext}`)
}

const DISRUPTOR_BLUE = flatTriplet('/images/disruptor/colors/white-blue-candy')
const DISRUPTOR_RED = flatTriplet('/images/disruptor/colors/white-red-candy')
const DISRUPTOR_PURPLE = flatTriplet('/images/disruptor/colors/white-purple-candy')
const NOMADIC_RED = folderTriplet('/images/nomadic/colors', 'red')
const NOMADIC_BLUE = folderTriplet('/images/nomadic/colors', 'blue')
const NOMADIC_PURPLE = folderTriplet('/images/nomadic/colors', 'purple')
/** Product-specific color galleries — frame color only (red / blue / purple). */
const GALLERIES_BY_PRODUCT = {
  vanguard: {
    'candy-red-white': vanguardColorGalleryPaths('candy-red-white'),
    'candy-purple-white': vanguardColorGalleryPaths('candy-purple-white'),
    'candy-blue-white': vanguardColorGalleryPaths('candy-blue-white'),
  },
  // Nomadic colors imported from Drive → nomadic/colors/{red|blue|purple}/
  nomadic: {
    'candy-red-white': NOMADIC_RED.length ? NOMADIC_RED : ['/images/nomadic/2.jpg', '/images/nomadic/3.jpg', '/images/nomadic/4.jpg'],
    'candy-purple-white': NOMADIC_PURPLE.length ? NOMADIC_PURPLE : ['/images/nomadic/3.jpg', '/images/nomadic/4.jpg', '/images/nomadic/5.jpg'],
    'candy-blue-white': NOMADIC_BLUE.length ? NOMADIC_BLUE : ['/images/nomadic/4.jpg', '/images/nomadic/5.jpg', '/images/nomadic/6.jpg'],
  },
  'disruptor-trike': {
    'candy-red-white': DISRUPTOR_RED,
    'candy-purple-white': DISRUPTOR_PURPLE,
    'candy-blue-white': DISRUPTOR_BLUE,
  },
}

export function resolveChassisColorGallery(productKey, colorId, fallbackHero) {
  if (!colorId || colorId === CUSTOM_COLOR_ID) {
    return fallbackHero ? [{ src: fallbackHero, alt: 'Custom color' }] : []
  }
  const paths = GALLERIES_BY_PRODUCT[productKey]?.[colorId]
  if (!paths?.length) {
    return fallbackHero ? [{ src: fallbackHero, alt: 'Chassis color' }] : []
  }
  return paths.map((src, index) => ({ src, alt: `Chassis color view ${index + 1}` }))
}

export function chassisColorPreviewOption(productKey, colorId, fallbackHero) {
  const gallery = resolveChassisColorGallery(productKey, colorId, fallbackHero)
  const id = colorId === CUSTOM_COLOR_ID ? 'color-custom' : `color-${colorId}`
  return {
    id,
    image: gallery[0]?.src || fallbackHero || null,
    gallery,
  }
}
