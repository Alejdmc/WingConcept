"""
Catálogo canónico de /paragliders — alas y arneses vendibles aparte.
Debe coincidir con frontend/lib/paraglidersContent.js y paraglidersCatalogIds.js.
"""

DEFAULT_STOCK = 10
DEFAULT_STOCK_MINIMO = 2
CATALOG_NAMESPACE = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"

# wing_id, nombre, precio, imagen, descripcion
WINGS = [
    (
        "dudek-universal-11",
        "DUDEK Universal 1.1",
        3560,
        "/images/paragliders/paramotor/dudek-universal-11/tech-weight-ranges.png",
        "Versatile reflex wing for paramotor pilots who want predictable handling and easy inflation across a wide weight range.",
    ),
    (
        "dudek-solo-2",
        "DUDEK Solo 2",
        3673,
        "/images/paragliders/paramotor/dudek-solo-2/tech-weight-ranges.png",
        "Lightweight solo paramotor wing designed for dynamic flight and responsive control without excess weight.",
    ),
    (
        "dudek-nucleon-4",
        "DUDEK Nucleon 4",
        3969,
        "/images/paragliders/paramotor/dudek-nucleon-4/tech-weight-ranges.png",
        "Reflex profile wing with strong performance for experienced paramotor pilots seeking speed and stability.",
    ),
    (
        "dudek-snake-4",
        "DUDEK Snake 4",
        4234,
        "/images/paragliders/paramotor/dudek-snake-4/tech-weight-ranges.png",
        "High-performance reflex wing for pilots who demand maximum speed and agility in paramotor flight.",
    ),
    (
        "dudek-driftair-2",
        "DUDEK DriftAir 2",
        3855,
        "/images/paragliders/paramotor/dudek-driftair-2/tech-weight-ranges.png",
        "Designed for precision and fun in paramotor slalom and dynamic flying with excellent inflation characteristics.",
    ),
    (
        "apco-nrg-iii",
        "APCO NRG III",
        3355,
        "/images/paragliders/paramotor/apco-nrg-iii/tech-sheet.jpg",
        "Efficient paramotor wing with excellent fuel economy and smooth handling for cross-country exploration.",
    ),
    (
        "apco-hybrid-paramotor",
        "APCO Hybrid Paramotor",
        3195,
        "/images/paragliders/paramotor/apco-hybrid-paramotor/tech-sheet.jpg",
        "Hybrid design combining free-flight ease with paramotor-specific reinforcement for powered operations.",
    ),
    (
        "apco-f3-mkii",
        "APCO F3 MKII",
        3341,
        "/images/paragliders/paramotor/apco-f3-mkii/tech-sheet.png",
        "Dedicated paramotor wing with reflex technology for stable, confidence-inspiring powered flight.",
    ),
    (
        "dudek-orca-6",
        "DUDEK Orca 6",
        4252,
        "/images/paragliders/dudek-orca-6/tech-weight-ranges.png",
        "Orca 6 was designed with professional pilots in mind — comfortable, user-friendly, and suitable for free flight and light trikes.",
    ),
    (
        "dudek-cabrio",
        "DUDEK Cabrio",
        4524,
        "/images/paragliders/dudek-cabrio/tech-weight-ranges.png",
        "Originally dedicated for paramotor tandems and heavier two-seater trikes (PPGG).",
    ),
    (
        "dudek-boson",
        "DUDEK Boson",
        4542,
        "/images/paragliders/dudek-boson/tech-weight-ranges.png",
        "Designed for experienced pilots flying actively on reflex wings.",
    ),
    (
        "apco-f3bi-mkii",
        "APCO F3Bi MKII",
        3580,
        "/images/paragliders/apco-f3bi-mkii/tech-plan.png",
        "Dedicated full reflex wing for the tandem experience, enhanced with the Mohawk system.",
    ),
    (
        "apco-play-42-ul",
        "APCO Play 42 UL",
        3456.2,
        "/images/paragliders/apco-play-42-ul/tech-3d.jpg",
        "Heavily reinforced Play 42 for loads up to 340 kg — built for the majority of paramotor trikes.",
    ),
    (
        "apco-game-mkiii",
        "APCO Game MKIII",
        3531,
        "/images/paragliders/apco-game-mkiii/tech-3d.jpg",
        "Equally great for free flying and paramotor tandem flying with high efficiency.",
    ),
]

# item_id, nombre, precio, imagen, descripcion
HARNESSES = [
    (
        "powerseat-comfort",
        "DUDEK Power Seat Comfort",
        733,
        "/images/front1.jpg",
        "Paramotor harness with enhanced comfort padding — soft arm pads and back support for launch and flight.",
    ),
]

WING_IDS = [row[0] for row in WINGS]
HARNESSES_IDS = [row[0] for row in HARNESSES]

CANONICAL_WING_SLUGS = {f"vela-{wid}" for wid in WING_IDS}
CANONICAL_HARNESS_SLUGS = {f"pgl-harness-{hid}" for hid in HARNESSES_IDS}
