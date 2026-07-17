/**
 * Catálogo de partes/repuestos vendidos por separado en /parts.
 * Antes vivían dentro del paso "Partes" de cada configurador (Vanguard/Nomadic).
 *
 * image: coloca la foto real en frontend/public/images/parts/{id}.jpg — el nombre
 * de archivo debe coincidir con el id de la parte.
 *
 * productoId: aún no existen como Producto real en el backend. El botón
 * "Add to Cart" ya llama al mismo flujo que el resto del catálogo; cuando
 * exista el producto real, solo hace falta poner su UUID aquí.
 */
export const PARTS = [
  { id: 'front-axle', name: 'Front Axle', price: 75, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/parts/front-axle.jpg' },
  { id: 'front-fork', name: 'Front Fork', price: 280, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/parts/front-fork.jpg' },
  { id: 'front-bar-protection', name: 'Protection with Front Bar Handle', price: 80, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/parts/front-bar-protection.jpg' },
  { id: 'parachute-container', name: 'Parachute Container', price: 55, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/parts/parachute-container.jpg' },
  { id: 'pilot-harness', name: 'Pilot Harness', price: 190, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/parts/pilot-harness.jpg' },
  { id: 'passenger-harness', name: 'Passenger Harness', price: 220, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/parts/passenger-harness.jpg' },
  { id: 'pilot-dynamic-cage', name: 'Pilot Dynamic Cage', price: 300, compatibleWith: ['vanguard'], productoId: null, image: '/images/parts/pilot-dynamic-cage.jpg' },
  { id: 'pilot-hunter-cage', name: 'Pilot Hunter Cage', price: 300, compatibleWith: ['vanguard'], productoId: null, image: '/images/parts/pilot-hunter-cage.jpg' },
  { id: 'back-axle', name: 'Back Axle No Suspension', price: 95, compatibleWith: ['nomadic'], productoId: null, image: '/images/parts/back-axle.jpg' },
  { id: 'rock-guard', name: 'Nomadic Rock Guard', price: 95, compatibleWith: ['nomadic'], productoId: null, image: '/images/parts/rock-guard.jpg' },
]
