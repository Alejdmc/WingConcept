/** Nomadic V15.0 content from archivos/Nomadic trike just chasis WING CONCEPT.docx.pdf */

/** Base chassis price from archivos/Nomadic trike just chasis WING CONCEPT.docx.pdf */
export const NOMADIC_BASE_PRICE = 4379.5

export const NOMADIC_PRICE_LABEL = `$${NOMADIC_BASE_PRICE.toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`

/** Old placeholder renders — never use in UI. */
export const EXCLUDED_NOMADIC_IMAGES = new Set([
  '/images/nomadic/1.jpg',
  '/images/nomadic1.png',
  '/images/paramotor_trike_ejemplo.PNG',
])

const LEGACY_NOMADIC_BASENAMES = new Set([
  '1.jpg',
  'nomadic1.png',
  'paramotor_trike_ejemplo.png',
])

export function isLegacyNomadicImage(url) {
  if (!url || typeof url !== 'string') return true
  const trimmed = url.trim()
  if (EXCLUDED_NOMADIC_IMAGES.has(trimmed)) return true
  const basename = trimmed.split('/').pop()?.toLowerCase() || ''
  if (LEGACY_NOMADIC_BASENAMES.has(basename)) return true
  if (/\/nomadic\/1\.jpg$/i.test(trimmed)) return true
  return false
}

/** Real product gallery (photos 2–6). Photo 1 is a legacy paramotor render. */
export const NOMADIC_GALLERY = [2, 3, 4, 5, 6].map((n) => ({
  src: `/images/nomadic/${n}.jpg`,
  alt: `Nomadic Trike ${n - 1}`,
}))

export const NOMADIC_HERO_IMAGE = NOMADIC_GALLERY[0].src

export const NOMADIC_GALLERY_URLS = NOMADIC_GALLERY.map((item) => item.src)

export function filterNomadicImages(urls = []) {
  return (urls || []).filter((url) => url && !isLegacyNomadicImage(url))
}

export function pickNomadicImage(urls = [], fallback = NOMADIC_HERO_IMAGE) {
  const filtered = filterNomadicImages(urls)
  return filtered[0] || fallback
}

export const NOMADIC_CHASSIS_SUMMARY = {
  model: 'Nomadic V15.0',
  subtitle: 'Standard — No Engine, No Propeller & No Accessories',
  tagline: 'Exclusive, dynamic design with exceptional weight performance.',
  description:
    'The Nomadic V15.0 features an exclusive, dynamic design with exceptional weight — from 78 kg (171 lb) with a single-cylinder engine. Its new architecture accepts 160–165 cm propellers for up to 125 kg (275.5 lb) of static thrust, with support for multiple engines including Vittorazi Cosmos 300, Polini 303, Sky Engine Zeus 300, and Simonini Victor One 54 HP.',
}

export const NOMADIC_INCLUDED = [
  {
    icon: 'Fuel',
    title: '5-Gallon Fuel Tank',
    description:
      'Lightweight 5 mm tank with hoses ready to connect to the engine and the original internal filter.',
  },
  {
    icon: 'Users',
    title: 'Two Harnesses',
    description:
      'Pilot and passenger harnesses built for long flights without fatigue. The passenger travels in a fetal position for extra passive protection. Pilot sits above for enhanced visibility, with instrument access and CamelBak hydration. Single certified Cobra buckle for quick emergency exit.',
  },
  {
    icon: 'Link',
    title: 'Main Straps',
    description:
      '2-inch main harness with a 4-turn loop to quadruple strength. Two configurations: carabiner below the gravity control system for lower, more accessible controls — or above for the standard industry layout.',
  },
  {
    icon: 'Settings',
    title: 'Multi-Engine Mount',
    description:
      'Multi-sport kit requiring no additional holes. Designed for the Vittorazi Cosmos 300 with radiator mount. Compatible with Polini 303; alternate mounts available for Sky Engine Zeus 300 or Simonini Victor One Super.',
  },
]

export const NOMADIC_ENGINES = [
  { name: 'Vittorazi Cosmos 300 MY25', power: '36 HP' },
  { name: 'Polini Thor 303', power: '38 HP' },
  { name: 'Sky Engine Zeus 300', power: '—' },
  { name: 'Simonini Victor One', power: '54 HP' },
]

export const NOMADIC_SPECS = {
  'Model': 'Nomadic V15.0',
  'Weight (with engine)': 'From 78 kg / 171 lb',
  'Static Thrust': 'Up to 125 kg / 275.5 lb',
  'Propeller Size': '160–165 cm',
  'Chassis Type': 'High-Durability Stainless Steel',
  'Orientation': 'Expedition and Off-Grid Flight',
}
