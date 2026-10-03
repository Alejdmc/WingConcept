/**
 * Accessory lists for trike configurators — order matches archivosnuevos/*.docx
 * Images live under /images/parts/ (gallery via configuratorImages.js).
 */

const RESERVE_CHUTE = {
  id: 'reserve-chute',
  name: 'Reserve Parachute — APCO Mayday UL28',
  price: 1528,
  description:
    'Certified for heavy trike flying and light enough for real adventures. APCO has manufactured over 40,000 life-saving devices since 1984. Mayday 28 UL handles loads up to 400 kg (340 kg EN tested).',
  image: '/images/parts/reserve-chute-1.jpg',
  infoUrl: 'https://aviatorppg.com/catalog/paragliders/reserves/apco-mayday-ul-reserve/',
}

const PARACHUTE_CONTAINER = {
  id: 'parachute-container',
  name: 'Parachute Container',
  price: 65,
  description:
    'Highly resistant to sunlight and abrasion. Mounts on the right or left side of the pilot harness for easy deployment.',
  image: '/images/parts/parachute-container-1.jpg',
}

/** Nomadic configurador — archivosnuevos/Nomadic TRIKE DESCRIPTION…docx */
export const NOMADIC_CONFIGURATOR_ACCESSORIES = [
  RESERVE_CHUTE,
  PARACHUTE_CONTAINER,
  {
    id: 'rock-guard',
    name: 'Nomadic Rock Guard',
    price: 85,
    description:
      '1/2-inch U-shaped stainless steel tube with laser-cut side plates and mesh — protects propeller tips from stones, sand, and branches during takeoff, taxiing, and landing.',
    image: '/images/parts/rock-guard-1.jpg',
  },
  {
    id: 'sun-roof-netting',
    name: 'Sunshade Net or Sunscreen',
    price: 43,
    description:
      'Protects the pilot from the sun during sideways descent and prevents lines from tangling with the helmet or trike equipment.',
    image: '/images/parts/sun-roof-netting-1.jpg',
  },
  {
    id: 'front-bar-protection',
    name: 'Padded Roll Bar Protector with Handles',
    price: 47,
    description:
      'Protects the passenger and provides comfortable handles; front bars are padded for a robust look.',
    image: '/images/parts/front-bar-protection.png',
  },
  {
    id: 'front-brake',
    name: 'Front Brake',
    price: 120,
    description: 'Additional cable brake providing extra braking power — conventional mountain-bike derived system.',
    image: '/images/parts/front-brake.png',
  },
  {
    id: 'rear-mirror',
    name: 'Rear Mirror',
    price: 25,
    description:
      'Essential for viewing wing position during the first quarter of lift on takeoff.',
    image: '/images/parts/rear-mirror.png',
  },
  {
    id: 'cockpit-liner',
    name: 'Nomadic Protective Cover',
    price: 105,
    description:
      'Covers essential parts like the passenger/pilot cabin and engine for trailering without creating drag. Does not cover the propeller ring.',
    image: '/images/parts/cockpit-liner.png',
  },
  {
    id: 'bottom-explorer-bag',
    name: 'Nomadic Explorer Bag',
    price: 125,
    description:
      'Designed for the Disruptor paratrike — carry camping gear, sleeping mats, and excursion accessories for adventure flying.',
    image: '/images/parts/bottom-explorer-bag.png',
  },
  {
    id: 'lateral-bag-explorer',
    name: 'Nomadic Two (2) Side Explorer Cases (L-R)',
    price: 95,
    description:
      'Aerodynamic side cases with extra straps for rods, tents, fuel, etc. without using internal space.',
    image: '/images/parts/lateral-bag-explorer.png',
  },
  {
    id: 'auxiliary-lights',
    name: 'Auxiliary Lights Kit',
    price: 187.1,
    description:
      'Two UP67 waterproof LED lights (white, yellow, strobe), red/green position indicators, luxury switch, wiring and relay — installed inside the structure. Highly recommended with the electrical installation kit.',
    image: '/images/parts/auxiliary-lights-1.jpg',
  },
  {
    id: 'instrument-kit',
    name: 'Nomadic Basic Instruments Kit',
    price: 340,
    description:
      'TTO digital RPM, spark plug temperature, coolant temperature gauges, and 4-port USB charger. Highly recommended with the engine electrical kit.',
    image: '/images/parts/instrument-kit-nomadic-1.jpg',
  },
  {
    id: 'electrical-kit',
    name: 'Complete Electrical Installation Kit (Vittorazi Zeus & Simonini Victor 1 Super)',
    price: 218,
    description:
      'Regulator/rectifier, relays, starter solenoid, magneto test buttons, master switch, wiring harness and connectors for the selected engine.',
    image: '/images/parts/electrical-kit-1.jpg',
  },
  {
    id: 'carabiners',
    name: 'Two (2) Carabiners',
    price: 90,
    description: 'High-capacity steel carabiners (2.4 kN each — over two tons) for maximum safety.',
    image: '/images/parts/carabiners-1.jpg',
  },
  {
    id: 'propeller-guard',
    name: 'Nomadic External Propeller Guard',
    price: 295,
    description:
      'Prevents wing or lines from entering the propeller. Ideal for schools and pilots learning wing control.',
    image: '/images/parts/pilot-dynamic-cage.png',
  },
  {
    id: 'phone-holder',
    name: 'Phone Holder',
    price: 35,
    description:
      'Compression grip holds any mobile phone firmly — perfect for passenger harness use with tether loop for security.',
    image: '/images/parts/phone-holder-1.png',
  },
  {
    id: 'cruise-control',
    name: 'Cruise Control',
    price: 25,
    description: 'Maintains desired RPM for stable, smooth long-distance flight.',
    image: '/images/parts/cruise-control.png',
  },
]

