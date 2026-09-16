/**
 * Galería fija de 3 imágenes por opción del configurador.
 * Rutas importadas desde archivos/imagenes ajustes wingconcept.pages
 * Slots sin foto usan el logo de Wing Concept.
 */

import { FALLBACK_IMAGES } from './imageDefaults'
import { PRODUCT_IDS } from './products'

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

function disruptorOptionTriplet(slug) {
  return [1, 2, 3].map((n) => `/images/disruptor/options/${slug}-${n}.jpg`)
}

function paramotorColorTriplet(colorId) {
  return [1, 2, 3].map((n) => `/images/disruptor/colors/${colorId}-${n}.jpg`)
}

function propellerTriplet() {
  return [
    PROPELLER_BIPALA_IMAGE,
    '/images/propellers/bipala-1.jpg',
    '/images/disruptor/options/bipala-3.jpg',
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
  bipala: propellerTriplet(),
  tripala: [
    '/images/propellers/tripala.jpg',
    '/images/propellers/tripala-1.jpg',
    '/images/propellers/tripala-2.jpg',
  ],
  'white-red-candy': paramotorColorTriplet('white-red-candy'),
  'white-purple-candy': paramotorColorTriplet('white-purple-candy'),
  'white-blue-candy': paramotorColorTriplet('white-blue-candy'),
  customized: paramotorColorTriplet('customized'),
  'paramotor-only': disruptorOptionTriplet('paramotor-only'),
  'add-trike-disruptor': disruptorOptionTriplet('add-trike-disruptor'),
  'vittorazi-moster-185': disruptorOptionTriplet('vittorazi-moster-185'),
  'polini-hand-throttle': disruptorOptionTriplet('polini-hand-throttle'),
  'vittorazi-v-throttle': disruptorOptionTriplet('vittorazi-v-throttle'),
  'off-grid-aviator': disruptorOptionTriplet('off-grid-aviator'),
  'disruptor-harness': disruptorOptionTriplet('disruptor-harness'),
  'power-seat-comfort': disruptorOptionTriplet('power-seat-comfort'),
  'power-seat-light': disruptorOptionTriplet('power-seat-light'),
  'front-container-cockpit': disruptorOptionTriplet('front-container-cockpit'),
  'paramotor-bag-pack': disruptorOptionTriplet('paramotor-bag-pack'),
  'paramotor-lights-kit': disruptorOptionTriplet('paramotor-lights-kit'),
  'globe-160-parachute': disruptorOptionTriplet('globe-160-parachute'),
  'disruptor-pilot-seat': disruptorOptionTriplet('disruptor-pilot-seat'),
  'disruptor-passenger-seat': disruptorOptionTriplet('disruptor-passenger-seat'),
  'explorer-bag': disruptorOptionTriplet('explorer-bag'),
  'protective-cover': disruptorOptionTriplet('protective-cover'),
  'polini-130-evo': engineTriplet('polini-130-evo'),
  'polini-202-racing': engineTriplet('polini-202-racing'),
  'sky-150': engineTriplet('sky-150'),
  'sky-zeus-300': engineTriplet('zeus-300'),
  'vittorazi-atom-80': engineTriplet('vittorazi-atom-80'),
  'vittorazi-moster-185-efi': disruptorOptionTriplet('vittorazi-moster-185'),
  'vittorazi-moster-185-factory-r': disruptorOptionTriplet('vittorazi-moster-185'),
  'vittorazi-cosmos-300': engineTriplet('vittorazi-300-my25'),
  'rotax-912': engineTriplet('rotax-912'),
  'rotax-503-preowned': engineTriplet('rotax-503'),
  RMZ500: engineTriplet('rmz500'),
  'hirth-3503': engineTriplet('hirth-3503'),
  'simonini-v2': engineTriplet('simonini-v2'),
  'polini-260': engineTriplet('polini-260'),
  'polini-303': engineTriplet('polini-303'),
  'vittorazi-300-my25': engineTriplet('vittorazi-300-my25'),
  'zeus-300': engineTriplet('zeus-300'),
  'simonini-victor-1': engineTriplet('simonini-victor-1'),
  'front-bar-protection': partTriplet('front-bar-protection'),
  'front-brake': partTriplet('front-brake'),
  'disruptor-front-brake': disruptorOptionTriplet('front-brake'),
  'bottom-explorer-bag': partTriplet('bottom-explorer-bag'),
  'lateral-bag-explorer': partTriplet('lateral-bag-explorer'),
  'lateral-bag': partTriplet('lateral-bag'),
  'rock-guard': partTriplet('rock-guard'),
  'phone-holder': partTriplet('phone-holder'),
  'instrument-kit-nomadic': partTriplet('instrument-kit-nomadic'),
  'instrument-kit-vanguard': partTriplet('instrument-kit-vanguard'),
  'instrument-kit': partTriplet('instrument-kit-vanguard'),
  'propeller-guard': partSingle('pilot-dynamic-cage'),
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

export function galleryPathsForOption(optionId, primaryImage, cmsGallery = null, productoId = null) {
  if (Array.isArray(cmsGallery) && cmsGallery.length) {
    return cmsGallery.filter(Boolean).slice(0, MAX_OPTION_IMAGES)
  }

  const resolvedId = optionId === 'front-brake' && productoId === PRODUCT_IDS.disruptorParamotor
    ? 'disruptor-front-brake'
    : optionId

  if (resolvedId && OPTION_GALLERY_BY_ID[resolvedId]) {
    return OPTION_GALLERY_BY_ID[resolvedId]
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
