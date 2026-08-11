"""
Datos iniciales del CMS y configurador — valores alineados con el frontend.
Ejecutar tras migración: python -m scripts.seed_cms_configurador
"""
from __future__ import annotations

import asyncio
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal
from app.models.configurador_opcion import ConfiguradorOpcion
from app.models.producto import Producto
from app.models.site_block import SiteBlock

VANGUARD_ID = uuid.UUID("c1a2b3d4-e5f6-7890-1234-567890abcdef")
NOMADIC_ID = uuid.UUID("d1e2f3a4-b5c6-7890-1234-567890abcdef")

VANGUARD_CONTENIDO = {
    "tagline": "The Ultimate High-Performance Trike",
    "philosophy": "Passion, Science, and Freedom",
    "year": 2020,
    "brand": "Wing Concept",
    "features": [
        {"icon": "Zap", "title": "In-Flight Movable Center of Gravity", "desc": "Adjust the center of gravity while in the air. Perfect for tandem paragliding with precise transition from Tandem to Single configuration during flight."},
        {"icon": "Shield", "title": "SSS (Seat Swap System)", "desc": "Easy removal of passenger seat with passive safety through suspended seat system rather than rigid attachment."},
        {"icon": "Gauge", "title": "ECMB (Electrical Maintenance Box)", "desc": "Centralized electrical management with simple component inspection and flexible accessory integration."},
        {"icon": "Shield", "title": "S.A. Shock Absorber (Active Suspension)", "desc": "1200N resistance per unit. Only 350g each. Safe takeoffs on unprepared terrain and short runways."},
        {"icon": "Package", "title": "Interchangeable Mission Pod", "desc": "Swap the passenger basket to match the mission: Commercial for tandem flights and rental fleets, Adventure for backcountry exploration, or Reportage for aerial photography and filming — all on the same airframe."},
        {"icon": "Truck", "title": "Tool-Free Field Disassembly", "desc": "Breaks down quickly for effortless ground transport — no trailer required. The compact footprint is engineered to load straight into the bed of a pickup truck."},
        {"icon": "Fuel", "title": "Onboard Fuel Gauge & Dual USB Charging", "desc": "Every trike ships with an integrated fuel gauge and dual USB charging ports, keeping the pilot informed and devices powered throughout the flight."},
        {"icon": "Backpack", "title": "Passenger Backrest Instrument & Hydration Pocket", "desc": "The passenger seat backrest doubles as an instrument holder and carries a dedicated Camel Back pocket, keeping the pilot informed and hydrated, plus side pockets and retention straps for the communication radio."},
        {"icon": "Wind", "title": "Low-Drag Propeller Protection Mesh", "desc": "The only trike in the world with a low propeller guard mesh that shields against sand and small stones kicked up by the wheels, while its dynamic design still allows full airflow to the propeller without adding drag."},
        {"icon": "Feather", "title": "Ultra-Light Airframe", "desc": "The bare structure — fully instrumented, without engine or propeller — weighs just 60 kg (132 lb), delivering an exceptional power-to-weight ratio."},
    ],
    "engines_list": [
        {"name": "Rotax 912", "power": "80 HP"},
        {"name": "Simonini Victor 2 Super", "power": "112 HP"},
        {"name": "RMZ500", "power": ""},
        {"name": "Vanguard EFI w/ reduction", "power": "70 HP"},
        {"name": "Hirth 3503", "power": "70 HP"},
    ],
    "specs": {
        "Orientation": "Tandem flight & short runway operations",
        "Development Year": "2020",
        "Chassis Type": "Lightweight & Durable",
        "Suspension": "Active (S.A. System)",
        "Safety": "Passive seat suspension",
    },
    "gallery": [f"/images/vanguard/{i}.png" for i in range(1, 11)],
    "listing": {
        "tagline": "Performance Meets Precision",
        "description": "The ultimate high-performance trike for serious enthusiasts. Built with cutting-edge engineering and premium materials.",
        "features": [
            "Premium aluminum construction",
            "Advanced aerodynamic design",
            "Multiple engine options",
            "Precision-engineered suspension",
        ],
        "image": "/images/vanguard/1.png",
        "cta_label": "Explore Vanguard",
    },
    "compare": {
        "description": "Perfect for pilots who prioritize performance, precision, and high-speed capability. Built with premium materials and advanced engineering.",
        "bullets": [
            "High-performance engines",
            "Precision control systems",
            "Premium comfort features",
        ],
    },
}

