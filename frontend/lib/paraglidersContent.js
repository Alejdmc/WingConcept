/** Paragliders & harnesses catalog — archivos/correciones y adiociones de la web side.pages */

import { PARAMOTOR_PARAGLIDERS } from './paramotorParagliderOptions'
import { TRIKE_PARAGLIDERS } from './trikeParagliderOptions'

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
  productUrl: 'https://dudek.eu/en/product/accuracy/',
  priceLabel: 'Contact for price',
}

/** PG Free wings — names from product documentation. */
export const PG_FREE_WINGS = [
  { name: 'HIKE & FLY', brand: 'Ozone', description: 'Ultralight wing for mountain launches and minimal pack volume.', priceLabel: 'Contact for price' },
  { name: 'MARLIN 2', brand: 'Ozone', description: 'Dynamic intermediate wing for pilots seeking playful handling.', priceLabel: 'Contact for price' },
  { name: 'NEMO 5', brand: 'Dudek', description: 'Accessible EN-B wing with forgiving launch and landing characteristics.', priceLabel: 'Contact for price' },
  { name: 'OPTIC 2', brand: 'Ozone', description: 'High-performance intermediate for cross-country and soaring.', priceLabel: 'Contact for price' },
  { name: 'RUN & FLY', brand: 'Ozone', description: 'Compact wing designed for run-and-fly adventures.', priceLabel: 'Contact for price' },
  { name: 'V-KING', brand: 'Ozone', description: 'Slalom and acro-oriented wing for experienced pilots.', priceLabel: 'Contact for price' },
  { name: 'WING 2K', brand: 'Ozone', description: 'Versatile free-flight wing for recreational pilots.', priceLabel: 'Contact for price' },
  { name: 'DRIF AIR 2', brand: 'Dudek', description: 'Precision wing for slalom and dynamic flying.', priceLabel: 'Contact for price' },
  { name: 'HADRON 3', brand: 'Dudek', description: 'High-performance reflex wing for experienced pilots.', priceLabel: 'Contact for price' },
  { name: 'NUCLEON 4', brand: 'Dudek', description: 'Reflex profile with strong paramotor and free-flight crossover appeal.', priceLabel: 'Contact for price' },
  { name: 'SNAKE', brand: 'Dudek', description: 'Speed-focused wing for pilots who push limits.', priceLabel: 'Contact for price' },
  { name: 'SOLO 2', brand: 'Dudek', description: 'Light solo wing for dynamic paramotor and free-flight use.', priceLabel: 'Contact for price' },
  { name: 'UNIVERSAL', brand: 'Dudek', description: 'Versatile wing across a wide weight and skill range.', priceLabel: 'Contact for price' },
  { name: 'WARP 3', brand: 'Ozone', description: 'Competition-class wing for advanced pilots.', priceLabel: 'Contact for price' },
]

function wingToCatalogItem(wing, category) {
  const image = wing.galleryImages?.[0]?.src
    || wing.colors?.[0]?.images?.[0]?.src
    || '/images/front1.jpg'
  return {
    id: wing.id,
    name: wing.name,
    brand: wing.brand,
    category,
    description: wing.description,
    price: wing.price,
    priceLabel: `$${wing.price.toLocaleString(undefined, { minimumFractionDigits: wing.price % 1 ? 2 : 0 })}`,
    image,
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
  { name: 'ACCURACY', brand: 'Dudek', description: 'Training and competition harness for landing accuracy.', priceLabel: 'Contact for price', productUrl: 'https://dudek.eu/en/product/accuracy/' },
  { name: 'PENTAGON', brand: 'Dudek', description: 'Versatile free-flight harness with adjustable geometry.', priceLabel: 'Contact for price' },
  { name: 'HIKE & CRUISE', brand: 'Supair', description: 'Lightweight harness for hike-and-fly missions.', priceLabel: 'Contact for price' },
  { name: 'AIMX COMBO', brand: 'Supair', description: 'Combo harness for tandem and instruction.', priceLabel: 'Contact for price' },
  { name: 'DISC PASSENGER', brand: 'Dudek', description: 'Passenger harness for tandem operations.', priceLabel: 'Contact for price' },
  { name: 'PILOT SOUL', brand: 'Dudek', description: 'Comfort-focused pilot harness for long flights.', priceLabel: 'Contact for price' },
  { name: 'TECHNO ZERO GRAVITY', brand: 'Dudek', description: 'Advanced harness with weight-shift control.', priceLabel: 'Contact for price' },
  { name: 'SEAT FORTA STANDARD', brand: 'Dudek', description: 'Standard seat harness for everyday flying.', priceLabel: 'Contact for price' },
  { name: 'AIRA', brand: 'Dudek', description: 'Lightweight harness for cross-country pilots.', priceLabel: 'Contact for price' },
  { name: 'SPED B INK', brand: 'Dudek', description: 'Speed-focused harness design.', priceLabel: 'Contact for price' },
  { name: 'POWERSEAT COMFORT', brand: 'Dudek', description: 'Paramotor harness with enhanced comfort padding — also available on Disruptor configurador.', priceLabel: '$733', productUrl: 'https://dudek.eu/en/produkt/powerseat-comfort-dp/' },
]
