/** Paragliders & harnesses catalog — archivos/correciones y adiociones de la web side.pages */

import { PARAMOTOR_PARAGLIDERS } from './paramotorParagliderOptions'
import { TRIKE_PARAGLIDERS } from './trikeParagliderOptions'
import {
  catalogSlugForHarness,
  catalogSlugForWing,
  resolveParagliderProductoId,
} from './paraglidersCatalogIds'

export const PARAGLIDER_TABS = [
  {
    id: 'pg-free',
    label: 'PG Free',
    description: 'Free-flight paragliders for foot launch without engine — EN-certified wings for hike & fly, soaring, and cross-country.',
  },
  {
    id: 'ppg',
    label: 'PPG',
    description: 'Powered paragliding wings for Disruptor paramotor — single and tandem reflex profiles from Dudek and APCO.',
  },
  {
    id: 'harnesses',
    label: 'Harnesses',
    description: 'Pilot and passenger harnesses from leading manufacturers — accuracy, expedition, and paramotor-specific designs.',
  },
]

export const PARAGLIDER_EXAMPLE = {
  id: 'dudek-accuracy',
  tab: 'harnesses',
  name: 'Accuracy',
  brand: 'Dudek',
  description:
    'The Accuracy is specifically designed for training and competition in landing accuracy. It features a unique design not found in any other wing produced to date.',
  images: ['/images/front1.jpg'],
  specUrl: 'https://dudek.eu/en/harnesses/?category=398',
  productUrl: 'https://dudek.eu/produkt/accuracy/',
  priceLabel: 'Contact for price',
}

