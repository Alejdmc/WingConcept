/** Paramotor Disruptor — archivos/PARAMOTOR' web side.pdf (summaries in English) */

export const DISRUPTOR_PARAMOTOR_BASE_PRICE = 2800

export const DISRUPTOR_PARAMOTOR_GALLERY = [1, 2, 3, 4].map((n) => ({
  src: `/images/disruptor/paramotor-${n}.jpg`,
  alt: `Disruptor Paramotor ${n}`,
}))

export const DISRUPTOR_PARAMOTOR_HERO = DISRUPTOR_PARAMOTOR_GALLERY[0].src

export const DISRUPTOR_PARAMOTOR_SUMMARY = {
  model: 'Disruptor',
  subtitle: 'Standard — No Engine, No Propeller & No Accessories',
  tagline: 'Break the status quo. Evolve with every flight.',
  description:
    'Built for pilots who evolve over time — whether you are starting out, exploring, flying acro, going tandem, or adapting to a trike. The Disruptor grows with you and helps you exceed your expectations at every stage.',
  body:
    'A very well thought-out, lightweight and aerodynamic design. The only paramotor that can correct center of gravity in flight — adjust each arm pivot independently for height and lateral offset. Patented Spar Connectors reinforce the zones that need it most; the integrated aerodynamic fuel tank is part of the structure (AcRA), absorbing impacts while maintaining rigidity. Patented tilting arms with our Gravity Control System reduce drag and displacement, setting the Disruptor apart from anything else on the market.',
}

export const DISRUPTOR_PARAMOTOR_INCLUDED = [
  {
    icon: 'Shield',
    title: 'Spar Connectors',
    description:
      'Reinforced tube connectors between the propeller ring and chassis, placed where strength matters most. Each connector includes a support foot for extra rigidity during wing inflation, lateral falls, turtle position, and trike use. Reinforced nylon terminals allow quick assembly without snagging paraglider lines.',
  },
  {
    icon: 'Fuel',
    title: 'Integrated Fuel Tank',
    description:
      'The tank is part of the structure — it absorbs impacts, improves flexibility, and helps resist hard landings. Removable for refueling without moving the whole paramotor. Aerodynamic shape reduces drag; forward fuel weight improves CG and keeps carabiners away from the pilot’s arms.',
  },
  {
    icon: 'Zap',
    title: 'Gravity Control System',
    description:
      'Patented tilting arms — the only paramotor that lets you adjust CG and frame inclination in flight. Independent height and lateral pivot settings control torque effectively. The second arm segment can face inward or outward. No stainless shackles that can injure the pilot or catch lines at launch.',
  },
  {
    icon: 'Users',
    title: 'Tilting Arms',
    description:
      'Arm pivot sits rearward, near the engine, for better weight distribution. Paraglider risers sit farther from the pilot’s arms — more comfort and less fatigue on long flights.',
  },
]

export const DISRUPTOR_PARAMOTOR_FEATURES = [
  {
    icon: 'Zap',
    title: 'In-Flight CG Correction',
    desc: 'Adjust center of gravity and frame angle while flying — unique in the paramotor world.',
  },
  {
    icon: 'Shield',
    title: 'Active Safety',
    desc: 'No steel omegas on the arms — cleaner line clearance and safer launches.',
  },
  {
    icon: 'Gauge',
    title: 'Built for Hard Use',
    desc: 'Spar connectors and structure engineered for tough inflation, trike mounting, and hard landings.',
  },
  {
    icon: 'Package',
    title: 'One Platform, Every Stage',
    desc: 'Foot launch, acro, tandem, or trike — the Disruptor adapts as your flying evolves.',
  },
]

export const DISRUPTOR_PARAMOTOR_SPECS = {
  'Base Price': '$2,800 USD',
  'Category': 'Foot launch & trike adapter',
  'CG System': 'Gravity Control System (patented)',
  'Fuel Tank': 'Integrated, removable, aerodynamic',
  'Arms': 'Patented tilting — no steel shackles',
}

/** Engine lineup highlight (landing page). */
export const DISRUPTOR_PARAMOTOR_ENGINES = [
  {
    name: 'Polini Thor 303 EVO',
    power: '303 cc',
    price: '$4,994',
    description: 'Outstanding performance and reliability — the top-tier Polini option for serious pilots.',
  },
  {
    name: 'Polini Thor 202 Racing',
    power: '202 cc',
    price: '$2,882',
    description: 'Built for slalom competition and sport flying with responsive throttle response.',
  },
  {
    name: 'Polini Thor 130 EVO',
    power: '130 cc',
    price: '$2,580',
    description: 'Advanced dual-carb engine balancing weight savings with dependable power.',
  },
  {
    name: 'Vittorazi Cosmos 300',
    power: '36 HP',
    price: 'TBD',
    description: 'Ideal for paratrikes and tandem flight — smooth torque and proven field support.',
  },
  {
    name: 'Vittorazi Moster 185',
    power: '185 cc',
    price: 'TBD',
    description: 'Versatile mid-displacement engine for sport, travel, and trike adaptation.',
  },
  {
    name: 'SKY Zeus 300',
    power: '44 HP',
    price: 'TBD',
    description: '300 cc boxer engine delivering up to 148 kg of thrust for demanding missions.',
  },
]
