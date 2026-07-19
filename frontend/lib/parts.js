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
  { id: 'front-axle', name: 'Front Axle', price: 75, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/parts/front-axle.png', description: 'Premium aluminum wheel axle engineered for quick and easy assembly, specifically designed to fit a 20mm hub setup.' },
  { id: 'front-fork', name: 'Front Fork', price: 280, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/parts/front-fork.png', description: 'Reinforced front assembly weighted for ideal stability. Features an easily detachable design for straightforward assembly and oval tubing for superior mechanical resistance, with the option to integrate a disc brake system.' },
  { id: 'front-bar-protection', name: 'Protection with Front Bar Handle', price: 80, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/parts/front-bar-protection.png', description: 'Structural protective cabin enclosure frame equipped with an ergonomic front handle bar for enhanced passenger and pilot security.' },
  { id: 'parachute-container', name: 'Parachute Container', price: 55, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/parts/parachute-container.png', description: "Versatile emergency parachute container pouch, designed to securely bolt onto either the left or right side of the pilot's seat frame for instant deployment." },
  { id: 'pilot-harness', name: 'Pilot Harness', price: 190, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/parts/pilot-harness.png', description: 'High-comfort pilot harness seat made with high-density 45 foam and a rugged high-density polypropylene base. Features integrated safety belts, functional side pockets, and dedicated buckles for a parachute container. The hanging swing design acts as a passive safety system for the pilot.' },
  { id: 'passenger-harness', name: 'Passenger Harness', price: 220, compatibleWith: ['vanguard', 'nomadic'], productoId: null, image: '/images/parts/passenger-harness.png', description: "Specialized passenger seat using supportive 45 Gr/Dm³ density foam. The structural backrest doubles as an instrument holder panel with seamless access to onboard electrical connections, and includes a custom-tailored pocket for the pilot's hydration pack." },
  { id: 'pilot-dynamic-cage', name: 'Pilot Dynamic Cage', price: 300, compatibleWith: ['vanguard'], productoId: null, image: '/images/parts/pilot-dynamic-cage.png', description: 'Aerodynamic prop cage designed for cross-country exploration pilots aiming to maximize fuel range and structural efficiency.' },
  { id: 'pilot-hunter-cage', name: 'Pilot Hunter Cage', price: 300, compatibleWith: ['vanguard'], productoId: null, image: '/images/parts/pilot-hunter-cage.png', description: 'Heavy-duty camera and utility cage built for professional documentary filming or specialized gear attachment, offering maximum tool range of motion.' },
  { id: 'back-axle', name: 'Back Axle No Suspension', price: 95, compatibleWith: ['nomadic'], productoId: null, image: '/images/parts/back-axle.png', description: 'Rigid rear axle assembly without an integrated suspension system, providing a solid chassis baseline.' },
  { id: 'rock-guard', name: 'Nomadic Rock Guard', price: 95, compatibleWith: ['nomadic'], productoId: null, image: '/images/parts/rock-guard.png', description: 'Heavy-duty protective rock guard netting system designed to shield the frame and components from debris.' },
]
