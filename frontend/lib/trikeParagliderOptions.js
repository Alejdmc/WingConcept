/** Paragliders for trike configurators (Vanguard, Nomadic, Disruptor trike). */

import manifest from './trikeParagliderManifest.json'

export const NO_PARAGLIDER_ID = 'no-paraglider'

const ORCA_6_SPECS = {
  columns: ['Name – size', 'Orca 6 41', 'Orca 6 44'],
  rows: [
    { label: 'Certificates', values: ['EN/LTF B', 'EN/LTF B'] },
    { label: 'Number of cells', values: ['53'], spanAll: true },
    { label: 'Surface area (flat) [m²]', values: ['41.00', '44.00'] },
    { label: 'Surface area (projected) [m²]', values: ['34.36', '36.87'] },
    { label: 'Span (flat) [m]', values: ['15.00', '15.54'] },
    { label: 'Weight of the wing [kg]', values: ['7.38', '7.88'] },
    { label: 'Total take-off weight – PG [kg]', values: ['120–220', '140–240'] },
  ],
}

const WING_META = {
  'dudek-orca-6': {
    brand: 'DUDEK',
    name: 'Orca 6',
    price: 4252,
    description:
      'Orca 6 was designed with professional pilots in mind. The main objective was to make the wing as comfortable and user-friendly as possible, ensuring daily flights are enjoyable experiences. This paraglider is free flight and can be used on light trikes, recommended for the DISRUPTOR trike WITH ITS PARAMOTOR.',
    infoUrl: 'https://dudek.eu/en/produkt/orca-6/',
    techSpecs: [ORCA_6_SPECS],
    sizes: ['24 m²', '26 m²', '28 m²', '30 m²', '41 m²', '44 m²'],
  },
  'dudek-cabrio': {
    brand: 'DUDEK',
    name: 'Cabrio',
    price: 4524,
    description:
      'The Cabrio is our first design originally dedicated for paramotor tandems, especially heavier two-seater trikes (PPGG). A truly uncompromising paraglider, from the onset created to fulfill specific needs of the PL2 pilots.',
    infoUrl: 'https://dudek.eu/en/produkt/cabrio/',
    techSpecs: [],
    sizes: ['38 m²', '41 m²', '44 m²'],
  },
  'dudek-boson': {
    brand: 'DUDEK',
    name: 'Boson',
    price: 4542,
    description:
      'Boson is a paraglider designed for experienced pilots, flying actively and often, who are well familiar with reflex wings behaviour. Recommended minimum: 300 hours paramotor time and at least 50 hours of annual flight time.',
    infoUrl: 'https://dudek.eu/en/produkt/boson/',
    techSpecs: [],
    sizes: ['28 m²', '30 m²', '32 m²', '34 m²', '36 m²'],
  },
  'apco-play-42-ul': {
    brand: 'APCO Aviation',
    name: 'Play 42 UL',
    price: 3456.2,
    description:
      'The Play 42 UL is the beefed up, heavily reinforced version of Play 42 MKII for loads up to 340 kg. Built to accommodate the majority of paramotor trikes on the market with a higher load limit.',
    infoUrl: 'https://www.apcoaviation.com/play-42-ul/',
    techSpecs: [],
    sizes: ['42 m²'],
  },
  'apco-game-mkiii': {
    brand: 'APCO Aviation',
    name: 'Game MKIII',
    price: 3531,
    description:
      'Game MKIII is equally great for both free flying and for paramotor tandem flying. High efficiency allows its use even with the smallest and weakest engines.',
    infoUrl: 'https://www.apcoaviation.com/game-42mk3/',
    techSpecs: [],
    sizes: ['41 m²', '42 m²'],
  },
  'apco-f3bi-mkii': {
    brand: 'APCO Aviation',
    name: 'F3Bi MKII',
    price: 3580,
    description:
      'The F3 Bi MK-2 is a dedicated full reflex wing for the tandem experience, enhanced with the revolutionary Mohawk system.',
    infoUrl: 'https://www.apcoaviation.com/f3bimk2/',
    techSpecs: [],
    sizes: ['41 m²', '42 m²'],
  },
}

function mapImages(paths, altPrefix) {
  return (paths || []).map((src, index) => ({
    src,
    alt: `${altPrefix} view ${index + 1}`,
  }))
}

function buildWing(id) {
  const meta = WING_META[id]
  const assets = manifest[id]
  if (!meta || !assets) return null

  const displayName = `${meta.brand} ${meta.name}`

  return {
    id,
    ...meta,
    techImages: assets.techImages || [],
    galleryImages: mapImages(assets.galleryImages, displayName),
    colors: (assets.colors || []).map((color) => ({
      id: color.id,
      name: color.name,
      thumb: color.thumb,
      images: mapImages(color.images, `${displayName} ${color.name}`),
    })),
  }
}

export const TRIKE_PARAGLIDERS = Object.keys(WING_META).map(buildWing).filter(Boolean)

export function findTrikeParaglider(id) {
  if (!id || id === NO_PARAGLIDER_ID) return null
  return TRIKE_PARAGLIDERS.find((w) => w.id === id) || null
}

export function paragliderDisplayName(wing) {
  if (!wing) return ''
  return `${wing.brand} ${wing.name}`
}

export function getParagliderDefaultGallery(wing) {
  const firstColor = wing?.colors?.[0]
  if (firstColor?.images?.length) return firstColor.images
  if (wing?.galleryImages?.length) return wing.galleryImages
  return []
}

export function getParagliderColorGallery(wing, colorId) {
  if (!wing || !colorId) return getParagliderDefaultGallery(wing)
  const color = wing.colors.find((c) => c.id === colorId)
  if (!color?.images?.length) return getParagliderDefaultGallery(wing)
  return color.images
}

export function resolveParagliderColorLabel(wing, colorId) {
  if (!wing || !colorId) return ''
  return wing.colors.find((c) => c.id === colorId)?.name || colorId
}
