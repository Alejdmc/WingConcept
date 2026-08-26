/** Nomadic Trike — archivos/Nomadic TRIKE DESCRIPTION ITEMS AND PRICE for web side.pages */

/** Base chassis price — managed separately; do not change without business approval. */
export const NOMADIC_BASE_PRICE = 4879.5

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

export function pickNomadicImage(_urls = [], fallback = NOMADIC_HERO_IMAGE) {
  return NOMADIC_HERO_IMAGE || fallback
}

export const NOMADIC_CHASSIS_SUMMARY = {
  model: 'Nomadic Trike',
  subtitle: 'Basic Style — No Engine, No Propeller & No Accessories',
  tagline: 'Go Further, Land Anywhere',
  description:
    'Designed for adventure paramotoring and exploration in remote environments. Its large tundra tires provide a smooth ride over rough terrain and allow trouble-free takeoffs and landings on challenging ground. Laser-cut stainless steel parts make the Nomadic incredibly strong yet lightweight — only 45 kg dry without the engine.',
}

export const NOMADIC_INCLUDED = [
  {
    icon: 'Package',
    title: 'Nomadic Chassis',
    description:
      'Nomadic chassis with tundra wheels, telescopic rear axle in Aeronautical 7075 aluminum, and your choice of one motor mount: multi-support for Vittorazi Cosmos 300 and Polini engines, or alternate mount for Sky Engine Zeus 300 or Simonini Victor One Super.',
  },
  {
    icon: 'Zap',
    title: 'In-Flight Adjustable Attachment Points',
    description:
      'Innovative system adjusts from tandem to single in flight — ideal for parachutist deployment. The frame attaches to the seat base with a 4-ton resistance wire and a second gravity-adjustment control point for superior balance, less sway, and more control.',
  },
  {
    icon: 'Shield',
    title: 'Integral Frame Protection',
    description:
      'Keeps pilot and passengers safely inside the frame, increasing protection in case of a rollover thanks to the trike\'s unique reinforcement design. Independent passenger footrests prevent unintentional turns.',
  },
  {
    icon: 'Gauge',
    title: 'Front Disc Brake & Agile Steering',
    description:
      'Front disc brake for greater safety — no complicated maneuvers to stop. Steering tube angle and fork offset make the trike agile at low speeds and stable at high speeds. Pilot sits above the passenger for better visibility.',
  },
  {
    icon: 'Truck',
    title: 'Tool-Free Assembly & Transport',
    description:
      'Simple matching-icon system makes assembly and disassembly intuitive. Telescopic rear axles fit in a large pickup truck bed; one person can load them up an ATV ramp.',
  },
]

export const NOMADIC_ENGINES = [
  { name: 'Polini Thor 260', power: '24 HP' },
  { name: 'Polini Thor 303 EVO', power: '38 HP' },
  { name: 'Vittorazi Cosmos 300', power: '36 HP' },
  { name: 'Sky Engine Zeus 300 Boxer', power: '44 HP' },
  { name: 'Simonini Victor One Super', power: '54 HP' },
]

export const NOMADIC_SPECS = {
  'Model': 'Nomadic Trike',
  'Dry Weight (no engine)': '45 kg / 99 lb',
  'Chassis Material': 'Laser-cut stainless steel',
  'Wheels': 'Tundra — all-terrain',
  'Rear Axle': 'Telescopic, Aeronautical 7075 aluminum',
  'Orientation': 'Expedition and off-grid flight',
}
