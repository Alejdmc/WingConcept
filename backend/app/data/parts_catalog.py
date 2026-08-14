"""
Catálogo canónico de /parts — fuente única para seed, cleanup y sync admin.
Debe coincidir con frontend/lib/parts.js y frontend/lib/accessories.js.
"""

PARTS = [
    ("front-axle", "Front Axle", 75, ["vanguard", "nomadic"], "/images/parts/front-axle.png",
     "Easy-to-assemble aluminum front axle engineered specifically for 20mm bearings."),
    ("front-fork", "Front Fork", 280, ["vanguard", "nomadic"], "/images/parts/front-fork.png",
     "Reinforced front fork assembly weighted for ideal stability."),
    ("front-bar-protection", "Protection with Front Bar Handle", 47, ["vanguard", "nomadic"],
     "/images/parts/front-bar-protection.png", "Structural front protection bar that serves as a convenient handgrip or handle."),
    ("parachute-container", "Parachute Container", 55, ["vanguard", "nomadic"],
     "/images/parts/parachute-container.png", "Emergency parachute container for quick mounting."),
    ("pilot-harness", "Pilot Harness", 190, ["vanguard", "nomadic"], "/images/parts/pilot-harness.png",
     "Hanging-style seat harness with passive safety protection."),
    ("passenger-harness", "Passenger Harness", 220, ["vanguard", "nomadic"],
     "/images/parts/passenger-harness.png", "Passenger seat with foam cushion and instrument holder."),
    ("pilot-dynamic-cage", "Pilot Dynamic Cage", 300, ["vanguard"], "/images/parts/pilot-dynamic-cage.png",
     "Aerodynamic engine cage for distance-focused exploration."),
    ("pilot-hunter-cage", "Pilot Hunter Cage", 300, ["vanguard"], "/images/parts/pilot-hunter-cage.png",
     "Heavy-duty utility cage for tactical or media operations."),
    ("back-axle", "Back Axle No Suspension", 95, ["nomadic"], "/images/parts/back-axle.png",
     "Rear axle for Nomadic without integrated suspension."),
    ("rock-guard", "Nomadic Rock Guard", 85, ["nomadic"], "/images/parts/rock-guard.png",
     "Guard to protect the lower trike body from rocks and debris."),
]

ACCESSORIES = [
    ("cruise-control", "Cruise Control", 25, ["vanguard", "nomadic"], "/images/parts/front-bar-protection.png",
     "For long-distance flights — maintains desired RPM for stable, smooth flight."),
    ("camel-back", "Camel Back for Pilot Hydration", 25, ["vanguard", "nomadic"],
     "/images/parts/passenger-harness.png", "Hydration bladder for long-endurance flights."),
    ("sun-roof-netting", "Sun-Roof Netting", 43, ["vanguard", "nomadic"],
     "/images/parts/sun-roof-netting.png", "Protects the pilot from the sun and prevents line tangles."),
    ("front-bar-protection", "Padded Roll Bar Protector with Handles", 47, ["vanguard", "nomadic"],
     "/images/parts/front-bar-protection.png", "Protects the passenger and provides comfortable handles."),
    ("front-brake", "Front Brake", 120, ["vanguard", "nomadic"], "/images/parts/front-fork.png",
     "Additional cable brake providing extra braking power."),
    ("rear-mirror", "Rear Mirror", 25, ["vanguard", "nomadic"], "/images/parts/instrument-kit-vanguard.png",
     "Essential for viewing wing position during takeoff."),
    ("cockpit-liner", "Passenger & Pilot Cockpit Protective Liner", 105, ["vanguard", "nomadic"],
     "/images/parts/cockpit-liner.png", "Protective travel cover for the cockpit area."),
    ("parachute-container", "Parachute Container", 55, ["vanguard", "nomadic"],
     "/images/parts/parachute-container.png", "Container for mounting on either side of the harnesses."),
    ("lateral-bag", "Two Side Explorer Cases (L-R)", 95, ["vanguard"],
     "/images/parts/lateral-bag-explorer.png", "Pair of aerodynamic side cases with extra straps."),
    ("fuel-gauge-vanguard", "Analog Fuel Gauge (Vanguard)", 119, ["vanguard"],
     "/images/parts/instrument-kit-vanguard.png", "Analog fuel gauge for the Vanguard L-shaped tank."),
    ("auxiliary-lights", "Auxiliary Lights Kit", 187.10, ["vanguard"],
     "/images/parts/instrument-kit-vanguard.png", "LED lights, position indicators, switch and wiring."),
    ("instrument-kit-vanguard", "Basic Instrument Kit (Vanguard)", 340, ["vanguard"],
     "/images/parts/instrument-kit-vanguard.png", "TTO digital gauges and 4-port USB charger."),
    ("electrical-kit", "Complete Electrical Installation Kit", 218.20, ["vanguard", "nomadic"],
     "/images/parts/instrument-kit-vanguard.png", "Full wiring harness for the selected engine."),
    ("carabiners", "Two Carabiners", 90, ["vanguard", "nomadic"], "/images/parts/front-axle.png",
     "High-capacity steel carabiners (2.4 kN each)."),
    ("propeller-guard", "External Propeller Guard", 295, ["vanguard"],
     "/images/parts/pilot-dynamic-cage.png", "Prevents wing or lines from entering the propeller."),
    ("lateral-bag-explorer", "Lateral Bag Explorer", 85, ["nomadic"],
     "/images/parts/lateral-bag-explorer.png", "Side-mounted bag for cross-country exploration."),
    ("bottom-explorer-bag", "Bottom Explorer Bag", 125, ["nomadic"],
     "/images/parts/bottom-explorer-bag.png", "Bottom-mounted adventure bag for long expeditions."),
    ("instrument-kit-nomadic", "Basic Instrument Kit (Nomadic)", 350, ["nomadic"],
     "/images/parts/instrument-kit-nomadic.png", "USB charger and TTO digital sensors."),
]

# Extra slug aliases when matching existing DB rows (configurator id → canonical acc slug)
ACCESSORY_SLUG_ALIASES = {
    "acc-instrument-kit-vanguard": ["instrument-kit", "instrument-kit-vanguard"],
    "acc-instrument-kit-nomadic": ["instrument-kit"],
    "acc-fuel-gauge-vanguard": ["fuel-gauge"],
    "acc-lateral-bag": ["lateral-bag-explorer"],
}

PART_IDS = [row[0] for row in PARTS]
ACCESSORY_IDS = [row[0] for row in ACCESSORIES]

CANONICAL_PART_SLUGS = {f"part-{pid}" for pid in PART_IDS}
CANONICAL_ACCESSORY_SLUGS = {f"acc-{aid}" for aid in ACCESSORY_IDS}
LEGACY_ACCESSORY_ALIASES = set(ACCESSORY_IDS)
LEGACY_PART_ALIASES = set(PART_IDS)

DEFAULT_STOCK = 10
DEFAULT_STOCK_MINIMO = 2
CATALOG_NAMESPACE = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