/** Vanguard configurador — archivosnuevos/VANGUARD TRIKE DESCRIPTION…docx */
export const VANGUARD_CONFIGURATOR_ACCESSORIES = [
  RESERVE_CHUTE,
  PARACHUTE_CONTAINER,
  {
    id: 'sun-roof-netting',
    name: 'Vanguard Sunshade Net or Sunscreen',
    price: 43,
    description:
      'Protects the pilot from the sun during sideways descent and prevents lines from tangling with the helmet or trike equipment.',
    image: '/images/parts/sun-roof-netting-1.jpg',
  },
  {
    id: 'front-bar-protection',
    name: 'Padded Roll Bar Protector with Handles',
    price: 47,
    description:
      'Protects the passenger and provides comfortable handles; front bars are padded for a robust look.',
    image: '/images/parts/front-bar-protection.png',
  },
  {
    id: 'front-brake',
    name: 'Front Brake',
    price: 120,
    description: 'Additional cable brake providing extra braking power — conventional mountain-bike derived system.',
    image: '/images/parts/front-brake.png',
  },
  {
    id: 'rear-mirror',
    name: 'Rear Mirror',
    price: 25,
    description:
      'Essential for viewing wing position during the first quarter of lift on takeoff.',
    image: '/images/parts/rear-mirror.png',
  },
  {
    id: 'cockpit-liner',
    name: 'Vanguard Protector Cover',
    price: 105,
    description:
      'Covers essential parts for trailering without creating drag. Does not cover the propeller ring.',
    image: '/images/parts/cockpit-liner.png',
  },
  {
    id: 'lateral-bag',
    name: 'Vanguard Two (2) Side Explorer Cases (L-R)',
    price: 95,
    description:
      'Aerodynamic side cases with extra straps for rods, tents, fuel, etc. without using internal space.',
    image: '/images/parts/lateral-bag-explorer.png',
  },
  {
    id: 'cruise-control',
    name: 'Cruise Control',
    price: 25,
    description: 'Maintains desired RPM for stable, smooth long-distance flight.',
    image: '/images/parts/cruise-control.png',
  },
  {
    id: 'fuel-gauge-vanguard',
    name: 'Vanguard Fuel Gauge',
    price: 114.5,
    description:
      'Analog gauge for the L-shaped 17-gal tank — when empty, approximately 10 liters remain on reserve.',
    image: '/images/parts/fuel-gauge-vanguard-1.jpg',
  },
  {
    id: 'auxiliary-lights',
    name: 'Auxiliary Lights Kit',
    price: 187.1,
    description:
      'Two UP67 waterproof LED lights, position indicators, luxury switch, wiring and relay. Highly recommended with the electrical installation kit.',
    image: '/images/parts/auxiliary-lights-1.jpg',
  },
  {
    id: 'instrument-kit',
    name: 'Basic Instruments Kit',
    price: 340,
    description:
      'TTO digital RPM, spark plug temperature, coolant temperature gauges, and 4-port USB charger.',
    image: '/images/parts/instrument-kit-vanguard.png',
  },
  {
    id: 'electrical-kit',
    name: 'Complete Electrical Installation Kit',
    price: 218.2,
    description:
      'Regulator/rectifier, relays, starter solenoid, magneto test buttons, master switch, and full wiring harness for the selected engine.',
    image: '/images/parts/electrical-kit-1.jpg',
  },
  {
    id: 'carabiners',
    name: 'Two (2) Carabiners',
    price: 90,
    description: 'High-capacity steel carabiners (2.4 kN each) for maximum safety.',
    image: '/images/parts/carabiners-1.jpg',
  },
  {
    id: 'propeller-guard',
    name: 'External Propeller Guard',
    price: 295,
    description:
      'Prevents wing or lines from entering the propeller. Ideal for schools and beginners.',
    image: '/images/parts/pilot-dynamic-cage.png',
  },
  {
    id: 'phone-holder',
    name: 'Phone Holder',
    price: 35,
    description:
      'Compression grip holds any mobile phone firmly — perfect for passenger harness use.',
    image: '/images/parts/phone-holder-1.png',
  },
  {
    id: 'line-protector',
    name: 'Line Protector',
    price: 35,
    description:
      'Replacement line protection accessory — maintains constant tension on the protective strap to prevent lines from entering the propeller.',
    image: '/images/parts/front-bar-protection.png',
  },
]
