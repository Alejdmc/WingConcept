/**
 * Standalone accessories catalog for /parts, mirroring the accessories offered
 * inside each configurator's "Accessories" step (Vanguard/Nomadic).
 *
 * image: place the real photo at frontend/public/images/accessories/{id}.jpg —
 * the filename must match the accessory's id.
 *
 * productoId: not yet real Producto records in the backend. The "Add to Cart"
 * button already calls the same flow as the rest of the catalog; once the
 * real product exists, just set its UUID here.
 */
export const ACCESSORIES = [
  { id: 'cruise-control', name: 'Cruise Control', price: 20, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/accessories/cruise-control.jpg' },
  { id: 'camel-back', name: 'Camel Back for Pilot Hydration', price: 25, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/accessories/camel-back.jpg' },
  { id: 'sun-roof-netting', name: 'Sun-Roof Netting', price: 30, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/accessories/sun-roof-netting.jpg' },
  { id: 'cockpit-liner', name: 'Passenger & Pilot Cockpit Protective Liner', price: 105, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/accessories/cockpit-liner.jpg' },
  { id: 'lateral-bag', name: 'Lateral Bag for Vanguard', price: 90, compatibleWith: ['vanguard'], productoId: null, image: '/images/accessories/lateral-bag.jpg' },
  { id: 'instrument-kit-vanguard', name: 'Basic Instrument Kit (Vanguard)', price: 440, compatibleWith: ['vanguard'], productoId: null, image: '/images/accessories/instrument-kit-vanguard.jpg' },
  { id: 'lateral-bag-explorer', name: 'Lateral Bag Explorer', price: 85, compatibleWith: ['nomadic'], productoId: null, image: '/images/accessories/lateral-bag-explorer.jpg' },
  { id: 'bottom-explorer-bag', name: 'Bottom Explorer Bag', price: 124.80, compatibleWith: ['nomadic'], productoId: null, image: '/images/accessories/bottom-explorer-bag.jpg' },
  { id: 'instrument-kit-nomadic', name: 'Basic Instrument Kit (Nomadic)', price: 350, compatibleWith: ['nomadic'], productoId: null, image: '/images/accessories/instrument-kit-nomadic.jpg' },
]
