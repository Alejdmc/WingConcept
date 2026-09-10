/** Paragliders for Disruptor Paramotor configurador — 12 wings per product doc. */

import {
  findTrikeParaglider,
  getParagliderColorGallery,
  getParagliderDefaultGallery,
  NO_PARAGLIDER_ID,
  paragliderDisplayName,
  resolveParagliderColorLabel,
} from './trikeParagliderOptions'

export { NO_PARAGLIDER_ID, paragliderDisplayName, getParagliderColorGallery, getParagliderDefaultGallery, resolveParagliderColorLabel }

const FALLBACK_IMAGE = '/images/front1.jpg'

const PARAMOTOR_ONLY_WINGS = {
  'dudek-universal-11': {
    brand: 'DUDEK',
    name: 'Universal 1.1',
    price: 3560,
    description:
      'Versatile reflex wing for paramotor pilots who want predictable handling and easy inflation across a wide weight range.',
    infoUrl: 'https://dudek.eu/en/produkt/universal-1-1/',
    sizes: ['Standard'],
  },
  'dudek-solo-2': {
    brand: 'DUDEK',
    name: 'Solo 2',
    price: 3673,
    description:
      'Lightweight solo paramotor wing designed for dynamic flight and responsive control without excess weight.',
    infoUrl: 'https://dudek.eu/en/produkt/solo-2/',
    sizes: ['Standard'],
  },
  'dudek-nucleon-4': {
    brand: 'DUDEK',
    name: 'Nucleon 4',
    price: 3969,
    description:
      'Reflex profile wing with strong performance for experienced paramotor pilots seeking speed and stability.',
    infoUrl: 'https://dudek.eu/en/produkt/nucleon-4/',
    sizes: ['Standard'],
  },
  'dudek-snake-4': {
    brand: 'DUDEK',
    name: 'Snake 4',
    price: 4234,
    description:
      'High-performance reflex wing for pilots who demand maximum speed and agility in paramotor flight.',
    infoUrl: 'https://dudek.eu/en/produkt/snake-4/',
    sizes: ['Standard'],
  },
  'dudek-driftair-2': {
    brand: 'DUDEK',
    name: 'DriftAir 2',
    price: 3855,
    description:
      'Designed for precision and fun in paramotor slalom and dynamic flying with excellent inflation characteristics.',
    infoUrl: 'https://dudek.eu/en/produkt/driftair-2/',
    sizes: ['Standard'],
  },
  'apco-nrg-iii': {
    brand: 'APCO Aviation',
    name: 'NRG III',
    price: 3355,
    description:
      'Efficient paramotor wing with excellent fuel economy and smooth handling for cross-country exploration.',
    infoUrl: 'https://www.apcoaviation.com/nrg_3/',
    sizes: ['Standard'],
  },
  'apco-hybrid-paramotor': {
    brand: 'APCO Aviation',
    name: 'Hybrid Paramotor',
    price: 3195,
    description:
      'Hybrid design combining free-flight ease with paramotor-specific reinforcement for powered operations.',
    infoUrl: 'https://www.apcoaviation.com/hybrid_pm/',
    sizes: ['Standard'],
  },
  'apco-f3-mkii': {
    brand: 'APCO Aviation',
    name: 'F3 MKII',
    price: 3341,
    description:
      'Dedicated paramotor wing with reflex technology for stable, confidence-inspiring powered flight.',
    infoUrl: 'https://www.apcoaviation.com/f3mk2/',
    sizes: ['Standard'],
  },
}

const SHARED_TRIKE_SLUGS = ['dudek-orca-6', 'dudek-cabrio', 'dudek-boson', 'apco-f3bi-mkii']

function buildFallbackWing(id, meta) {
  const displayName = `${meta.brand} ${meta.name}`
  const image = { src: FALLBACK_IMAGE, alt: displayName }
  return {
    id,
    ...meta,
    techImages: [],
    galleryImages: [image],
    colors: [{
      id: 'standard',
      name: 'Standard scheme',
      thumb: FALLBACK_IMAGE,
      images: [image],
    }],
  }
}

function buildParamotorWing(id) {
  const trike = findTrikeParaglider(id)
  if (trike) return trike
  const meta = PARAMOTOR_ONLY_WINGS[id]
  if (!meta) return null
  return buildFallbackWing(id, meta)
}

export const PARAMOTOR_PARAGLIDER_IDS = [
  ...Object.keys(PARAMOTOR_ONLY_WINGS),
  ...SHARED_TRIKE_SLUGS,
]

export const PARAMOTOR_PARAGLIDERS = PARAMOTOR_PARAGLIDER_IDS.map(buildParamotorWing).filter(Boolean)

export function findParamotorParaglider(id) {
  if (!id || id === NO_PARAGLIDER_ID) return null
  return PARAMOTOR_PARAGLIDERS.find((w) => w.id === id) || null
}
