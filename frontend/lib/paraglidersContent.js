/** Paragliders & harnesses catalog — archivos/correciones y adiociones de la web side.pages */

export const PARAGLIDER_TABS = [
  { id: 'pg-free', label: 'PG Free', description: 'Free-flight paragliders for foot launch without engine.' },
  { id: 'ppg', label: 'PPG', description: 'Powered paragliding wings designed for paramotor use.' },
  { id: 'harnesses', label: 'Harnesses', description: 'Pilot and passenger harnesses from leading manufacturers.' },
]

/** Example product structure — expandable photos, spec sheet, manual link, price editable in admin. */
export const PARAGLIDER_EXAMPLE = {
  id: 'dudek-accuracy',
  tab: 'harnesses',
  name: 'Dudek Accuracy',
  brand: 'Dudek',
  description:
    'The Accuracy is specifically designed for training and competition in landing accuracy. It features a unique design not found in any other wing produced to date.',
  images: ['/images/front1.jpg'],
  specUrl: 'https://dudek.eu/en/harnesses/?category=398',
  productUrl: 'https://dudek.eu/en/product/accuracy/',
  manualUrl: null,
  priceLabel: 'Contact for price',
}

export const PARAGLIDER_WINGS = {
  pg: [
    'HIKE & FLY', 'MARLIN 2', 'NEMO 5', 'OPTIC 2', 'RUN & FLY', 'V-KING', 'WING 2K',
    'DRIF AIR 2', 'HADRON 3', 'NUCLEON 4', 'SNAKE', 'SOLO 2', 'UNIVERSAL', 'WARP 3',
  ],
  ppg: [
    'BOSON TANDEM TRIKE', 'CABRIO 6', 'ORCA 6',
  ],
}

export const PARAGLIDER_ACCESSORIES = [
  { name: 'Allen 20 Pulley', description: 'The roller and the housing are made of a selected material to ensure the longest possible durability in pulleys used on the risers.' },
  { name: 'Basic Bag', description: 'Compact storage bag for wing transport.' },
  { name: 'Carabiner', description: 'Certified carabiners for paragliding connections.' },
  { name: 'Compression Strap', description: 'Wing compression strap for packing.' },
  { name: 'Neoprene Case for Radio', description: 'Protective case for radio equipment.' },
  { name: 'Moto Pocket', description: 'Storage pocket for paramotor accessories.' },
  { name: 'Ronstan Spreaders', description: 'Spreaders for harness geometry.' },
  { name: 'Twister-A Rotating Swivel', description: 'Rotating swivel for riser connections.' },
  { name: 'Power Seat Comfort', description: 'Soft arm pads and back support increase comfort at launch and in flight. Thick foam isolates from the motor frame and dampens vibration.' },
]

export const PARAGLIDER_HARNESSES = [
  'ACCURACY', 'PENTAGON', 'HIKE & CRUISE', 'AIMX COMBO', 'DISC PASSENGER', 'PILOT SOUL',
  'TECHNO ZERO GRAVITY', 'SEAT FORTA STANDARD', 'AIRA', 'SPED B INK', 'POWERSEAT COMFORT',
]