NOMADIC_CONTENIDO = {
    "tagline": "The Ultimate Off-Grid Adventure Machine",
    "philosophy": "Go Further, Land Anywhere",
    "year": 2026,
    "brand": "Limitless",
    "features": [
        {"icon": "Zap", "title": "Adjustable Anchor Points", "desc": "In-flight adjustments for perfect weight distribution, ideal when switching from Tandem to Single configuration."},
        {"icon": "Shield", "title": "Integral Chassis Protection", "desc": "Anti-roll cage keeps pilot and passenger within the structural frame in any incident."},
        {"icon": "Gauge", "title": "Expedition Ready", "desc": "Expanded load capacity and reinforced suspension, optimized for carrying all your camping gear."},
        {"icon": "Shield", "title": "All-Terrain Suspension", "desc": "System designed to absorb impacts on irregular terrain, unprepared strips, and difficult landings."},
    ],
    "engines_list": [
        {"name": "Polini Thor 303", "power": "38 HP"},
        {"name": "Polini Thor 260", "power": "24 HP"},
        {"name": "Vittorazi Cosmos 300 MY25", "power": "36 HP"},
    ],
    "specs": {
        "Orientation": "Expedition and Off-Grid Flight",
        "Development Year": "2026",
        "Chassis Type": "High-Durability Stainless Steel",
        "Suspension": "High-Resistance All-Terrain",
        "Safety": "Full Cage Structural Protection",
    },
    "gallery": [f"/images/nomadic/{i}.jpg" for i in range(2, 7)],
    "listing": {
        "tagline": "The Ultimate Off-Grid Adventure",
        "description": "Built for extreme conditions and remote expeditions. Go further, land anywhere with our ruggedized design.",
        "features": [
            "High-durability stainless steel",
            "All-terrain suspension system",
            "Full cage protection",
            "Expedition-ready capacity",
        ],
        "image": "/images/nomadic/2.jpg",
        "cta_label": "Explore Nomadic",
    },
    "compare": {
        "description": "Ideal for adventurers seeking versatility and durability in extreme conditions. Built to handle off-grid expeditions and challenging terrain.",
        "bullets": [
            "All-terrain capability",
            "Expedition-ready features",
            "Rugged construction",
        ],
    },
}

SITE_BLOCKS = [
    ("homepage.hero.eyebrow", "homepage", "Texto superior del banner principal", "text", "WING CONCEPT PARAMOTORS", 1),
    ("homepage.hero.line1", "homepage", "Título principal — línea 1", "text", "WHERE", 2),
    ("homepage.hero.line2", "homepage", "Título principal — línea 2 (destacada)", "text", "FREEDOM TAKES", 3),
    ("homepage.hero.line3", "homepage", "Título principal — línea 3", "text", "WINGS", 4),
    ("homepage.hero.cta_primary", "homepage", "Botón principal del banner", "text", "Explore Paramotors", 5),
    ("homepage.hero.cta_secondary", "homepage", "Botón secundario del banner", "text", "Our Story", 6),
    ("homepage.hero.images", "homepage", "Imágenes del banner (una URL por línea)", "textarea", "/images/paramotor_image.jpg\n/images/paramotor_image2.jpg\n/images/image1.jpg", 7),
    ("paratrike.intro.title", "paratrike", "Título de la página Paratrikes", "text", "Our Paratrikes", 1),
    ("paratrike.intro.subtitle", "paratrike", "Subtítulo de la página Paratrikes", "textarea", "High-performance trikes engineered for adventure, tandem flights, and off-grid exploration.", 2),
    ("paratrike.hero.title", "paratrike", "Título del banner principal", "text", "Paratrikes", 3),
    ("paratrike.hero.subtitle", "paratrike", "Frase bajo el título del banner", "text", "Choose Your Adventure", 4),
    ("paratrike.hero.background", "paratrike", "Imagen de fondo del banner (URL)", "text", "/images/front1.jpg", 5),
    ("paratrike.selection.footer", "paratrike", "Texto debajo de las tarjetas de trikes", "textarea", "Two exceptional trike platforms designed for different flying styles. Whether you seek precision performance or rugged expedition capability, we have your perfect match.", 6),
    ("paratrike.compare.title", "paratrike", "Título de la sección comparación", "text", "Choose Your Path", 7),
    ("paratrike.compare.subtitle", "paratrike", "Subtítulo de la comparación", "text", "Both platforms deliver exceptional performance in their respective domains", 8),
    ("paratrike.cta.title", "paratrike", "Título del llamado a la acción final", "text", "Ready to Fly?", 9),
    ("paratrike.cta.text", "paratrike", "Texto del llamado a la acción final", "textarea", "Explore both platforms, customize your perfect configuration, and experience the freedom of flight.", 10),
]

