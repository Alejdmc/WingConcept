/**
 * Deterministic product UUIDs — must match backend/app/data/paragliders_catalog.py
 * (uuid.uuid5(CATALOG_NAMESPACE, slug) for vela-* / pgl-harness-* slugs).
 */
export const CATALOG_NAMESPACE = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

export const PARAGLIDER_CATALOG_IDS = {
  'vela-dudek-universal-11': '0112b0fb-45be-5331-8d90-5ecf3877914c',
  'vela-dudek-solo-2': '23b17614-d82c-5761-9801-d0657eee3400',
  'vela-dudek-nucleon-4': '9501e6d2-510b-5dbd-9d75-8185fb154dd7',
  'vela-dudek-snake-4': '0cccd754-1e3a-59a5-91a2-9ad83f8f6921',
  'vela-dudek-driftair-2': '13841f80-1930-55d6-8b43-8a8a2cdac68b',
  'vela-apco-nrg-iii': 'e118f9bf-c479-5c21-97b8-619462f1b7e6',
  'vela-apco-hybrid-paramotor': 'a4b12b17-3d77-5332-854f-87f819c81657',
  'vela-apco-f3-mkii': 'cc301ed8-67b8-5c2e-b25b-da5fc638384a',
  'vela-dudek-orca-6': '9868ba5f-1920-5fc6-9eff-a5970f13b416',
  'vela-dudek-cabrio': '6ce4f764-e1d1-5cdd-9d8c-a3fd55211dcf',
  'vela-dudek-boson': '2679ea15-7644-556b-b27e-a1ff4fcbeed6',
  'vela-apco-f3bi-mkii': '1247af07-143c-5b46-aeec-2897294b12db',
  'vela-apco-play-42-ul': '371fa48d-66a4-55ce-bcc8-39c52eaf19ca',
  'vela-apco-game-mkiii': '90744a19-78ae-5663-8cbe-11f773a60fab',
  'pgl-harness-powerseat-comfort': '1db48503-d8c9-526d-bbf8-afdf68c6f31e',
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isCatalogUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value)
}

export function catalogSlugForWing(wingId) {
  if (!wingId || typeof wingId !== 'string') return null
  return `vela-${wingId}`
}

export function catalogSlugForHarness(harnessId) {
  if (!harnessId || typeof harnessId !== 'string') return null
  return `pgl-harness-${harnessId}`
}

export function catalogSlugForItem(item) {
  if (item.slug?.startsWith('vela-') || item.slug?.startsWith('pgl-harness-')) {
    return item.slug
  }
  if (item.wingId) return catalogSlugForWing(item.wingId)
  if (item.harnessId) return catalogSlugForHarness(item.harnessId)
  if (item.id && !isCatalogUuid(String(item.id))) {
    if (item.categoria === 'vela') return catalogSlugForWing(item.id)
    if (item.harnessId || item.id === 'powerseat-comfort') {
      return catalogSlugForHarness(item.harnessId || item.id)
    }
  }
  return item.slug || null
}

/** Product UUID for cart — API id or deterministic seed id. */
export function resolveParagliderProductoId(item) {
  if (item.productoId && isCatalogUuid(String(item.productoId))) {
    return String(item.productoId)
  }
  if (item.id != null && isCatalogUuid(String(item.id))) {
    return String(item.id)
  }
  const slug = catalogSlugForItem(item)
  if (slug && PARAGLIDER_CATALOG_IDS[slug]) {
    return PARAGLIDER_CATALOG_IDS[slug]
  }
  return null
}