/** PG Free wings — names, brands and spec tables verified against each manufacturer's product page. */
export const PG_FREE_WINGS = [
  {
    name: 'ULTRALITE 5', brand: 'Ozone',
    description: 'Ultralight hike & fly / run & fly wing — the lightest certified dual-surface wing per m² of flat area.',
    priceLabel: 'Contact for price', infoUrl: 'https://flyozone.com/paragliders/products/gliders/ultralite-5',
    image: '/images/paragliders/pg-free/ozone-ultralite-5.jpg', sizes: ['13 m²', '15 m²', '17 m²', '19 m²', '21 m²', '23 m²', '25 m²'],
    techSpecs: [{
      columns: ['Ultralite 5 – size', '13', '15', '17', '19', '21', '23', '25'],
      rows: [
        { label: 'Number of cells', values: ['34'], spanAll: true },
        { label: 'Flat area [m²]', values: ['12.9', '14.9', '16.9', '18.9', '20.8', '22.8', '25.1'] },
        { label: 'Projected area [m²]', values: ['11.4', '13.1', '14.7', '16.5', '18.1', '19.9', '21.9'] },
        { label: 'Flat span [m]', values: ['7.7', '8.2', '8.8', '9.3', '9.7', '10.2', '10.7'] },
        { label: 'Aspect ratio (flat / projected)', values: ['4.56 / 3.4'], spanAll: true },
        { label: 'Glider weight [kg]', values: ['1.44', '1.59', '1.76', '1.93', '2.07', '2.23', '2.41'] },
        { label: 'In-flight weight range [kg]', values: ['55-90', '55-90', '55-90', '55-95', '55-100', '65-110', '75-120'] },
        { label: 'Certification', values: ['–', '–', 'C', 'B', 'A', 'A', 'A'] },
      ],
    }],
  },
  {
    name: 'MARLIN 2', brand: 'Dudek',
    description: 'Dedicated ground-handling training wing — stays calm in strong wind so students can train launches safely. Not certified for flight.',
    priceLabel: 'Contact for price', infoUrl: 'https://dudek.eu/produkt/marlin-2/',
    image: '/images/paragliders/pg-free/dudek-marlin-2.jpg', sizes: ['12 m²'],
    techSpecs: [{
      columns: ['Marlin 2', '12'],
      rows: [
        { label: 'Certification', values: ['Not certified (not for flying)'] },
        { label: 'Number of cells', values: ['32'] },
        { label: 'Surface area flat [m²]', values: ['12.00'] },
        { label: 'Surface area projected [m²]', values: ['10.56'] },
        { label: 'Span flat [m]', values: ['7.59'] },
        { label: 'Aspect ratio (flat / projected)', values: ['4.80 / 3.65'] },
        { label: 'Weight [kg]', values: ['2.79'] },
        { label: 'Fabric', values: ['Dominico tex 41 g/m² · Porcher Universal 38 g/m² · Porcher Hard 40 g/m²'] },
      ],
    }],
  },
  {
    name: 'NEMO 5', brand: 'Dudek',
    description: 'Accessible EN-A wing with forgiving launch and landing characteristics — built for schools and recreational pilots.',
    priceLabel: 'Contact for price', infoUrl: 'https://dudek.eu/produkt/nemo-5/',
    image: '/images/paragliders/pg-free/dudek-nemo-5/main.jpg', sizes: ['20 m²', '23 m²', '25 m²', '28 m²', '31 m²'],
    techSpecs: [{
      columns: ['Nemo 5 – size', '20', '23', '25', '28', '31'],
      rows: [
        { label: 'Certification EN/LTF', values: ['A'], spanAll: true },
        { label: 'Number of cells', values: ['42'], spanAll: true },
        { label: 'Surface area flat [m²]', values: ['20.60', '23.00', '25.30', '28.00', '31.00'] },
        { label: 'Surface area projected [m²]', values: ['17.21', '19.22', '21.14', '23.40', '25.90'] },
        { label: 'Wingspan flat [m]', values: ['10.20', '10.78', '11.30', '11.89', '12.51'] },
        { label: 'Aspect ratio (flat / projected)', values: ['5.05 / 3.69'], spanAll: true },
        { label: 'Take-off weight PG [kg]', values: ['45-75', '55-80', '70-95', '85-110', '100-135'] },
        { label: 'Take-off weight PPG [kg]', values: ['45-90', '55-100', '70-115', '85-130', '100-155'] },
        { label: 'Canopy weight [kg]', values: ['4.04', '4.40', '4.65', '5.03', '5.47'] },
      ],
    }],
  },
  {
    name: 'OPTIC 2', brand: 'Dudek',
    description: 'Three-row EN/LTF B cross-country and recreational wing with 5.5 aspect ratio and outstanding lateral stability.',
    priceLabel: 'Contact for price', infoUrl: 'https://dudek.eu/produkt/optic-2/',
    image: '/images/paragliders/pg-free/dudek-optic-2-freeflight.jpg', sizes: ['22 m²', '24 m²', '26 m²', '28 m²', '30 m²'],
    techSpecs: [{
      columns: ['Optic 2 – size', '22', '24', '26', '28', '30'],
      rows: [
        { label: 'Certification EN/LTF', values: ['B'], spanAll: true },
        { label: 'Number of cells', values: ['51'], spanAll: true },
        { label: 'Surface area flat [m²]', values: ['22.00', '24.00', '26.00', '28.20', '30.40'] },
        { label: 'Surface area projected [m²]', values: ['18.81', '20.52', '22.23', '24.12', '26.00'] },
        { label: 'Span flat [m]', values: ['11.00', '11.49', '11.96', '12.45', '12.93'] },
        { label: 'Aspect ratio (flat / projected)', values: ['5.50 / 4.10'], spanAll: true },
        { label: 'Speed [km/h]', values: ['trim = 37 · max = 51 (+/- 2)'], spanAll: true },
        { label: 'Total take-off weight [kg]', values: ['60-75', '70-90', '85-105', '100-120', '115-140'] },
        { label: 'Canopy weight [kg]', values: ['4.74', '5.05', '5.37', '5.71', '6.01'] },
      ],
    }],
  },
  {
    name: 'RUN&FLY 2', brand: 'Dudek',
    description: 'Record-light hike & fly wing — under 1 kg, fits in a 4-liter bag. Safe take-offs with auto-stabilization.',
    priceLabel: 'Contact for price', infoUrl: 'https://dudek.eu/produkt/runfly-2/',
    image: '/images/paragliders/pg-free/dudek-runfly-2.jpg', sizes: ['14 m²', '16 m²', '18 m²', '20 m²'],
    techSpecs: [{
      columns: ['Run&Fly 2 – size', '14', '16', '18', '20'],
      rows: [
        { label: 'Load test EN 926-1', values: ['Yes'], spanAll: true },
        { label: 'Number of cells', values: ['41'], spanAll: true },
        { label: 'Area flat [m²]', values: ['14.00', '16.00', '18.00', '20.00'] },
        { label: 'Area projected [m²]', values: ['11.87', '13.56', '15.26', '16.95'] },
        { label: 'Span flat [m]', values: ['8.19', '8.76', '9.29', '9.78'] },
        { label: 'Aspect ratio (flat / projected)', values: ['4.80 / 3.58'], spanAll: true },
        { label: 'Weight [kg]', values: ['0.94', '1.04', '1.13', '1.20'] },
        { label: 'Take-off weight [kg]', values: ['45-105', '45-105', '50-105', '60-105'] },
      ],
    }],
  },
  {
    name: 'V-KING', brand: 'Dudek',
    description: 'Compact single-skin EN-B wing built for free flying and paramotoring — ideal travel wing, packs down small.',
    priceLabel: 'Contact for price', infoUrl: 'https://dudek.eu/produkt/v-king/',
    image: '/images/paragliders/pg-free/dudek-v-king.jpg', sizes: ['16 m²', '18 m²', '20 m²', '23 m²'],
    techSpecs: [{
      columns: ['V-King – size', '16', '18', '20', '23'],
      rows: [
        { label: 'Number of cells', values: ['37'], spanAll: true },
        { label: 'Wing area flat [m²]', values: ['16.00', '18.00', '20.50', '23.50'] },
        { label: 'Wing area projected [m²]', values: ['13.75', '15.46', '17.61', '20.19'] },
        { label: 'Wingspan flat [m]', values: ['8.76', '9.29', '9.92', '10.62'] },
        { label: 'Aspect ratio (flat / projected)', values: ['4.80 / 3.58'], spanAll: true },
        { label: 'Total take-off weight PG [kg]', values: ['50-74', '60-85', '80-100', '100-130'] },
        { label: 'Total take-off weight PPG [kg]', values: ['50-105', '60-120', '80-135', '100-155'] },
        { label: 'Canopy weight [kg]', values: ['1.96', '2.12', '2.32', '2.54'] },
      ],
    }],
  },
  {
    name: 'BUZZ', brand: 'Ozone',
    description: 'Versatile EN/DHV 1-2 free-flight wing for recreational pilots progressing beyond their first years in the sport.',
    priceLabel: 'Contact for price', infoUrl: 'https://flyozone.com/paragliders/products/gliders/buzz',
    image: '/images/paragliders/pg-free/ozone-buzz.jpg', sizes: ['XS', 'S', 'M', 'L', 'XL'],
    techSpecs: [{
      columns: ['Buzz – size', 'XS', 'S', 'M', 'L', 'XL'],
      rows: [
        { label: 'Number of cells', values: ['42'], spanAll: true },
        { label: 'Area flat [m²]', values: ['22.3', '24.5', '26.55', '29.1', '31.95'] },
        { label: 'Area projected [m²]', values: ['19.55', '20.93', '22.7', '24.86', '27.25'] },
        { label: 'Aspect ratio (flat / projected)', values: ['5.1 / 3.64'], spanAll: true },
        { label: 'Glider weight [kg]', values: ['5.2', '5.5', '5.8', '6.2', '6.5'] },
        { label: 'In-flight weight range [kg]', values: ['55-70', '65-85', '80-100', '95-115', '110-135'] },
        { label: 'DHV / EN', values: ['1-2'], spanAll: true },
      ],
    }],
  },
  {
    name: 'DRIFTAIR 2', brand: 'Dudek',
    description: 'Freestyle-oriented dynamic PPG wing — precise steering, stable flight, great performance for dynamic maneuvers.',
    priceLabel: 'Contact for price', infoUrl: 'https://dudek.eu/produkt/driftair-2/',
    image: '/images/paragliders/pg-free/dudek-driftair-2/main.jpg', sizes: ['16 m²', '18 m²', '20 m²', '22 m²'],
    techSpecs: [{
      columns: ['DriftAir 2 – size', '16', '18', '20', '22'],
      rows: [
        { label: 'Number of cells', values: ['60'], spanAll: true },
        { label: 'Surface area flat [m²]', values: ['16.00', '18.00', '20.00', '22.00'] },
        { label: 'Surface area projected [m²]', values: ['13.68', '15.39', '17.10', '18.81'] },
        { label: 'Aspect ratio (flat / projected)', values: ['5.80 / 4.40'], spanAll: true },
        { label: 'Total take-off weight [kg]', values: ['80-120', '90-140', '100-150', '110-160'] },
        { label: 'Weight [kg]', values: ['4.30', '4.60', '4.95', '5.25'] },
      ],
    }],
  },
  {
    name: 'HADRON 3', brand: 'Dudek',
    description: 'Cross-country reflex wing combining the agility of Hadron XX with the ease of Hadron 1.1 — for active, experienced pilots.',
    priceLabel: 'Contact for price', infoUrl: 'https://dudek.eu/produkt/hadron-3/',
    image: '/images/paragliders/pg-free/dudek-hadron-3/main.jpg', sizes: ['16 m²', '18 m²', '20 m²', '22 m²', '24 m²'],
    techSpecs: [{
      columns: ['Hadron 3 – size', '16', '18', '20', '22', '24'],
      rows: [
        { label: 'Number of cells', values: ['62'], spanAll: true },
        { label: 'Surface area flat [m²]', values: ['16.00', '18.00', '20.00', '22.00', '24.00'] },
        { label: 'Surface area projected [m²]', values: ['13.52', '15.21', '16.89', '18.58', '20.27'] },
        { label: 'Aspect ratio (flat / projected)', values: ['6.00 / 4.51'], spanAll: true },
        { label: 'Speed [km/h]', values: ['min = 29 · trim = 45-58 · max = 71 (+/- 3)'], spanAll: true },
        { label: 'Total take-off weight [kg]', values: ['80-100', '90-110', '100-120', '110-135', '120-150'] },
        { label: 'Weight of the wing [kg]', values: ['4.30', '4.66', '4.92', '5.28', '5.64'] },
      ],
    }],
  },
  {
    name: 'NUCLEON 4', brand: 'Dudek',
    description: 'Classic reflex paramotor wing — solid reflex, very easy launch, pleasant steering, good economy and maneuverability.',
    priceLabel: 'Contact for price', infoUrl: 'https://dudek.eu/produkt/nucleon-4/',
    image: '/images/paragliders/pg-free/dudek-nucleon-4/main.jpg', sizes: ['18 m²', '20 m²', '22 m²', '24 m²', '26 m²', '28 m²'],
    techSpecs: [{
      columns: ['Nucleon 4 – size', '18', '20', '22', '24', '26', '28'],
      rows: [
        { label: 'Number of cells', values: ['60'], spanAll: true },
        { label: 'Surface area flat [m²]', values: ['18.00', '20.00', '22.00', '24.00', '26.00', '28.00'] },
        { label: 'Aspect ratio (flat / projected)', values: ['5.60 / 4.11'], spanAll: true },
        { label: 'Speed [km/h]', values: ['min = 28 · trim = 42-53 · max = 67 (+/- 3)'], spanAll: true },
        { label: 'Total take-off weight [kg]', values: ['70-100', '80-110', '90-120', '100-130', '105-140', '115-150'] },
        { label: 'Weight [kg]', values: ['4.82', '5.13', '5.51', '5.82', '6.24', '6.63'] },
      ],
    }],
  },
  {
    name: 'SNAKE 4', brand: 'Dudek',
    description: 'Dynamic slalom racing wing — exceptional resistance to collapses, highly fast in turns.',
    priceLabel: 'Contact for price', infoUrl: 'https://dudek.eu/produkt/snake-4/',
    image: '/images/paragliders/pg-free/dudek-snake-4/main.jpg', sizes: ['13 m²', '15 m²', '17 m²', '18 m²', '20 m²', '22 m²'],
    techSpecs: [{
      columns: ['Snake 4 – size', '13', '15', '17', '18', '20', '22'],
      rows: [
        { label: 'Number of cells', values: ['60'], spanAll: true },
        { label: 'Surface area flat [m²]', values: ['13', '15', '17', '18', '20', '22'] },
        { label: 'Aspect ratio (flat / projected)', values: ['5.80 / 4.44'], spanAll: true },
        { label: 'Total take-off weight [kg]', values: ['55-110', '75-130', '85-150', '90-160', '100-170', '110-180'] },
        { label: 'Weight [kg]', values: ['3.66', '4.05', '4.40', '4.56', '4.90', '5.30'] },
      ],
    }],
  },
  {
    name: 'SOLO 2', brand: 'Dudek',
    description: 'Fully reflex paramotor wing with a pleasant flight experience and a high level of passive safety in its class.',
    priceLabel: 'Contact for price', infoUrl: 'https://dudek.eu/produkt/solo-2/',
    image: '/images/paragliders/pg-free/dudek-solo-2/main.jpg', sizes: ['20 m²', '22 m²', '24 m²', '27 m²'],
    techSpecs: [{
      columns: ['Solo 2 – size', '20', '22', '24', '27'],
      rows: [
        { label: 'EN / LTF certificate', values: ['–', 'B', 'B', 'B'] },
        { label: 'Number of cells', values: ['53'], spanAll: true },
        { label: 'Wing area flat [m²]', values: ['20.00', '22.00', '24.00', '27.00'] },
        { label: 'Aspect ratio (flat / projected)', values: ['5.40 / 3.99'], spanAll: true },
        { label: 'Take-off weight PPG [kg]', values: ['50-120', '55-140', '65-160', '85-180'] },
        { label: 'Canopy weight [kg]', values: ['4.68', '4.93', '5.30', '5.74'] },
      ],
    }],
  },
  {
    name: 'UNIVERSAL 1.1', brand: 'Dudek',
    description: 'First free-flying EN-B wing convertible by the pilot into a full paramotor canopy — ideal for beginner and recreational pilots.',
    priceLabel: 'Contact for price', infoUrl: 'https://dudek.eu/produkt/universal-1-1/',
    image: '/images/paragliders/pg-free/dudek-universal/main.jpg', sizes: ['23 m²', '25.5 m²', '28 m²', '31 m²', '34 m²'],
    techSpecs: [{
      columns: ['Universal 1.1 – size', '23', '25.5', '28', '31', '34'],
      rows: [
        { label: 'Certification', values: ['EN/LTF B', 'EN/LTF B', 'EN/LTF B', 'EN/LTF B', '–'] },
        { label: 'Number of cells', values: ['50'], spanAll: true },
        { label: 'Surface area flat [m²]', values: ['23.00', '25.50', '28.00', '31.00', '34.00'] },
        { label: 'Aspect ratio (flat / projected)', values: ['5.10 / 3.83'], spanAll: true },
        { label: 'Weight range PG [kg]', values: ['60-75', '70-95', '90-115', '110-140', '135-170'] },
        { label: 'Weight of the wing [kg]', values: ['5.6', '5.95', '6.4', '6.85', '7.35'] },
      ],
    }],
  },
  {
    name: 'WARP 3', brand: 'Dudek',
    description: 'High-performance cross-country competition wing — significantly expanded speed range and improved roll stability.',
    priceLabel: 'Contact for price', infoUrl: 'https://dudek.eu/produkt/warp-3/',
    image: '/images/paragliders/pg-free/dudek-warp-3.jpg', sizes: ['16 m²', '17 m²', '18 m²', '20 m²', '22 m²'],
    techSpecs: [{
      columns: ['Warp 3 – size', '16', '17', '18', '20', '22'],
      rows: [
        { label: 'Number of cells', values: ['62'], spanAll: true },
        { label: 'Surface area flat [m²]', values: ['16', '17', '18', '20', '22'] },
        { label: 'Surface area projected [m²]', values: ['13.62', '14.47', '15.32', '17.02', '18.72'] },
        { label: 'Aspect ratio (flat / projected)', values: ['5.90 / 4.36'], spanAll: true },
        { label: 'Total take-off weight [kg]', values: ['80-130', '85-135', '90-140', '100-150', '110-160'] },
        { label: 'Weight [kg]', values: ['4.18', '4.34', '4.50', '4.80', '5.10'] },
      ],
    }],
  },
]

