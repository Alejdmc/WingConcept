/**
 * Catálogo de partes/repuestos vendidos por separado en /parts.
 * Antes vivían dentro del paso "Partes" de cada configurador (Vanguard/Nomadic).
 *
 * image: la foto real vive en frontend/public/images/parts/{id}.png — el nombre
 * de archivo debe coincidir con el id de la parte.
 *
 * productoId: aún no existen como Producto real en el backend. El botón
 * "Add to Cart" ya llama al mismo flujo que el resto del catálogo; cuando
 * exista el producto real, solo hace falta poner su UUID aquí.
 */
export const PARTS = [
  { id: 'front-axle', name: 'Front Axle', price: 75, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/parts/front-axle.png', description: 'Easy-to-assemble aluminum front axle engineered specifically for 20mm bearings.' },
  { id: 'front-fork', name: 'Front Fork', price: 280, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/parts/front-fork.png', description: 'Reinforced front fork assembly weighted for ideal stability. Features a detachable design for simple assembly and utilizes oval tubing for superior mechanical strength. It includes an integrated option to mount a disc brake.' },
  { id: 'front-bar-protection', name: 'Protection with Front Bar Handle', price: 47, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/parts/front-bar-protection.png', description: 'Structural front protection bar that serves a dual purpose as a convenient handgrip or handle. Padded for passenger comfort.' },
  { id: 'parachute-container', name: 'Parachute Container', price: 55, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/parts/parachute-container.png', description: "Emergency parachute container designed for quick and secure mounting. It can be easily installed on either the right or left side of the pilot's harness." },
  { id: 'pilot-harness', name: 'Pilot Harness', price: 190, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/parts/pilot-harness.png', description: 'A hanging-style seat harness that provides passive safety protection. Features an extra-comfortable seat made with 45-density foam and a high-density polypropylene plastic base. Equipped with safety belts, side pockets, and dedicated buckles to attach a parachute container.' },
  { id: 'passenger-harness', name: 'Passenger Harness', price: 220, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/parts/passenger-harness.png', description: "A unique passenger seat featuring an extra-comfortable 45 Gr/Dm³ density foam cushion. The backrest supports an integrated instrument holder with easy access to electrical connections. It also includes a specialized pocket to carry the pilot's hydration Camelback." },
  { id: 'pilot-dynamic-cage', name: 'Pilot Dynamic Cage', price: 300, compatibleWith: ['vanguard'], productoId: null, image: '/images/parts/pilot-dynamic-cage.png', description: 'Specialized aerodynamic engine cage engineered for distance-focused exploration pilots seeking maximum fuel efficiency and minimal drag.' },
  { id: 'pilot-hunter-cage', name: 'Pilot Hunter Cage', price: 300, compatibleWith: ['vanguard'], productoId: null, image: '/images/parts/pilot-hunter-cage.png', description: 'Heavy-duty utility cage optimized for tactical or media operations. Provides maximum range of clearance to mount professional documentary camera setups or equipment with total freedom of movement.' },
  { id: 'back-axle', name: 'Back Axle No Suspension', price: 95, compatibleWith: ['nomadic'], productoId: null, image: '/images/parts/back-axle.png', description: 'Rear axle component specifically designed for the Nomadic model without an integrated suspension system.' },
  { id: 'rock-guard', name: 'Nomadic Rock Guard', price: 85, compatibleWith: ['nomadic'], productoId: null, image: '/images/parts/rock-guard.png', description: 'Heavy-duty guard designed to protect the lower trike body from kicking up rocks, gravel, and field debris.' },
]
