"""
Catálogo Disruptor — Paramotor + Trike (archivos/*.pdf).
Tuplas: (grupo, slug, nombre, descripcion, precio, imagen, extra)
"""

DISRUPTOR_PARAMOTOR_BASE = 2800.0
DISRUPTOR_TRIKE_BASE = 2500.0

# ── Paramotor — colores ───────────────────────────────────────────────────────
PARAMOTOR_COLORS = [
    ("color", "white-red-candy", "White & Red Candy", None, 0, None,
     {"hex": "#e74c3c", "displayName": "White & Red Candy", "accent": "#ffffff"}),
    ("color", "white-purple-candy", "White & Purple Candy", None, 0, None,
     {"hex": "#9b59b6", "displayName": "White & Purple Candy", "accent": "#ffffff"}),
    ("color", "white-blue-candy", "White & Blue Candy", None, 0, None,
     {"hex": "#3498db", "displayName": "White & Blue Candy", "accent": "#ffffff"}),
    ("color", "customized", "Customized", "Custom paint finish.", 100, None,
     {"hex": "#cccccc", "displayName": "Customized"}),
]

# ── Paramotor — flying style (finish) ─────────────────────────────────────────
PARAMOTOR_FLYING_STYLES = [
    ("finish", "paramotor-only", "Paramotor Only", "Base Disruptor paramotor chassis.", 0, None, {}),
    ("finish", "add-trike-disruptor", "Add Trike Disruptor",
     "Adapt your paramotor to the Disruptor trike platform.", 1950, None, {}),
    ("finish", "disruptor-harness", "Disruptor Harness",
     "Ultra-light harness (~980 g) with aerospace aluminum seat.", 185.5, None, {}),
    ("finish", "power-seat-comfort", "Power Seat Comfort by Dudek",
     "High comfort without excess weight.", 733, None, {"url": "https://dudek.eu/en/produkt/powerseat-comfort-dp/"}),
    ("finish", "power-seat-light", "Power Seat Light by Dudek",
     "Very light PPG harness (~2.33 kg).", 845, None, {"url": "https://dudek.eu/en/produkt/powerseat-light/"}),
]

# ── Paramotor — engines ───────────────────────────────────────────────────────
PARAMOTOR_ENGINES = [
    ("engine", "no-engine", "No Engine", "Chassis only — add an engine later.", 0, None, {}),
    ("engine", "vittorazi-atom-80", "Vittorazi Atom 80", "Reduced weight, uncompromising efficiency.", 0,
     "/images/engines/vittorazi-300-my25.jpg", {"price_tbd": True, "power": "80 HP"}),
    ("engine", "vittorazi-moster-185", "Vittorazi Moster 185 Plus",
     "Versatility, sportiness, and performance.", 0, "/images/engines/vittorazi-300-my25.jpg",
     {"price_tbd": True, "power": "185 cc"}),
    ("engine", "vittorazi-moster-185-efi", "Vittorazi Moster 185 EFI",
     "EFI technology with reduced fuel consumption.", 0, "/images/engines/vittorazi-300-my25.jpg",
     {"price_tbd": True}),
    ("engine", "vittorazi-moster-185-factory-r", "Vittorazi Moster 185 Factory-R",
     "Racing performance and exclusive design.", 0, "/images/engines/vittorazi-300-my25.jpg",
     {"price_tbd": True}),
    ("engine", "vittorazi-cosmos-300", "Vittorazi Cosmos 300",
     "Ideal for paratrikes and tandem flight.", 0, "/images/engines/vittorazi-300-my25.jpg",
     {"price_tbd": True, "power": "36 HP"}),
    ("engine", "polini-130-evo", "Polini Thor 130 EVO", "Advanced dual-carb engine.", 2580,
     "/images/engines/polini-260.jpg", {"power": "130 cc"}),
    ("engine", "polini-202-racing", "Polini Thor 202 Racing", "Built for slalom competition.", 2882,
     "/images/engines/polini-260.jpg", {"power": "202 cc"}),
    ("engine", "polini-303", "Polini Thor 303 EVO", "Outstanding performance and reliability.", 4994,
     "/images/engines/polini-303.jpg", {"power": "303 cc"}),
    ("engine", "sky-150", "SKY 150", "Liquid-cooled 150 cc.", 0, "/images/engines/polini-260.jpg",
     {"price_tbd": True, "power": "28 HP"}),
    ("engine", "sky-zeus-300", "SKY Engine Zeus 300", "300 cc boxer — up to 148 kg thrust.", 0,
     "/images/engines/polini-303.jpg", {"price_tbd": True, "power": "44 HP"}),
]

PARAMOTOR_HAND_THROTTLES = [
    ("hand_throttle", "no-throttle", "No Hand Throttle", "Use factory throttle.", 0, None, {}),
    ("hand_throttle", "vittorazi-v-throttle", "V-Throttle by Vittorazi", "Ergonomic ambidextrous joystick.", 180,
     None, {}),
    ("hand_throttle", "polini-hand-throttle", "Polini Hand Throttle", "Lightweight reinforced thermoplastic.", 186.7,
     None, {}),
    ("hand_throttle", "off-grid-aviator", "Off-Grid Aviator Throttle", "Pull-start setup, left or right hand.", 249,
     None, {}),
]