function wingToCatalogItem(wing, category) {
  const image = wing.galleryImages?.[0]?.src
    || wing.colors?.[0]?.images?.[0]?.src
    || wing.image
    || '/images/front1.jpg'
  const catalogSlug = catalogSlugForWing(wing.id)
  return {
    id: wing.id,
    catalogSlug,
    productoId: resolveParagliderProductoId({ wingId: wing.id, slug: catalogSlug }),
    name: wing.name,
    brand: wing.brand,
    category,
    description: wing.description,
    price: wing.price,
    priceLabel: wing.priceLabel || (typeof wing.price === 'number'
      ? `$${wing.price.toLocaleString(undefined, { minimumFractionDigits: wing.price % 1 ? 2 : 0 })}`
      : 'Contact for price'),
    image,
    techSpecs: wing.techSpecs || [],
    colors: wing.colors || [],
    sizes: wing.sizes || ['Standard'],
    infoUrl: wing.infoUrl,
    configuratorHref: '/paramotors/disruptor/configurador',
  }
}

/** PPG wings — same 12 as Disruptor paramotor configurador. */
export const PPG_WINGS = PARAMOTOR_PARAGLIDERS.map((w) => wingToCatalogItem(w, 'PPG'))

/** Trike wings — available on Vanguard, Nomadic, Disruptor trike configurators. */
export const TRIKE_WING_CATALOG = TRIKE_PARAGLIDERS.map((w) => ({
  ...wingToCatalogItem(w, 'Trike'),
  configuratorHref: '/paratrike/vanguard/configuration',
}))

