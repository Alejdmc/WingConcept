/**
 * Galería fija de 3 imágenes por opción del configurador.
 * Rutas importadas desde archivos/imagenes ajustes wingconcept.pages
 * Slots sin foto usan el logo de Wing Concept.
 */

import { FALLBACK_IMAGES } from './imageDefaults'

export const MAX_OPTION_IMAGES = 3

const LOGO_SLOT = {
  src: FALLBACK_IMAGES.logo,
  alt: 'Wing Concept',
  empty: false,
  placeholder: true,
}

export const PROPELLER_BIPALA_IMAGE = '/images/propellers/bipala.jpg'

function partTriplet(slug) {
  return [
    `/images/parts/${slug}-1.png`,
    `/images/parts/${slug}-2.png`,
    `/images/parts/${slug}-3.png`,
  ]
}

function partSingle(slug) {
  return [`/images/parts/${slug}.png`]
}

function engineTriplet(slug) {
  return [
    `/images/engines/${slug}-1.jpg`,
    `/images/engines/${slug}-2.jpg`,
    `/images/engines/${slug}-3.jpg`,
  ]
}

/** Galerías completas (hasta 3) por slug de opción. */
export const OPTION_GALLERY_BY_ID = {
  'accelerator-pedal': partTriplet('accelerator-pedal'),
  'cruise-control': partTriplet('cruise-control'),
  'sun-roof-netting': partTriplet('sun-roof-netting'),
  'sunroof-canopy': partTriplet('sunroof-canopy'),
  'rear-mirror': partTriplet('rear-mirror'),
  'carabiners': partTriplet('carabiners'),
  'fuel-gauge-vanguard': partTriplet('fuel-gauge-vanguard'),
  'auxiliary-lights': partTriplet('auxiliary-lights'),
  'electrical-kit': partTriplet('electrical-kit'),
  'cockpit-liner': partTriplet('cockpit-liner'),
  'parachute-container': [
    '/images/parts/parachute-container-1.png',
    '/images/parts/parachute-container-2.png',
    '/images/parts/parachute-container-3.png',
  ],
  'reserve-chute': [
    '/images/parts/reserve-chute-1.jpg',
    '/images/parts/reserve-chute-2.jpg',
    '/images/parts/reserve-chute-3.jpg',
  ],
  'ballistic-parachute': [
    '/images/parts/parachute-container-1.png',
    '/images/parts/parachute-container-2.png',
    '/images/parts/parachute-container-3.png',
  ],
  bipala: [PROPELLER_BIPALA_IMAGE],
  tripala: [PROPELLER_BIPALA_IMAGE],
  'rotax-912': engineTriplet('rotax-912'),
  'hirth-3503': engineTriplet('hirth-3503'),
  'simonini-v2': engineTriplet('simonini-v2'),
  'polini-260': engineTriplet('polini-260'),
  'polini-303': engineTriplet('polini-303'),
  'vittorazi-300-my25': engineTriplet('vittorazi-300-my25'),
  'zeus-300': engineTriplet('zeus-300'),
  'simonini-victor-1': [
    '/images/engines/simonini-victor-1-1.jpg',
    '/images/engines/simonini-victor-1-2.jpg',
  ],
  'front-bar-protection': partSingle('front-bar-protection'),
  'front-brake': partSingle('front-fork'),
  'bottom-explorer-bag': partSingle('bottom-explorer-bag'),
  'lateral-bag-explorer': partSingle('lateral-bag-explorer'),
  'lateral-bag': partSingle('lateral-bag-explorer'),
  'rock-guard': partSingle('rock-guard'),
  'propeller-guard': partSingle('pilot-dynamic-cage'),
  'instrument-kit-nomadic': partSingle('instrument-kit-nomadic'),
  'instrument-kit-vanguard': partSingle('instrument-kit-vanguard'),
  'instrument-kit': partSingle('instrument-kit-vanguard'),
  'camel-back': partSingle('passenger-harness'),
  'accelerator-pedal-single': partSingle('accelerator-pedal'),
}

