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

function wingGallery(basePath, count = 3) {
  const paths = []
  for (let n = 1; n <= count; n += 1) {
    const suffix = n === 1 ? 'main.jpg' : `${n}.jpg`
    paths.push(`${basePath}/${suffix}`)
  }
  return paths
}

const PARAMOTOR_ONLY_WINGS = {
  'dudek-universal-11': {
    brand: 'DUDEK',
    name: 'Universal 1.1',
    price: 3560,
    description:
      'Versatile reflex wing for paramotor pilots who want predictable handling and easy inflation across a wide weight range.',
    infoUrl: 'https://dudek.eu/produkt/universal-1-1/',
    sizes: ['23 m²', '25.5 m²', '28 m²', '31 m²', '34 m²'],
    techSpecs: [{
      columns: ['Universal 1.1 – size', '23', '25.5', '28', '31', '34'],
      rows: [
        { label: 'Certification', values: ['EN/LTF B', 'EN/LTF B', 'EN/LTF B', 'EN/LTF B', '–'] },
        { label: 'Number of cells', values: ['50'], spanAll: true },
        { label: 'Surface area flat [m²]', values: ['23.00', '25.50', '28.00', '31.00', '34.00'] },
        { label: 'Surface area projected [m²]', values: ['19.83', '21.98', '24.14', '26.72', '29.31'] },
        { label: 'Wingspan flat [m]', values: ['10.83', '11.40', '11.95', '12.57', '13.17'] },
        { label: 'Aspect ratio (flat / projected)', values: ['5.10 / 3.83'], spanAll: true },
        { label: 'Weight range PPG/PPGG [kg]', values: ['60-95', '70-115', '90-140', '110-170', '135-215'] },
        { label: 'Weight of the wing [kg]', values: ['5.6', '5.95', '6.4', '6.85', '7.35'] },
        { label: 'Lines', values: ['Technora 90/140/190/280/340/420'], spanAll: true },
        { label: 'Cloth', values: ['Porcher Classic 38 g/m² · Dominico 34 g/m² · SR-Scrim/SR Laminate 180 g/m²'], spanAll: true },
      ],
    }],
    images: wingGallery('/images/paragliders/paramotor/dudek-universal-11'),
  },
  'dudek-solo-2': {
    brand: 'DUDEK',
    name: 'Solo 2',
    price: 3673,
    description:
      'Lightweight solo paramotor wing designed for dynamic flight and responsive control without excess weight.',
    infoUrl: 'https://dudek.eu/produkt/solo-2/',
    sizes: ['20 m²', '22 m²', '24 m²', '27 m²'],
    techSpecs: [{
      columns: ['Solo 2 – size', '20', '22', '24', '27'],
      rows: [
        { label: 'EN / LTF certificate', values: ['–', 'B', 'B', 'B'] },
        { label: 'Number of cells', values: ['53'], spanAll: true },
        { label: 'Wing area flat [m²]', values: ['20.00', '22.00', '24.00', '27.00'] },
        { label: 'Wing area projected [m²]', values: ['17.12', '18.83', '20.54', '23.11'] },
        { label: 'Wingspan flat [m]', values: ['10.32', '10.83', '11.31', '12.00'] },
        { label: 'Aspect ratio (flat / projected)', values: ['5.40 / 3.99'], spanAll: true },
        { label: 'Take-off weight PG [kg]', values: ['50-70', '55-80', '65-90', '85-115'] },
        { label: 'Take-off weight PPG [kg]', values: ['50-120', '55-140', '65-160', '85-180'] },
        { label: 'Canopy weight [kg]', values: ['4.68', '4.93', '5.30', '5.74'] },
        { label: 'Lines', values: ['2-80001: 050/070 · Technora: 90/140/190/280/340 · Dyneema: 350'], spanAll: true },
        { label: 'Cloth', values: ['Dominico Tex 41/38 g/m² · Dominico Tex Hard 41/33 g/m² · SR-Scrim/SR Laminate 180 g/m²'], spanAll: true },
      ],
    }],
    images: ['/images/paragliders/paramotor/dudek-solo-2/main.jpg'],
  },
  'dudek-nucleon-4': {
    brand: 'DUDEK',
    name: 'Nucleon 4',
    price: 3969,
    description:
      'Reflex profile wing with strong performance for experienced paramotor pilots seeking speed and stability.',
    infoUrl: 'https://dudek.eu/produkt/nucleon-4/',
    sizes: ['18 m²', '20 m²', '22 m²', '24 m²', '26 m²', '28 m²'],
    techSpecs: [{
      columns: ['Nucleon 4 – size', '18', '20', '22', '24', '26', '28'],
      rows: [
        { label: 'Number of cells', values: ['60'], spanAll: true },
        { label: 'Surface area flat [m²]', values: ['18.00', '20.00', '22.00', '24.00', '26.00', '28.00'] },
        { label: 'Surface area projected [m²]', values: ['15.29', '16.99', '18.68', '20.38', '22.08', '23.78'] },
        { label: 'Span flat [m]', values: ['10.04', '10.58', '11.10', '11.59', '12.07', '12.52'] },
        { label: 'Aspect ratio (flat / projected)', values: ['5.60 / 4.11'], spanAll: true },
        { label: 'Speed [km/h]', values: ['min = 28 · trim = 42-53 · max = 67 (+/- 3)'], spanAll: true },
        { label: 'Total take-off weight [kg]', values: ['70-100', '80-110', '90-120', '100-130', '105-140', '115-150'] },
        { label: 'Weight [kg]', values: ['4.82', '5.13', '5.51', '5.82', '6.24', '6.63'] },
        { label: 'Lines', values: ['Edelrid A-8000U: 050/090 · Technora: 90/140/190/280/340 · Dyneema: 350'], spanAll: true },
        { label: 'Fabric', values: ['Porcher Classic 38 g/m² · Dominico tex 34 g/m² · SR-Scrim/SR Laminate 180 g/m²'], spanAll: true },
      ],
    }],
    images: wingGallery('/images/paragliders/paramotor/dudek-nucleon-4', 2),
  },
  'dudek-snake-4': {
    brand: 'DUDEK',
    name: 'Snake 4',
    price: 4234,
    description:
      'High-performance reflex wing for pilots who demand maximum speed and agility in paramotor flight.',
    infoUrl: 'https://dudek.eu/produkt/snake-4/',
    sizes: ['13 m²', '14 m²', '15 m²', '16 m²', '17 m²', '18 m²', '20 m²', '22 m²'],
    techSpecs: [{
      columns: ['Snake 4 – size', '13', '14', '15', '16', '17', '18', '20', '22'],
      rows: [
        { label: 'Number of cells', values: ['60'], spanAll: true },
        { label: 'Surface area flat [m²]', values: ['13', '14', '15', '16', '17', '18', '20', '22'] },
        { label: 'Surface area projected [m²]', values: ['11.29', '12.16', '13.02', '13.89', '14.76', '15.63', '17.36', '19.1'] },
        { label: 'Span flat [m]', values: ['8.64', '8.97', '9.28', '9.59', '9.88', '10.17', '10.72', '11.3'] },
        { label: 'Aspect ratio (flat / projected)', values: ['5.80 / 4.44'], spanAll: true },
        { label: 'Total take-off weight [kg]', values: ['55-110', '65-120', '75-130', '80-140', '85-150', '90-160', '100-170', '110-180'] },
        { label: 'Weight [kg]', values: ['3.66', '3.83', '4.05', '4.21', '4.40', '4.56', '4.90', '5.30'] },
        { label: 'Lines', values: ['2-80001: 050/070/090/130/190 · Technora: 140/190/280 · Dyneema: 350'], spanAll: true },
        { label: 'Fabric', values: ['Dominico tex 41 g/m² · Porcher Sport 32 g/m² · Dominico tex Hard 41 g/m² · SR-Scrim/SR Laminate 180 g/m²'], spanAll: true },
      ],
    }],
    images: wingGallery('/images/paragliders/paramotor/dudek-snake-4', 2),
  },
  'dudek-driftair-2': {
    brand: 'DUDEK',
    name: 'DriftAir 2',
    price: 3855,
    description:
      'Designed for precision and fun in paramotor slalom and dynamic flying with excellent inflation characteristics.',
    infoUrl: 'https://dudek.eu/produkt/driftair-2/',
    sizes: ['16 m²', '18 m²', '20 m²', '22 m²'],
    techSpecs: [{
      columns: ['DriftAir 2 – size', '16', '18', '20', '22'],
      rows: [
        { label: 'Number of cells', values: ['60'], spanAll: true },
        { label: 'Surface area flat [m²]', values: ['16.00', '18.00', '20.00', '22.00'] },
        { label: 'Surface area projected [m²]', values: ['13.68', '15.39', '17.10', '18.81'] },
        { label: 'Span flat [m]', values: ['9.59', '10.17', '10.72', '11.24'] },
        { label: 'Aspect ratio (flat / projected)', values: ['5.80 / 4.40'], spanAll: true },
        { label: 'Total take-off weight [kg]', values: ['80-120', '90-140', '100-150', '110-160'] },
        { label: 'Weight [kg]', values: ['4.30', '4.60', '4.95', '5.25'] },
        { label: 'Lines', values: ['2-80001: 050/090 · Technora: 90/140/190/280 · Dyneema: 350'], spanAll: true },
        { label: 'Fabric', values: ['Dominico tex 41/36 g/m² · Dominico tex Hard 41 g/m² · SR-Scrim/SR Laminate 180 g/m²'], spanAll: true },
      ],
    }],
    images: wingGallery('/images/paragliders/paramotor/dudek-driftair-2', 2),
  },
  'apco-nrg-iii': {
    brand: 'APCO Aviation',
    name: 'NRG III',
    price: 3355,
    description:
      'Efficient paramotor wing with excellent fuel economy and smooth handling for cross-country exploration.',
    infoUrl: 'https://www.apcoaviation.com/nrg_3/',
    sizes: ['15.5 m²', '16.5 m²', '17.5 m²'],
    techSpecs: [{
      columns: ['NRG III – size', '15.5', '16.5', '17.5'],
      rows: [
        { label: 'Cells', values: ['48', '50', '52'] },
        { label: 'Area [m²]', values: ['15.83', '16.66', '17.5'] },
        { label: 'Area (projected) [m²]', values: ['13.28', '13.98', '14.69'] },
        { label: 'Aspect ratio (flat)', values: ['5.22', '5.49', '5.76'] },
        { label: 'Canopy weight [kg]', values: ['3.9', '4.05', '4.3'] },
        { label: 'Pilot weight – free flight [kg]', values: ['55-115', '60-125', '70-135'] },
        { label: 'Pilot weight – incl. paramotor [kg]', values: ['Up to 125', 'Up to 135', 'Up to 145'] },
        { label: 'V-min / V-trim / V-max [km/h]', values: ['27 / 39-49 / 80+'], spanAll: true },
        { label: 'Min sink [m/s]', values: ['1.4'], spanAll: true },
      ],
    }],
    images: wingGallery('/images/paragliders/paramotor/apco-nrg-iii', 2),
  },
  'apco-hybrid-paramotor': {
    brand: 'APCO Aviation',
    name: 'Hybrid Paramotor',
    price: 3195,
    description:
      'Hybrid design combining free-flight ease with paramotor-specific reinforcement for powered operations.',
    infoUrl: 'https://www.apcoaviation.com/hybrid_pm/',
    sizes: ['Small (20 m²)', 'Medium (22 m²)', 'Large (24 m²)', 'X-Large (25.5 m²)'],
    techSpecs: [{
      columns: ['Hybrid PM', 'Small', 'Medium', 'Large', 'X-Large'],
      rows: [
        { label: 'Cells', values: ['48', '48', '48', '50'] },
        { label: 'Area [m²]', values: ['20', '22', '24', '25.56'] },
        { label: 'Area (projected) [m²]', values: ['16.9', '18.6', '20.3', '21.65'] },
        { label: 'Aspect ratio', values: ['5.1', '5.1', '5.1', '5.25'] },
        { label: 'Pilot weight – PG [kg]', values: ['55-75', '70-90', '85-105', '100-120'] },
        { label: 'Pilot weight – PPG [kg]', values: ['70-95', '85-110', '100-125', '115-140'] },
        { label: 'Canopy weight [kg]', values: ['3.0', '3.1', '3.2', '3.25'] },
        { label: 'Certification', values: ['DGAC EN-B*', 'DGAC EN-B*', 'DGAC EN-B*', 'DGAC'] },
        { label: 'V-min / V-trim / V-max [km/h]', values: ['22 / 35 / 45+'], spanAll: true },
        { label: 'Min sink [m/s]', values: ['1.1'], spanAll: true },
      ],
    }],
    images: wingGallery('/images/paragliders/paramotor/apco-hybrid-paramotor', 2),
  },
  'apco-f3-mkii': {
    brand: 'APCO Aviation',
    name: 'F3 MKII',
    price: 3341,
    description:
      'Dedicated paramotor wing with reflex technology for stable, confidence-inspiring powered flight.',
    infoUrl: 'https://www.apcoaviation.com/f3mk2/',
    sizes: ['22 m²', '24 m²', '26 m²'],
    techSpecs: [{
      columns: ['F3 MKII – size', '22', '24', '26'],
      rows: [
        { label: 'Cells', values: ['56', '58', '60'] },
        { label: 'Area [m²]', values: ['22.60', '24', '25.40'] },
        { label: 'Area (projected) [m²]', values: ['19.11', '20.30', '21.48'] },
        { label: 'Aspect ratio (flat / projected)', values: ['5.77 / 4.28', '6.0 / 4.45', '6.23 / 4.62'] },
        { label: 'Weight range – paramotor [kg]', values: ['70-100', '70-120', '70-140'] },
        { label: 'Weight range – paratrike [kg]', values: ['70-120', '70-140', '70-165'] },
        { label: 'Canopy weight [kg]', values: ['4.35', '4.60', '5.05'] },
        { label: 'V-min [km/h]', values: ['25'], spanAll: true },
        { label: 'V-trim closed / neutral / open [km/h]', values: ['36-40 / 43-47 / 50-56'], spanAll: true },
        { label: 'V-max [km/h] / Min sink [m/s]', values: ['69 / 1.2'], spanAll: true },
      ],
    }],
    images: wingGallery('/images/paragliders/paramotor/apco-f3-mkii', 2),
  },
}

const SHARED_TRIKE_SLUGS = ['dudek-orca-6', 'dudek-cabrio', 'dudek-boson', 'apco-f3bi-mkii']

function buildFallbackWing(id, meta) {
  const displayName = `${meta.brand} ${meta.name}`
  const techImages = (meta.techImages || []).filter(Boolean)
  const galleryPaths = (meta.images || []).filter(Boolean)
  const primarySrc = galleryPaths[0] || techImages[0] || FALLBACK_IMAGE
  const galleryImages = galleryPaths.length
    ? galleryPaths.map((src, index) => ({ src, alt: `${displayName} view ${index + 1}` }))
    : [{ src: primarySrc, alt: displayName }]
  return {
    id,
    ...meta,
    techImages,
    galleryImages,
    colors: [{
      id: 'standard',
      name: 'Standard scheme',
      thumb: primarySrc,
      images: galleryImages,
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
