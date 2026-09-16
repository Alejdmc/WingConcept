/** Per-color preview galleries for trike configurators (Vanguard, Nomadic, Disruptor trike). */

import { CUSTOM_COLOR_ID } from './chassisColors'

function triplet(basePath, ext = 'jpg') {
  return [1, 2, 3].map((n) => `${basePath}-${n}.${ext}`)
}

const DISRUPTOR_BLUE = triplet('/images/disruptor/colors/white-blue-candy')
const DISRUPTOR_RED = triplet('/images/disruptor/colors/white-red-candy')
const DISRUPTOR_PURPLE = triplet('/images/disruptor/colors/white-purple-candy')

/** Product-specific color galleries — paths verified on disk under /public/images/. */
const GALLERIES_BY_PRODUCT = {
  vanguard: {
    'candy-red-white': ['/images/vanguard/3.png', '/images/vanguard/2.png', '/images/vanguard/4.png'],
    'candy-purple-white': ['/images/vanguard/1.png', '/images/nomadic/2.jpg', '/images/nomadic/3.jpg'],
    'candy-blue-white': DISRUPTOR_BLUE,
  },
  nomadic: {
    'candy-red-white': ['/images/vanguard/3.png', '/images/vanguard/2.png', '/images/vanguard/7.png'],
    'candy-purple-white': ['/images/nomadic/2.jpg', '/images/nomadic/3.jpg', '/images/nomadic/4.jpg'],
    'candy-blue-white': DISRUPTOR_BLUE,
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