export const PARAGLIDER_ACCESSORIES = [
  { name: 'Allen 20 Pulley', description: 'The roller and the housing are made of a selected material to ensure the longest possible durability in pulleys used on the risers.', priceLabel: 'Contact for price' },
  { name: 'Basic Bag', description: 'Compact storage bag for wing transport.', priceLabel: 'Contact for price' },
  { name: 'Carabiner', description: 'Certified carabiners for paragliding connections.', priceLabel: 'Contact for price' },
  { name: 'Compression Strap', description: 'Wing compression strap for packing.', priceLabel: 'Contact for price' },
  { name: 'Neoprene Case for Radio', description: 'Protective case for radio equipment.', priceLabel: 'Contact for price' },
  { name: 'Moto Pocket', description: 'Storage pocket for paramotor accessories.', priceLabel: 'Contact for price' },
  { name: 'Ronstan Spreaders', description: 'Spreaders for harness geometry.', priceLabel: 'Contact for price' },
  { name: 'Twister-A Rotating Swivel', description: 'Rotating swivel for riser connections.', priceLabel: 'Contact for price' },
  { name: 'Power Seat Comfort', description: 'Soft arm pads and back support increase comfort at launch and in flight. Thick foam isolates from the motor frame and dampens vibration.', priceLabel: '$733' },
]

