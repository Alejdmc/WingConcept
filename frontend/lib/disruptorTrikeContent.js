/** Trike Disruptor — archivos/TEXTO PARA EL TRIKE DISRUPTOR.pdf (summaries in English) */

export const DISRUPTOR_TRIKE_BASE_PRICE = 2500

export const DISRUPTOR_TRIKE_GALLERY = [1, 2, 3, 4].map((n) => ({
  src: `/images/disruptor/trike-${n}.jpg`,
  alt: `Disruptor Trike ${n}`,
}))

export const DISRUPTOR_TRIKE_HERO = DISRUPTOR_TRIKE_GALLERY[0].src

export const DISRUPTOR_TRIKE_SUMMARY = {
  model: 'Trike Disruptor',
  subtitle: 'Chassis Only — Harnesses Sold Separately',
  tagline: 'Conquer the sky with real passive and active safety.',
  description:
    'Exclusive design for the Disruptor paratrike — aggressive styling, real passive and active safety, and room for expedition gear such as camping equipment and sleeping mats. Built for adventure pilots who want more than a standard trike.',
  body:
    'Designed for family and friends flying and for pilots who want to turn a paramotor into a more robust, reliable aircraft. The Trike Disruptor adapts to the Disruptor paramotor with two key attachment points: at the tilting-arm pivot on top and on the rear axle — together they stiffen the entire pilot and passenger cabin. Harnesses are sold separately; add accessories in the configurator to complete your setup.',
}

export const DISRUPTOR_TRIKE_INCLUDED = [
  {
    icon: 'Gauge',
    title: 'Tundra Wheels',
    description:
      'Light yet robust wheels for beach takeoffs and uneven terrain.',
  },
  {
    icon: 'Shield',
    title: 'Disruptor Chassis',
    description:
      'Stainless steel chassis — lightweight without sacrificing strength, with everything needed to adapt to a paramotor.',
  },
  {
    icon: 'Package',
    title: 'Basic Adapters',
    description:
      'Essential laser-cut plates and supports to remove the Disruptor paramotor arms and mount Trike Disruptor components.',
  },
  {
    icon: 'Link',
    title: 'Main Straps',
    description:
      'Two straps rated for up to 4 tons each, plus backup straps for dual-layer security.',
  },
  {
    icon: 'Zap',
    title: 'Gravity Control System',
    description:
      'Switch in flight from tandem to single — ideal for drop-back passengers, and on the ground when you need unobstructed entry into the trike.',
  },
]

export const DISRUPTOR_TRIKE_FEATURES = [
  {
    icon: 'Shield',
    title: 'Dual Attachment Points',
    desc: 'Top pivot and rear axle mounts create a rigid pilot and passenger cabin.',
  },
  {
    icon: 'Users',
    title: 'Family & Friends Ready',
    desc: 'Transform your Disruptor paramotor into a robust aircraft for shared flights.',
  },
  {
    icon: 'Package',
    title: 'Expedition Ready',
    desc: 'Carry camping gear, sleeping mats, and excursion accessories with the Explorer Bag.',
  },
  {
    icon: 'Zap',
    title: 'Disruptor Integration',
    desc: 'Built exclusively for the Disruptor paramotor — not a generic add-on.',
  },
]

export const DISRUPTOR_TRIKE_ACCESSORIES = [
  {
    id: 'disruptor-pilot-seat',
    name: 'Disruptor Pilot Seat',
    price: 245.5,
    description:
      'Lightweight, compact seat with everything needed for comfortable flight — keeping the trike as light as possible without sacrificing safety or comfort.',
    image: '/images/parts/pilot-harness.png',
  },
  {
    id: 'disruptor-passenger-seat',
    name: 'Disruptor Passenger Seat',
    price: 245.5,
    description:
      'Weight-optimized passenger harness. With engines often 200 cc or less, this line keeps takeoff manageable when adding trike and accessories.',
    image: '/images/parts/passenger-harness.png',
  },
  {
    id: 'explorer-bag',
    name: 'Explorer Bag',
    price: 125,
    description:
      'Designed exclusively for the Disruptor paratrike — carry camping gear, sleeping mats, and excursion equipment.',
    image: '/images/parts/lateral-bag-explorer.png',
  },
  {
    id: 'rear-mirror',
    name: 'Rear Mirror',
    price: 25,
    description:
      'Essential for viewing wing position in the first quarter of lift during takeoff, when the wing is behind the trike lying flat.',
    image: '/images/parts/instrument-kit-vanguard.png',
  },
  {
    id: 'front-brake',
    name: 'Front Brake',
    price: 120,
    description:
      'Additional cable brake for extra stopping power — conventional mountain-bike-derived system.',
    image: '/images/parts/front-fork.png',
  },
  {
    id: 'protective-cover',
    name: 'Protective Cover',
    price: 105,
    description:
      'Trailer-friendly cover for the pilot/passenger cabin and engine. Does not cover the propeller ring — reduces drag on the road.',
    image: '/images/parts/cockpit-liner.png',
  },
]

export const DISRUPTOR_TRIKE_SPECS = {
  'Base Price': '$2,500 USD',
  'Harnesses': 'Sold separately',
  'Wheels': 'Tundra — all-terrain',
  'Chassis': 'Stainless steel',
  'Safety': 'Gravity Control System included',
}
