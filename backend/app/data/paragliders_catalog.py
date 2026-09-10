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
        "/images/front1.jpg",
        "Versatile reflex wing for paramotor pilots who want predictable handling and easy inflation across a wide weight range.",
    ),
    (
        "dudek-solo-2",
        "DUDEK Solo 2",
        3673,
        "/images/front1.jpg",
        "Lightweight solo paramotor wing designed for dynamic flight and responsive control without excess weight.",
    ),
    (
        "dudek-nucleon-4",
        "DUDEK Nucleon 4",
        3969,
        "/images/front1.jpg",
        "Reflex profile wing with strong performance for experienced paramotor pilots seeking speed and stability.",
    ),
    (
        "dudek-snake-4",
        "DUDEK Snake 4",
        4234,
        "/images/front1.jpg",
        "High-performance reflex wing for pilots who demand maximum speed and agility in paramotor flight.",
    ),
    (
        "dudek-driftair-2",
        "DUDEK DriftAir 2",
        3855,
        "/images/front1.jpg",
        "Designed for precision and fun in paramotor slalom and dynamic flying with excellent inflation characteristics.",
    ),
    (
        "apco-nrg-iii",
        "APCO NRG III",
        3355,
        "/images/front1.jpg",
        "Efficient paramotor wing with excellent fuel economy and smooth handling for cross-country exploration.",
    ),
    (
        "apco-hybrid-paramotor",
        "APCO Hybrid Paramotor",
        3195,
        "/images/front1.jpg",
        "Hybrid design combining free-flight ease with paramotor-specific reinforcement for powered operations.",
    ),
    (
        "apco-f3-mkii",
        "APCO F3 MKII",
        3341,
        "/images/front1.jpg",
        "Dedicated paramotor wing with reflex technology for stable, confidence-inspiring powered flight.",
    ),
    (
        "dudek-orca-6",
        "DUDEK Orca 6",
        4252,
        "/images/paragliders/dudek-orca-6/gallery-1.jpg",
        "Orca 6 was designed with professional pilots in mind — comfortable, user-friendly, and suitable for free flight and light trikes.",
    ),
    (
        "dudek-cabrio",
        "DUDEK Cabrio",
        4524,
        "/images/paragliders/dudek-cabrio/gallery-1.jpg",
        "Originally dedicated for paramotor tandems and heavier two-seater trikes (PPGG).",
    ),
    (
        "dudek-boson",
        "DUDEK Boson",
        4542,
        "/images/paragliders/dudek-boson/gallery-1.jpg",
        "Designed for experienced pilots flying actively on reflex wings.",
    ),
    (
        "apco-f3bi-mkii",
        "APCO F3Bi MKII",
        3580,
        "/images/paragliders/apco-f3bi-mkii/red-main.png",
        "Dedicated full reflex wing for the tandem experience, enhanced with the Mohawk system.",
    ),
    (
        "apco-play-42-ul",
        "APCO Play 42 UL",
        3456.2,
        "/images/paragliders/apco-play-42-ul/scheme-1-main.jpg",
        "Heavily reinforced Play 42 for loads up to 340 kg — built for the majority of paramotor trikes.",
    ),
    (
        "apco-game-mkiii",
        "APCO Game MKIII",
        3531,
        "/images/paragliders/apco-game-mkiii/azure-main.jpg",
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