export const PARAGLIDER_HARNESSES = [
  { name: 'ACCURACY', brand: 'Dudek', description: 'Training and competition harness for landing accuracy.', priceLabel: 'Contact for price', productUrl: 'https://dudek.eu/produkt/accuracy/' },
  { name: 'PENTAGON', brand: 'Dudek', description: 'Versatile free-flight harness with adjustable geometry.', priceLabel: 'Contact for price' },
  { name: 'HIKE & CRUISE', brand: 'Supair', description: 'Lightweight harness for hike-and-fly missions.', priceLabel: 'Contact for price' },
  { name: 'AIMX COMBO', brand: 'Supair', description: 'Combo harness for tandem and instruction.', priceLabel: 'Contact for price' },
  { name: 'DISC PASSENGER', brand: 'Dudek', description: 'Passenger harness for tandem operations.', priceLabel: 'Contact for price' },
  { name: 'PILOT SOUL', brand: 'Dudek', description: 'Comfort-focused pilot harness for long flights.', priceLabel: 'Contact for price' },
  { name: 'TECHNO ZERO GRAVITY', brand: 'Dudek', description: 'Advanced harness with weight-shift control.', priceLabel: 'Contact for price' },
  { name: 'SEAT FORTA STANDARD', brand: 'Dudek', description: 'Standard seat harness for everyday flying.', priceLabel: 'Contact for price' },
  { name: 'AIRA', brand: 'Dudek', description: 'Lightweight harness for cross-country pilots.', priceLabel: 'Contact for price' },
  { name: 'SPED B INK', brand: 'Dudek', description: 'Speed-focused harness design.', priceLabel: 'Contact for price' },
  {
    id: 'powerseat-comfort',
    harnessId: 'powerseat-comfort',
    catalogSlug: catalogSlugForHarness('powerseat-comfort'),
    productoId: resolveParagliderProductoId({ harnessId: 'powerseat-comfort', slug: catalogSlugForHarness('powerseat-comfort') }),
    name: 'POWERSEAT COMFORT',
    brand: 'Dudek',
    description: 'Paramotor harness with enhanced comfort padding — also available on Disruptor configurador.',
    price: 733,
    priceLabel: '$733',
    productUrl: 'https://dudek.eu/produkt/powerseat-comfort-dp/',
  },
]
