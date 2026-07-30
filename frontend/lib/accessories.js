/**
 * Standalone accessories catalog for /parts, mirroring the accessories offered
 * inside each configurator's "Accessories" step (Vanguard/Nomadic).
 *
 * image: las fotos reales viven en frontend/public/images/parts/{id}.png junto
 * a las de PARTS (se subieron todas mezcladas en esa carpeta).
 *
 * productoId: not yet real Producto records in the backend. The "Add to Cart"
 * button already calls the same flow as the rest of the catalog; once the
 * real product exists, just set its UUID here.
 */
export const ACCESSORIES = [
  { id: 'cruise-control', name: 'Cruise Control', price: 20, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/accessories/cruise-control.jpg', description: 'Mechanical throttle lock located in a strategic ergonomic position, allowing the pilot to quickly and safely deactivate it instantly.' },
  { id: 'camel-back', name: 'Camel Back for Pilot Hydration', price: 25, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/accessories/camel-back.jpg', description: 'An essential hydration bladder setup for long-endurance flights. Tucks neatly into the instrument holder pocket located on the back of the passenger seat.' },
  { id: 'sun-roof-netting', name: 'Sun-Roof Netting', price: 30, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/parts/sun-roof-netting.png', description: 'A lightweight, mesh sun canopy that filters overhead sunlight effectively while generating zero aerodynamic drag during flight.' },
  { id: 'cockpit-liner', name: 'Passenger & Pilot Cockpit Protective Liner', price: 105, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/parts/cockpit-liner.png', description: 'Protective travel cover tailored for the pilot and passenger cockpit area. Designed specifically for trailering to shield sensitive components from dirt without creating aerodynamic drag on open trailers.' },
  { id: 'lateral-bag', name: 'Lateral Bag for Vanguard', price: 90, compatibleWith: ['vanguard'], productoId: null, image: '/images/accessories/lateral-bag.jpg', description: 'Side storage bag tailored for the Vanguard frame. Perfect for carrying beverages, camping gear, and supplies on long trips.' },
  { id: 'instrument-kit-vanguard', name: 'Basic Instrument Kit (Vanguard)', price: 440, compatibleWith: ['vanguard'], productoId: null, image: '/images/parts/instrument-kit-vanguard.png', description: 'Features a built-in USB charger, an exclusive fuel gauge for the Vanguard model, and 3 TTO brand digital sensors (CHT, RPM, and radiator water temperature).' },
  { id: 'lateral-bag-explorer', name: 'Lateral Bag Explorer', price: 85, compatibleWith: ['nomadic'], productoId: null, image: '/images/parts/lateral-bag-explorer.png', description: 'Side-mounted storage bag built to hold additional gear during cross-country exploration flights.' },
  { id: 'bottom-explorer-bag', name: 'Bottom Explorer Bag', price: 124.80, compatibleWith: ['nomadic'], productoId: null, image: '/images/parts/bottom-explorer-bag.png', description: 'A premium, bottom-mounted adventure bag designed to haul extensive luggage, tools, and essentials for long expeditions.' },
  { id: 'instrument-kit-nomadic', name: 'Basic Instrument Kit (Nomadic)', price: 350, compatibleWith: ['nomadic'], productoId: null, image: '/images/parts/instrument-kit-nomadic.png', description: 'Features a built-in USB charger and 3 TTO brand digital sensors tracking Cylinder Head Temperature (CHT), RPM, and radiator water temperature.' },
  { id: 'ballistic-parachute', name: 'Ballistic Parachute', price: null, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/accessories/ballistic-parachute.jpg', description: 'Designed with a dedicated structural compartment to house a ballistic parachute. Its strategic placement ensures it does not alter the center of gravity or interfere with the trike framework during deployment.' },
]