function normalizeGalleryItem(item, index) {
  if (typeof item === 'string') {
    return item.trim()
      ? { src: item.trim(), alt: `View ${index + 1}`, empty: false }
      : LOGO_SLOT
  }
  if (item?.src) {
    return { src: item.src, alt: item.alt || `View ${index + 1}`, empty: false }
  }
  return LOGO_SLOT
}

export function padGallery(items = []) {
  const padded = (items || [])
    .filter(Boolean)
    .map(normalizeGalleryItem)

  while (padded.length < MAX_OPTION_IMAGES) {
    padded.push(LOGO_SLOT)
  }

  return padded.slice(0, MAX_OPTION_IMAGES).map((item) => (
    item?.src && !item.empty ? item : LOGO_SLOT
  ))
}

/** Vista base configurador Vanguard — foto 3 fija. */
export const VANGUARD_CONFIGURATOR_GALLERY = padGallery([
  { src: '/images/vanguard/3.png', alt: 'Vanguard V8.0' },
])

/** Vista base configurador Nomadic — primera foto de galería. */
export const NOMADIC_CONFIGURATOR_GALLERY = padGallery([
  { src: '/images/nomadic/2.jpg', alt: 'Nomadic Trike' },
])

export function resolvePropellerImage(optionId, primaryImage) {
  if (optionId === 'tripala' || optionId === 'bipala') {
    return primaryImage || PROPELLER_BIPALA_IMAGE
  }
  return primaryImage || null
}

export function galleryPathsForOption(optionId, primaryImage, cmsGallery = null) {
  if (Array.isArray(cmsGallery) && cmsGallery.length) {
    return cmsGallery.filter(Boolean).slice(0, MAX_OPTION_IMAGES)
  }

  if (optionId && OPTION_GALLERY_BY_ID[optionId]) {
    return OPTION_GALLERY_BY_ID[optionId]
  }

  if (primaryImage && typeof primaryImage === 'string') {
    return [primaryImage.trim()]
  }

  return []
}

export function buildOptionGallery(optionId, primaryImage, fallbackUrls = [], cmsGallery = null) {
  if (!optionId) {
    return padGallery(normalizeGallery(fallbackUrls))
  }

  const paths = galleryPathsForOption(optionId, primaryImage, cmsGallery)
  if (paths.length === 0) {
    return padGallery(normalizeGallery(fallbackUrls))
  }

  return padGallery(paths.map((src, index) => ({
    src,
    alt: `${optionId} view ${index + 1}`,
  })))
}

export function normalizeGallery(urls) {
  return padGallery(
    (urls || []).map((item, index) => {
      if (typeof item === 'string') {
        const src = item.trim()
        return src ? { src, alt: `Product view ${index + 1}` } : LOGO_SLOT
      }
      if (item?.src) return { src: item.src, alt: item.alt || `Product view ${index + 1}`, empty: false }
      return LOGO_SLOT
    }),
  )
}

export function trikeGalleryProductKey(step) {
  if (step === 0) return 'chassis'
  if (step === 1) return 'engines'
  if (step === 2) return 'propellers'
  if (step === 3) return 'parts'
  return 'vanguard'
}

export function disruptorGalleryProductKey(step, variant = 'paramotor') {
  if (step === 1) return 'engines'
  if (variant === 'paramotor') {
    if (step === 3) return 'propellers'
    if (step === 4) return 'parts'
  } else {
    if (step === 2) return 'propellers'
    if (step === 3) return 'parts'
  }
  if (step === 0) return 'chassis'
  return 'disruptor'
}

export function firstGalleryIndex(gallery = []) {
  const idx = gallery.findIndex((item) => item?.src && !item.empty)
  return idx >= 0 ? idx : 0
}

/** Thumbnail principal de una opción (primera imagen del triplete). */
export function optionPrimaryImage(optionId, fallbackImage) {
  const paths = galleryPathsForOption(optionId, fallbackImage)
  return paths[0] || fallbackImage || null
}
