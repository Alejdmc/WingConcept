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
    { label: 'Span (projected) [m]', values: ['11.72', '12.14'] },
    { label: 'Aspect ratio (flat / projected)', values: ['5.55 / 4.00'], spanAll: true },
    { label: 'Weight of the wing [kg]', values: ['7.38', '7.88'] },
    { label: 'Total take-off weight – PG [kg]', values: ['120–220', '140–240'] },
    { label: 'Distance between risers [cm]', values: ['55'], spanAll: true },
    { label: 'Lines', values: ['Technora: 050/090/140/190/280/340 · Dyneema: 350'], spanAll: true },
    { label: 'Fabric', values: ['Porcher Everlast 44 g/m² · Dominico Tex 2044-32PS 33 g/m² · SR-Scrim/SR Laminate 180 g/m²'], spanAll: true },
  ],
}

const CABRIO_SPECS = {
  columns: ['Name – size', 'Cabrio 30', 'Cabrio 34', 'Cabrio 38', 'Cabrio 42'],
  rows: [
    { label: 'Number of cells', values: ['53'], spanAll: true },
    { label: 'Wing area flat [m²]', values: ['30.00', '34.00', '38.00', '42.00'] },
    { label: 'Wing area projected [m²]', values: ['25.51', '28.91', '32.44', '35.71'] },
    { label: 'Wingspan flat [m]', values: ['12.73', '13.55', '14.32', '15.06'] },
    { label: 'Wingspan projected [m]', values: ['10.12', '10.78', '11.39', '11.98'] },
    { label: 'Aspect ratio (flat / projected)', values: ['5.4 / 4.0'], spanAll: true },
    { label: 'Sink rate [m/s]', values: ['min = 1.6 (+/- 0.2)'], spanAll: true },
    { label: 'Speed [km/h]', values: ['min = 32 · trim = 46 · max = 59 (+/- 5)'], spanAll: true },
    { label: 'Canopy weight [kg]', values: ['6.45', '7.07', '7.57', '8.17'] },
    { label: 'Take-off weight [kg]', values: ['110–300', '130–350', '160–400', '210–475'] },
    { label: 'Max take-off weight – experienced [kg]', values: ['350', '400', '450', '500'] },
    { label: 'Distance between risers [cm]', values: ['60'], spanAll: true },
    { label: 'Lines', values: ['Edelrid A-8000U: 050 · Technora: 90/140/190/280/340 · Dyneema: 350'], spanAll: true },
    { label: 'Cloth', values: ['Porcher Sport 38 g/m² · Porcher Everlast 42 g/m² · Dominico Tex 34 g/m² · SR-Scrim/SR Laminate 180 g/m²'], spanAll: true },
  ],
}

const BOSON_SPECS = {
  columns: ['Name – size', 'Boson 31', 'Boson 34'],
  rows: [
    { label: 'Approval – ULM identification', values: ['Yes', 'Yes'] },
    { label: 'Trimmer / Speed system', values: ['Yes / Yes'], spanAll: true },
    { label: 'Cell number', values: ['60'], spanAll: true },
    { label: 'Surface flat [m²]', values: ['31', '34'] },
    { label: 'Surface projected [m²]', values: ['26.73', '29.32'] },
    { label: 'Wingspan flat [m]', values: ['13.52', '14.16'] },
    { label: 'Wingspan projected [m]', values: ['11.06', '11.58'] },
    { label: 'Aspect ratio (flat / projected)', values: ['5.90 / 4.57'], spanAll: true },
    { label: 'Sink rate [m/s]', values: ['min = 1.4 (+/- 0.3)'], spanAll: true },
    { label: 'Speed [km/h]', values: ['min = 35 · trim = 45-65 · max = 70 (+/- 5)'], spanAll: true },
    { label: 'Take-off weight [kg]', values: ['140–260', '170–300'] },
    { label: 'Max take-off weight – competition [kg]', values: ['300', '350'] },
    { label: 'Paraglider weight [kg]', values: ['7.62', '8.20'] },
    { label: 'Distance between risers [cm]', values: ['60'], spanAll: true },
    { label: 'Lines', values: ['A-8000U: 050/090 · Technora: 90/140/190/280/340 · Dyneema: 350'], spanAll: true },
    { label: 'Cloth', values: ['Porcher Classic 38 g/m² · Porcher Everlast 42 g/m² · Dominico Tex 34 g/m² · SR-Scrim/SR Laminate 180 g/m²'], spanAll: true },
  ],
}