VANGUARD_OPCIONES = [
    ("engine", "no-engine", "No Engine", None, 0, None, {}),
    ("engine", "rotax-912", "Rotax 912 (80HP)", None, 25000, "/images/engines/rotax-912.jpg", {}),
    ("engine", "RMZ500", "RMZ500", None, 15000, "/images/engines/rmz500.jpg", {}),
    ("engine", "simonini-v2", "Simonini Victor 2 (112HP)", None, 12000, "/images/engines/simonini-v2.jpg", {}),
    ("engine", "hirth-3503", "Hirth 3503 (70HP)", None, 11000, "/images/engines/hirth-3503.jpg", {}),
    ("chassis_type", "commercial", "Commercial", "Reinforced frame built for daily commercial operations, tandem flights and rental fleets. Durable and low maintenance.", 0, "/images/chassis/commercial.jpg", {}),
    ("chassis_type", "adventure", "Adventure", "Lightweight, agile frame for backcountry flying and off-grid exploration. Built to handle rugged conditions.", 0, "/images/chassis/adventure.jpg", {}),
    ("chassis_type", "reportage", "Reportage", "Stable platform tailored for aerial photography and video work, with extra mounting points for camera gear.", 0, "/images/chassis/reportage.jpg", {}),
    ("propeller", "no-propeller", "No Propeller", "Chassis only — add a propeller later or supply your own.", 0, None, {}),
    ("propeller", "bipala", "Two-Blade Propeller (Carbon Fiber)", "Two carbon fiber blades. Lightweight, ideal for standard flight.", 534.75, None, {}),
    ("propeller", "tripala", "Three-Blade Propeller (Carbon Fiber)", "Three carbon fiber blades. More thrust and smoother flight.", 677.35, None, {}),
    ("color", "candy-red", "Candy Red", None, 0, None, {"hex": "#e74c3c", "displayName": "Candy Red"}),
    ("color", "candy-blue", "Candy Blue", None, 0, None, {"hex": "#3498db", "displayName": "Candy Blue"}),
    ("color", "candy-purple", "Candy Purple", None, 0, None, {"hex": "#9b59b6", "displayName": "Candy Purple"}),
    ("color", "white", "White", None, 0, None, {"hex": "#ffffff", "displayName": "White"}),
    ("color", "grey", "Grey", None, 0, None, {"hex": "#95a5a6", "displayName": "Grey"}),
    ("accessory", "sun-roof-netting", "Sun-Roof Netting", "Protects the pilot from the sun and prevents paraglider lines from tangling with equipment.", 43, "/images/parts/sun-roof-netting.png", {}),
    ("accessory", "front-bar-protection", "Padded Roll Bar Protector with Handles", "Protects the passenger and provides comfortable handles.", 47, "/images/parts/front-bar-protection.png", {}),
    ("accessory", "front-brake", "Front Brake", "Additional cable brake providing extra braking power.", 120, "/images/parts/front-fork.png", {}),
    ("accessory", "rear-mirror", "Rear Mirror", "Essential for viewing wing position during takeoff.", 25, "/images/parts/instrument-kit-vanguard.png", {}),
    ("accessory", "cockpit-liner", "Passenger & Pilot Cockpit Protective Liner", "Protective travel cover for trailering.", 105, "/images/parts/cockpit-liner.png", {}),
    ("accessory", "parachute-container", "Parachute Container", "Exclusive container for mounting on harnesses.", 55, "/images/parts/parachute-container.png", {}),
    ("accessory", "lateral-bag", "Two Side Explorer Cases (L-R)", "Pair of aerodynamic side cases with extra straps.", 95, "/images/parts/lateral-bag-explorer.png", {}),
    ("accessory", "cruise-control", "Cruise Control", "Maintains desired RPM for stable, smooth flight.", 25, "/images/parts/front-bar-protection.png", {}),
    ("accessory", "camel-back", "Camel Back for Pilot Hydration", "Hydration bladder setup for long-endurance flights.", 25, "/images/parts/passenger-harness.png", {}),
    ("accessory", "fuel-gauge-vanguard", "Analog Fuel Gauge (Vanguard)", "Analog fuel gauge for the Vanguard L-shaped tank.", 119, "/images/parts/instrument-kit-vanguard.png", {}),
    ("accessory", "auxiliary-lights", "Auxiliary Lights Kit", "LED lights, position indicators, switch and wiring.", 187.10, "/images/parts/instrument-kit-vanguard.png", {}),
    ("accessory", "instrument-kit", "Basic Instrument Kit (Vanguard)", "TTO digital gauges and 4-port USB charger.", 340, "/images/parts/instrument-kit-vanguard.png", {}),
    ("accessory", "electrical-kit", "Complete Electrical Installation Kit", "Full wiring harness for the selected engine.", 218.20, "/images/parts/instrument-kit-vanguard.png", {}),
    ("accessory", "carabiners", "Two Carabiners", "High-capacity steel carabiners (2.4 kN each).", 90, "/images/parts/front-axle.png", {}),
    ("accessory", "propeller-guard", "External Propeller Guard", "Prevents wing or lines from entering the propeller.", 295, "/images/parts/pilot-dynamic-cage.png", {}),
]