PARAMOTOR_PROPELLERS = [
    ("propeller", "no-propeller", "No Propeller", "Add a propeller later.", 0, None, {}),
    ("propeller", "bipala", "Two-Blade Propeller", "Mid-range 25 kW H30F variant.", 350, None, {}),
    ("propeller", "tripala", "Three-Blade Propeller", "Mid-range 25 kW H30F variant.", 450, None, {}),
]

PARAMOTOR_ACCESSORIES = [
    ("accessory", "globe-160-parachute", "Reserve Parachute Globe 160",
     "Emergency parachute for PPG flyers.", 110, "/images/parts/parachute-container.png", {}),
    ("accessory", "front-container-cockpit", "Front Container with Cockpit by Dudek",
     "Instrument panel and rescue container.", 179, "/images/parts/instrument-kit-vanguard.png", {}),
    ("accessory", "paramotor-bag-pack", "Paramotor Bag Pack",
     "Wing Concept case for disassembled paramotor.", 145, "/images/parts/cockpit-liner.png", {}),
    ("accessory", "paramotor-lights-kit", "Paramotor Lights Kit",
     "Visibility for explorers and night landings.", 135, "/images/parts/instrument-kit-vanguard.png", {}),
    ("accessory", "disruptor-pilot-seat", "Disruptor Pilot Seat",
     "Lightweight compact pilot seat.", 245.5, "/images/parts/pilot-harness.png", {}),
    ("accessory", "disruptor-passenger-seat", "Disruptor Passenger Seat",
     "Weight-optimized passenger harness.", 245.5, "/images/parts/passenger-harness.png", {}),
    ("accessory", "explorer-bag", "Explorer Bag",
     "Excursion gear for Disruptor paratrike.", 125, "/images/parts/lateral-bag-explorer.png", {}),
    ("accessory", "rear-mirror", "Rear Mirror", "View wing position during takeoff.", 25,
     "/images/parts/instrument-kit-vanguard.png", {}),
    ("accessory", "front-brake", "Front Brake", "Extra cable braking power.", 120, "/images/parts/front-fork.png", {}),
    ("accessory", "protective-cover", "Protective Cover", "Covers cockpit and engine for trailering.", 105,
     "/images/parts/cockpit-liner.png", {}),
]

# ── Trike Disruptor ───────────────────────────────────────────────────────────
TRIKE_COLORS = [
    ("color", "white", "White", None, 0, None, {"hex": "#ffffff", "displayName": "White"}),
    ("color", "red-candy", "Red Candy", None, 0, None, {"hex": "#e74c3c", "displayName": "Red Candy"}),
    ("color", "blue-candy", "Blue Candy", None, 0, None, {"hex": "#3498db", "displayName": "Blue Candy"}),
    ("color", "purple-candy", "Purple Candy", None, 0, None, {"hex": "#9b59b6", "displayName": "Purple Candy"}),
]

TRIKE_ACCESSORIES = [
    ("accessory", "disruptor-pilot-seat", "Disruptor Pilot Seat",
     "A lightweight, very compact seat with everything necessary for comfortable flight — keeping the trike as light as possible without sacrificing safety and comfort.",
     245.5, "/images/parts/pilot-harness.png", {}),
    ("accessory", "disruptor-passenger-seat", "Disruptor Passenger Seat",
     "Harnesses designed with special attention to weight. With engines often 200 cc or less, this line optimizes weight so takeoff stays manageable with trike and accessories.",
     245.5, "/images/parts/passenger-harness.png", {}),
    ("accessory", "explorer-bag", "Explorer Bag",
     "Designed exclusively for the Disruptor paratrike — carry camping gear, sleeping mats, and excursion equipment.",
     125, "/images/parts/lateral-bag-explorer.png", {}),
    ("accessory", "rear-mirror", "Rear Mirror",
     "Essential for viewing the wing position in its first quarter of lift during takeoff, when the wing is behind the trike lying flat.",
     25, "/images/parts/instrument-kit-vanguard.png", {}),
    ("accessory", "front-brake", "Front Brake",
     "An additional cable brake provides extra braking power — a conventional system derived from mountain bikes.",
     120, "/images/parts/front-fork.png", {}),
    ("accessory", "protective-cover", "Protective Cover",
     "Protect your trike on the trailer without creating drag. Covers the passenger/pilot cabin and engine — not the propeller ring.",
     105, "/images/parts/cockpit-liner.png", {}),
]

DISRUPTOR_PARAMOTOR_OPCIONES = (
    PARAMOTOR_COLORS + PARAMOTOR_FLYING_STYLES + PARAMOTOR_ENGINES
    + PARAMOTOR_HAND_THROTTLES + PARAMOTOR_PROPELLERS + PARAMOTOR_ACCESSORIES
)

DISRUPTOR_TRIKE_OPCIONES = TRIKE_COLORS + TRIKE_ACCESSORIES
