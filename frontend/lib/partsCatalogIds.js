/**
 * Deterministic product UUIDs — must match backend/app/data/parts_catalog.py
 * (uuid.uuid5(CATALOG_NAMESPACE, slug) for part-* / acc-* slugs).
 */
export const CATALOG_NAMESPACE = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

export const CATALOG_PRODUCT_IDS = {
  'part-front-axle': '023ac662-cabb-5303-bc9d-43508b2a10c7',
  'part-front-fork': 'fe57d8ed-5743-509b-9b91-c2f11093dc58',
  'part-front-bar-protection': '2c190b70-0157-5b46-bc5c-3e98e5b73313',
  'part-parachute-container': '63ab5c3e-ab87-5b7f-bf78-86aa3de8df81',
  'part-pilot-harness': '32008a48-35ee-5914-aff3-ffdbd4a3db44',
  'part-passenger-harness': '8090fd2d-bb13-5c23-b7b8-f94f8683c6e3',
  'part-pilot-dynamic-cage': 'db756b0f-6837-5112-bdf8-ed23bfb6c295',
  'part-pilot-hunter-cage': 'a0dd4c90-9364-5a23-9e0b-eca4a74297b1',
  'part-back-axle': '0fb44770-f8ef-515b-aeb6-f756ecb498fb',
  'part-rock-guard': '4878fd41-1ad5-54a1-a5d5-cca970032fe7',
  'part-triker-mini-vanguard': 'fa3f785e-f3f7-5e47-8340-14af44375b7f',
  'acc-cruise-control': '268455ad-c64d-5d2e-b576-b7d47827fc7c',
  'acc-camel-back': '7db5604a-3864-5b62-88eb-12a389a8dcf9',
  'acc-sun-roof-netting': 'a344242d-828c-5079-a2d4-75bbaacd4386',
  'acc-front-bar-protection': 'd88cfc7f-72a0-5960-80b7-e2f3b8e7a4b4',
  'acc-front-brake': '9ec9e6bd-84c8-56f3-bb88-f60b35ff40ed',
  'acc-rear-mirror': '613ae986-db61-5366-97bd-9ec16e57c4ac',
  'acc-cockpit-liner': 'f7132f77-8a9c-5ffb-b297-9a8f9eabb2e0',
  'acc-parachute-container': '1087c5a6-1d87-56f4-a36e-56dbc79b1088',
  'acc-lateral-bag': 'dec02af9-9c77-5e19-9a22-cb766ce0cc7b',
  'acc-fuel-gauge-vanguard': 'f7f27b48-75f2-5840-a12b-4ad433fb38ee',
  'acc-auxiliary-lights': '685c5117-f41b-54a0-a454-221a471ea79e',
  'acc-instrument-kit-vanguard': '6ccd5ef1-90f0-5e08-8efd-0064dda9d013',
  'acc-electrical-kit': '02b9e339-f748-554b-895a-3eb81ccf0462',
  'acc-carabiners': '7996419c-faf2-5125-adab-089a53e49185',
  'acc-propeller-guard': 'b65afbf7-2f8e-523e-b3ce-1a41b2af8638',
  'acc-lateral-bag-explorer': '399e4446-1443-53bc-b657-34409aec4de6',
  'acc-bottom-explorer-bag': 'a0b0b4a8-d108-501d-bcab-ca700410aee6',
  'acc-instrument-kit-nomadic': 'ca222e01-867e-5d37-adbe-85b9c4768c75',
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isCatalogUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value)
}

/** Resolve canonical part-* / acc-* slug from API or static catalog row. */
export function catalogSlugForItem(item) {
  if (item.slug && (item.slug.startsWith('part-') || item.slug.startsWith('acc-'))) {
    return item.slug
  }
  const bare = item.id
  if (typeof bare !== 'string' || isCatalogUuid(bare)) {
    if (item.categoria === 'repuestos' && item.slug) return item.slug.startsWith('part-') ? item.slug : `part-${item.slug.replace(/^part-/, '')}`
    if (item.categoria === 'accesorios' && item.slug) return item.slug.startsWith('acc-') ? item.slug : `acc-${item.slug.replace(/^acc-/, '')}`
    return item.slug || null
  }
  if (item.categoria === 'repuestos') return `part-${bare}`
  if (item.categoria === 'accesorios') return `acc-${bare}`
  return null
}

/** Product UUID for cart — API id or deterministic seed id. */
export function resolveCatalogProductoId(item) {
  if (item.productoId && isCatalogUuid(String(item.productoId))) {
    return String(item.productoId)
  }
  if (item.id != null && isCatalogUuid(String(item.id))) {
    return String(item.id)
  }
  const slug = catalogSlugForItem(item)
  if (slug && CATALOG_PRODUCT_IDS[slug]) {
    return CATALOG_PRODUCT_IDS[slug]
  }
  return null
}