NOMADIC_OPCIONES = [
    ("engine", "no-engine", "No Engine", "Chassis only — add an engine later or supply your own.", 0, None, {}),
    ("engine", "polini-303", "Polini Thor 303", None, 3950, "/images/engines/polini-303.jpg", {"power": "38 HP"}),
    ("engine", "polini-260", "Polini Thor 260", None, 4200, "/images/engines/polini-260.jpg", {"power": "24 HP"}),
    ("engine", "vittorazi-300-my25", "Vittorazi Cosmos 300 MY25", None, 4560, "/images/engines/vittorazi-300-my25.jpg", {"power": "36 HP"}),
    ("finish", "stainless-brushed", "Stainless Steel Brushed", "Brushed stainless steel, maximum weather resistance.", 0, None, {"swatch": "#b5b8bb"}),
    ("finish", "anodized-black", "Anodized Black", "Black anodized finish, aggressive look and extra corrosion protection.", 600, None, {"swatch": "#1c1c1c"}),
    ("finish", "titanium-finish", "Titanium Finish", "Titanium finish, lightweight with high structural strength.", 1200, None, {"swatch": "#8e8e8e"}),
    ("propeller", "no-propeller", "No Propeller", "Chassis only — add a propeller later or supply your own.", 0, None, {}),
    ("propeller", "bipala", "Two-Blade Propeller (Carbon Fiber)", "Two carbon fiber blades. Lightweight, ideal for standard flight.", 534.75, None, {}),
    ("propeller", "tripala", "Three-Blade Propeller (Carbon Fiber)", "Three carbon fiber blades. More thrust and smoother flight.", 677.35, None, {}),
    ("color", "candy-red", "Candy Red", None, 0, None, {"hex": "#e74c3c", "displayName": "Candy Red"}),
    ("color", "candy-blue", "Candy Blue", None, 0, None, {"hex": "#3498db", "displayName": "Candy Blue"}),
    ("color", "candy-purple", "Candy Purple", None, 0, None, {"hex": "#9b59b6", "displayName": "Candy Purple"}),
    ("color", "white", "White", None, 0, None, {"hex": "#ffffff", "displayName": "White"}),
    ("color", "grey", "Grey", None, 0, None, {"hex": "#95a5a6", "displayName": "Grey"}),
    ("accessory", "sun-roof-netting", "Sun-Roof Netting", "Protects the pilot from the sun and prevents paraglider lines from tangling with equipment.", 43, "/images/parts/sun-roof-netting.png", {}),
    ("accessory", "cruise-control", "Cruise Control", "Maintains desired RPM for stable, smooth flight.", 25, "/images/parts/front-bar-protection.png", {}),
    ("accessory", "camel-back", "Camel Back for Pilot Hydration", "Hydration bladder setup for long-endurance flights.", 25, "/images/parts/passenger-harness.png", {}),
    ("accessory", "lateral-bag-explorer", "Lateral Bag Explorer", "Side-mounted storage bag for cross-country exploration.", 85, "/images/parts/lateral-bag-explorer.png", {}),
    ("accessory", "cockpit-liner", "Passenger & Pilot Cockpit Protective Liner", "Protective travel cover for trailering.", 105, "/images/parts/cockpit-liner.png", {}),
    ("accessory", "bottom-explorer-bag", "Bottom Explorer Bag", "Bottom-mounted adventure bag for long expeditions.", 125, "/images/parts/bottom-explorer-bag.png", {}),
    ("accessory", "instrument-kit", "Basic Instrument Kit (Nomadic)", "USB charger and 3 TTO digital sensors.", 350, "/images/parts/instrument-kit-nomadic.png", {}),
    ("accessory", "electrical-kit", "Complete Electrical Installation Kit", "Full wiring harness for the selected engine.", 218.20, "/images/parts/instrument-kit-nomadic.png", {}),
    ("accessory", "carabiners", "Two Carabiners", "High-capacity steel carabiners (2.4 kN each).", 90, "/images/parts/front-axle.png", {}),
]


