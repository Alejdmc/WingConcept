/** Vanguard V8.0 standard chassis — archivos/VANGUARD TRIKE DESCRIPTION ITEMS AND PRICE.docx */

export const VANGUARD_BASE_PRICE = 5950.25

/** Old flat filenames / placeholder renders — never use in UI. */
export const EXCLUDED_VANGUARD_IMAGES = new Set([
  '/images/1vanguard.png',
  '/images/paramotor_trike_ejemplo.PNG',
  '/images/nomadic/1.jpg',
  '/images/nomadic1.png',
])

const LEGACY_VANGUARD_BASENAMES = new Set([
  '1vanguard.png',
  'paramotor_trike_ejemplo.png',
  'nomadic1.png',
])

export function isLegacyVanguardImage(url) {
  if (!url || typeof url !== 'string') return true
  const trimmed = url.trim().split('?')[0]
  if (EXCLUDED_VANGUARD_IMAGES.has(trimmed)) return true
  const basename = trimmed.split('/').pop()?.toLowerCase() || ''
  if (LEGACY_VANGUARD_BASENAMES.has(basename)) return true
  if (/^\d+vanguard\.png$/i.test(basename)) return true
  return false
}

/** Real product gallery (photos 1–10 on disk under /images/vanguard/). */
export const VANGUARD_GALLERY = Array.from({ length: 10 }, (_, i) => ({
  src: `/images/vanguard/${i + 1}.png`,
  alt: `Vanguard V8.0 ${i + 1}`,
}))

export const VANGUARD_HERO_IMAGE = '/images/vanguard/3.png'

export const VANGUARD_GALLERY_URLS = VANGUARD_GALLERY.map((item) => item.src)

export function filterVanguardImages(urls = []) {
  return (urls || []).filter((url) => url && !isLegacyVanguardImage(url))
}

export function pickVanguardImage(_urls = [], fallback = VANGUARD_HERO_IMAGE) {
  return VANGUARD_HERO_IMAGE || fallback
}

/** Gallery grid — foto 3 primero (cara del producto), resto sin cambiar orden relativo. */
export const VANGUARD_GALLERY_ORDERED = [
  VANGUARD_GALLERY[2],
  ...VANGUARD_GALLERY.filter((_, index) => index !== 2),
]

export const VANGUARD_CHASSIS_SUMMARY = {
  model: 'Vanguard V8.0',
  subtitle: 'Basic Style — No Engine, No Propeller & No Accessories',
  description:
    'Unique trike with three interchangeable pilot baskets or flight modes — Commercial, Adventure, and Reportage — making your trike a three-in-one. Adjustable center of gravity in flight lets you deploy a parachutist and shift from tandem to single mid-flight, so you can continue flying solo and land safely. Designed for versatility and safety that protect pilot and passenger.',
}

export const VANGUARD_INCLUDED = [
  {
    icon: 'Package',
    title: 'Chassis with Active Suspension',
    description:
      'Versatile chassis in any color or flying style — Commercial, Dynamic, Adventure, or Reportage. Pilot sits above the frame for excellent visibility. Includes SSS seat swap, active S.A. shock absorbers, and interchangeable mission pods.',
  },
  {
    icon: 'Fuel',
    title: '17-Gallon Fuel Tank',
    description:
      '3 mm UV- and gasoline-resistant plastic tank with ergonomic seat-shaped design that keeps the center of gravity fixed as fuel is consumed. Analog sight gauge in liters with 8 L (≈1 hour) reserve.',
  },
  {
    icon: 'Users',
    title: 'Two Harnesses',
    description:
      'Pilot and passenger harnesses built for long flights. Passenger travels in a fetal position for passive protection. Pilot harness provides enhanced visibility, instrument access, and CamelBak hydration. Single certified Cobra buckle for emergency exit.',
  },
  {
    icon: 'Link',
    title: 'Main Straps',
    description:
      '2-inch main harness with a 4-turn loop to quadruple strength. Two carabiner positions: below the gravity control system for lower, more accessible controls — or above for the standard industry layout.',
  },
  {
    icon: 'Gauge',
    title: 'Hand Throttle',
    description:
      'Long-lever manual throttle to reduce hand strain on dual-carburetor engines. Includes kill switch; recommended to add the engine electrical kit for dual-ignition setups.',
  },
  {
    icon: 'Settings',
    title: 'Engine Mount',
    description:
      'Exclusive multi-engine mount for Rotax 503, Rotax 582, Hirth 35 series, or Simonini Victor 2. Three layers of anti-vibration: raised aluminum plates, support bushings, and independent engine band on nylon bushings.',
  },
]