const WING_META = {
  'dudek-orca-6': {
    brand: 'DUDEK',
    name: 'Orca 6',
    price: 4252,
    description:
      'Orca 6 was designed with professional pilots in mind. The main objective was to make the wing as comfortable and user-friendly as possible, ensuring daily flights are enjoyable experiences. This paraglider is free flight and can be used on light trikes, recommended for the DISRUPTOR trike WITH ITS PARAMOTOR.',
    infoUrl: 'https://dudek.eu/produkt/orca-6/',
    techSpecs: [ORCA_6_SPECS],
    sizes: ['41 m²', '44 m²'],
  },
  'dudek-cabrio': {
    brand: 'DUDEK',
    name: 'Cabrio',
    price: 4524,
    description:
      'The Cabrio is our first design originally dedicated for paramotor tandems, especially heavier two-seater trikes (PPGG). A truly uncompromising paraglider, from the onset created to fulfill specific needs of the PL2 pilots.',
    infoUrl: 'https://dudek.eu/produkt/cabrio/',
    techSpecs: [CABRIO_SPECS],
    sizes: ['30 m²', '34 m²', '38 m²', '42 m²'],
  },
  'dudek-boson': {
    brand: 'DUDEK',
    name: 'Boson',
    price: 4542,
    description:
      'Boson is a paraglider designed for experienced pilots, flying actively and often, who are well familiar with reflex wings behaviour. Recommended minimum: 300 hours paramotor time and at least 50 hours of annual flight time.',
    infoUrl: 'https://dudek.eu/produkt/boson/',
    techSpecs: [BOSON_SPECS],
    sizes: ['31 m²', '34 m²'],
  },
  'apco-play-42-ul': {
    brand: 'APCO Aviation',
    name: 'Play 42 UL',
    price: 3456.2,
    description:
      'The Play 42 UL is the beefed up, heavily reinforced version of Play 42 MKII for loads up to 340 kg. Built to accommodate the majority of paramotor trikes on the market with a higher load limit.',
    infoUrl: 'https://www.apcoaviation.com/play-42-ul/',
    techSpecs: [{
      columns: ['Play 42 UL', '42'],
      rows: [
        { label: 'Cells', values: ['46'] },
        { label: 'Area [m²]', values: ['42'] },
        { label: 'Area (projected) [m²]', values: ['35.4'] },
        { label: 'Span incl. stabiliser [m]', values: ['14.6'] },
        { label: 'Span (projected) [m]', values: ['12.1'] },
        { label: 'Aspect ratio (flat / projected)', values: ['5.1 / 4.1'] },
        { label: 'Take-off weight – all up [kg]', values: ['Up to 340'] },
        { label: 'Canopy weight [kg]', values: ['9'] },
        { label: 'Root / tip chord [m]', values: ['3.47 / 0.66'] },
        { label: 'Total length of lines [m]', values: ['496'] },
        { label: 'V-min / V-trim / V-max [km/h]', values: ['23 / 38 / 45+'] },
        { label: 'Min sink [m/s]', values: ['1.1'] },
        { label: 'Certification', values: ['APCUL / AFNOR Biplace, DGAC'] },
      ],
    }],
    sizes: ['42 m²'],
  },
  'apco-game-mkiii': {
    brand: 'APCO Aviation',
    name: 'Game MKIII',
    price: 3531,
    description:
      'Game MKIII is equally great for both free flying and for paramotor tandem flying. High efficiency allows its use even with the smallest and weakest engines.',
    infoUrl: 'https://www.apcoaviation.com/game-42mk3/',
    techSpecs: [{
      columns: ['Game MKIII', '39', '42'],
      rows: [
        { label: 'Cells', values: ['50', '52'] },
        { label: 'Area [m²]', values: ['39.6', '42.5'] },
        { label: 'Area (projected) [m²]', values: ['34.9', '37.1'] },
        { label: 'Span incl. stabiliser [m]', values: ['14.4', '15.1'] },
        { label: 'Span (projected) [m]', values: ['11.35', '11.9'] },
        { label: 'Aspect ratio (flat)', values: ['5.1', '5.4'] },
        { label: 'Aspect ratio (projected)', values: ['3.71', '3.93'] },
        { label: 'Take-off weight – tested in-house [kg]', values: ['110–190', '110/140–230'] },
        { label: 'Pilot weight incl. paramotor [kg]', values: ['Up to 286', 'Up to 326'] },
        { label: 'Canopy weight [kg]', values: ['7.45', '7.95'] },
        { label: 'V-min / V-trim / V-max [km/h]', values: ['23 / 38-39 / 46+ (EN.B)'], spanAll: true },
        { label: 'Min sink [m/s]', values: ['1.1'], spanAll: true },
        { label: 'Certification', values: ['EN926-1', 'EN-B / LTF B, DGAC'] },
      ],
    }],
    sizes: ['39 m²', '42 m²'],
  },
  'apco-f3bi-mkii': {
    brand: 'APCO Aviation',
    name: 'F3Bi MKII',
    price: 3580,
    description:
      'The F3 Bi MK-2 is a dedicated full reflex wing for the tandem experience, enhanced with the revolutionary Mohawk system.',
    infoUrl: 'https://www.apcoaviation.com/f3bimk2/',
    techSpecs: [{
      columns: ['F3Bi MKII', '33', '36'],
      rows: [
        { label: 'Cells', values: ['56', '58'] },
        { label: 'Area [m²]', values: ['33', '36'] },
        { label: 'Area (projected) [m²]', values: ['27.9', '30.46'] },
        { label: 'Span incl. stabiliser [m]', values: ['13.5', '14.7'] },
        { label: 'Span (projected) [m]', values: ['10.0', '11.64'] },
        { label: 'Aspect ratio (flat / projected)', values: ['5.7 / 4.23', '6.0 / 4.45'] },
        { label: 'Weight range – paratrike [kg]', values: ['120–387', '120–430'] },
        { label: 'Canopy weight [kg]', values: ['8.1', '8.3'] },
        { label: 'V-min [km/h]', values: ['25'], spanAll: true },
        { label: 'V-trim closed / neutral / open [km/h]', values: ['36-40 / 43-47 / 50-56'], spanAll: true },
        { label: 'V-max [km/h]', values: ['69'], spanAll: true },
        { label: 'Min sink [m/s]', values: ['1.2'], spanAll: true },
        { label: 'Certification', values: ['DGAC', 'DGAC'] },
      ],
    }],
    sizes: ['33 m²', '36 m²'],
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

/** Real wing photos only — the technical sheet is rendered as a data table, not an image. */
function normalizeGallery(wing, colorImages = []) {
  const seen = new Set()
  const merged = []
  for (const item of colorImages) {
    const src = typeof item === 'string' ? item : item?.src
    if (src && !seen.has(src)) {
      seen.add(src)
      merged.push(typeof item === 'string' ? { src: item, alt: `${wing.brand} ${wing.name}` } : item)
    }
  }
  return merged.slice(0, 3)
}

export function getParagliderDefaultGallery(wing) {
  const firstColor = wing?.colors?.[0]
  const colorImages = firstColor?.images?.length
    ? firstColor.images
    : wing?.galleryImages || []
  return normalizeGallery(wing, colorImages)
}

export function getParagliderColorGallery(wing, colorId) {
  if (!wing || !colorId) return getParagliderDefaultGallery(wing)
  const color = wing.colors.find((c) => c.id === colorId)
  if (!color?.images?.length) return getParagliderDefaultGallery(wing)
  return normalizeGallery(wing, color.images)
}

export function resolveParagliderColorLabel(wing, colorId) {
  if (!wing || !colorId) return ''
  return wing.colors.find((c) => c.id === colorId)?.name || colorId
}