async def _seed_opciones(db: AsyncSession, producto_id: uuid.UUID, rows: list, start_orden: int = 0) -> None:
    existing = await db.execute(
        select(ConfiguradorOpcion.id).where(ConfiguradorOpcion.producto_id == producto_id).limit(1)
    )
    if existing.scalar_one_or_none():
        return

    for i, (grupo, slug, nombre, desc, precio, imagen, extra) in enumerate(rows):
        db.add(ConfiguradorOpcion(
            producto_id=producto_id,
            grupo=grupo,
            slug=slug,
            nombre=nombre,
            descripcion=desc,
            precio=float(precio),
            imagen=imagen,
            extra=extra or None,
            orden=start_orden + i,
            activo=True,
        ))


async def seed_cms_data(db: AsyncSession) -> None:
    for clave, seccion, etiqueta, tipo, valor, orden in SITE_BLOCKS:
        exists = await db.execute(select(SiteBlock.id).where(SiteBlock.clave == clave))
        if not exists.scalar_one_or_none():
            db.add(SiteBlock(clave=clave, seccion=seccion, etiqueta=etiqueta, tipo=tipo, valor=valor, orden=orden, activo=True))

    for pid, contenido in [(VANGUARD_ID, VANGUARD_CONTENIDO), (NOMADIC_ID, NOMADIC_CONTENIDO)]:
        result = await db.execute(select(Producto).where(Producto.id == pid))
        producto = result.scalar_one_or_none()
        if not producto:
            continue
        existing = producto.contenido_extra or {}
        if not existing:
            producto.contenido_extra = contenido
            if pid == NOMADIC_ID:
                producto.imagenes = contenido["gallery"]
        else:
            merged = {**existing}
            for key in ("listing", "compare"):
                if key in contenido and not merged.get(key):
                    merged[key] = contenido[key]
            if pid == NOMADIC_ID:
                merged["gallery"] = contenido["gallery"]
                listing = {**(merged.get("listing") or {}), **contenido["listing"]}
                merged["listing"] = listing
                if not existing.get("features"):
                    merged.update({k: v for k, v in contenido.items() if k not in merged or not merged.get(k)})
                legacy = {"/images/nomadic/1.jpg", "/images/nomadic1.png", "/images/paramotor_trike_ejemplo.PNG"}
                filtered = [u for u in (producto.imagenes or []) if u not in legacy]
                producto.imagenes = filtered if filtered else contenido["gallery"]
            producto.contenido_extra = merged

    await _seed_opciones(db, VANGUARD_ID, VANGUARD_OPCIONES)
    await _seed_opciones(db, NOMADIC_ID, NOMADIC_OPCIONES)
    await db.commit()


async def main() -> None:
    async with AsyncSessionLocal() as db:
        await seed_cms_data(db)
        print("CMS y configurador seed completado.")


if __name__ == "__main__":
    asyncio.run(main())
