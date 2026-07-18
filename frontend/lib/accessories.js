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
  { id: 'cruise-control', name: 'Cruise Control', price: 20, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/accessories/cruise-control.jpg', description: 'Flight cruise control throttle module engineered for twin-cylinder aviation engines, strategically positioned for instant and safe manual deactivation.' },
  { id: 'camel-back', name: 'Camel Back for Pilot Hydration', price: 25, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/accessories/camel-back.jpg', description: "Crucial hydration system for pilots undertaking long cross-country flights. The bladder unit is engineered to fit into the dedicated instrument pocket on the backrest of the passenger seat." },
  { id: 'sun-roof-netting', name: 'Sun-Roof Netting', price: 30, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/parts/sun-roof-netting.png', description: 'Overhead sunshade mesh netting that blocks harmful UV rays while remaining fully aerodynamic to eliminate flight drag.' },
  { id: 'cockpit-liner', name: 'Passenger & Pilot Cockpit Protective Liner', price: 105, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/parts/cockpit-liner.png', description: 'Specialized protective storage cover that wraps the pilot and passenger cabin. Intended for open trailer transport, it shields sensitive flight equipment against wind and road grime without adding aerodynamic drag while towing.' },
  { id: 'lateral-bag', name: 'Lateral Bag for Vanguard', price: 90, compatibleWith: ['vanguard'], productoId: null, image: '/images/accessories/lateral-bag.jpg', description: 'Rugged side pannier bag tailored for long-distance trike touring, perfect for transporting camping equipment and beverages.' },
  { id: 'instrument-kit-vanguard', name: 'Basic Instrument Kit (Vanguard)', price: 440, compatibleWith: ['vanguard'], productoId: null, image: '/images/parts/instrument-kit-vanguard.png', description: 'Flight management dashboard kit with a USB charging port and 3 precision TTO engine sensors monitoring Cylinder Head Temperature (CHT), RPM, and radiator water temperature, plus an exclusive integrated Fuel Gauge instrument. Compatible with all engine types (Rotax, Vittorazi, Polini, Sky, etc.).' },
  { id: 'lateral-bag-explorer', name: 'Lateral Bag Explorer', price: 85, compatibleWith: ['nomadic'], productoId: null, image: '/images/parts/lateral-bag-explorer.png', description: 'Side-mounted storage bag built from durable materials, optimized for easy access to gear during exploration flights.' },
  { id: 'bottom-explorer-bag', name: 'Bottom Explorer Bag', price: 124.80, compatibleWith: ['nomadic'], productoId: null, image: '/images/parts/bottom-explorer-bag.png', description: 'High-capacity under-carriage storage bag designed exclusively for the Nomadic trike to securely haul heavy travel gear.' },
  { id: 'instrument-kit-nomadic', name: 'Basic Instrument Kit (Nomadic)', price: 350, compatibleWith: ['nomadic'], productoId: null, image: '/images/parts/instrument-kit-nomadic.png', description: 'Flight management dashboard kit with a USB charging port and 3 precision TTO engine sensors monitoring Cylinder Head Temperature (CHT), RPM, and radiator water temperature. Compatible with all engine types (Rotax, Vittorazi, Polini, Sky, etc.).' },
]
