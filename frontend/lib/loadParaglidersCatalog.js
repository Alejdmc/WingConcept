import { loadAdminCatalog, loadPublicCatalog, parseListPrice } from '@/lib/loadPartsCatalog'
import {
  catalogSlugForItem,
  resolveParagliderProductoId,
} from '@/lib/paraglidersCatalogIds'
import {
  PPG_WINGS,
  TRIKE_WING_CATALOG,
  PARAGLIDER_HARNESSES,
} from '@/lib/paraglidersContent'

function mapApiRow(item) {
  if (!item) return null
  const slug = catalogSlugForItem(item) || item.slug
  const wingId = slug?.startsWith('vela-') ? slug.slice(5) : item.wingId || null
  const harnessId = slug?.startsWith('pgl-harness-') ? slug.slice(13) : item.harnessId || null
  const productoId = resolveParagliderProductoId({ ...item, slug, wingId, harnessId })
  const price = parseListPrice(item)

  return {
    slug,
    wingId,
    harnessId,
    productoId,
    name: item.name || item.nombre || '',
    price,
    image: item.image || item.imagenes?.[0] || null,
    description: item.desc || item.descripcion_corta || item.descripcion || item.description || '',
    categoria: item.categoria,
  }
}

function indexBySlug(rows) {
  const map = new Map()
  for (const row of rows) {
    if (row?.slug) map.set(row.slug, row)
  }
  return map
}

function enrichWing(staticWing, apiBySlug) {
  const slug = staticWing.catalogSlug
  const api = slug ? apiBySlug.get(slug) : null
  return {
    ...staticWing,
    productoId: api?.productoId || staticWing.productoId,
    price: api?.price ?? staticWing.price,
    image: api?.image || staticWing.image,
  }
}

function enrichHarness(staticHarness, apiBySlug) {
  const slug = staticHarness.catalogSlug
  const api = slug ? apiBySlug.get(slug) : null
  return {
    ...staticHarness,
    productoId: api?.productoId || staticHarness.productoId,
    price: api?.price ?? staticHarness.price,
  }
}

export function staticParaglidersCatalog() {
  return {
    ppgWings: PPG_WINGS,
    trikeWings: TRIKE_WING_CATALOG,
    harnesses: PARAGLIDER_HARNESSES.filter((h) => h.harnessId),
  }
}

/** Admin list — vela wings + pgl-harness-* accesorios (includes inactive). */
export async function loadAdminParaglidersCatalog() {
  const [velaRows, accRows] = await Promise.all([
    loadAdminCatalog('vela'),
    loadAdminCatalog('accesorios'),
  ])
  const harnessRows = accRows.filter((r) => String(r.slug || '').startsWith('pgl-harness-'))
  return [...velaRows, ...harnessRows]
}

/**
 * Load /paragliders catalog: API first (vela + pgl-harness accesorios), static fallback.
 */
export async function loadParaglidersPageCatalog() {
  try {
    const [velaRows, accRows] = await Promise.all([
      loadPublicCatalog('vela'),
      loadPublicCatalog('accesorios'),
    ])
    const harnessRows = accRows.filter((r) => String(r.slug || '').startsWith('pgl-harness-'))
    const mapped = [...velaRows, ...harnessRows].map(mapApiRow).filter(Boolean)

    if (mapped.length) {
      const apiBySlug = indexBySlug(mapped)
      return {
        ppgWings: PPG_WINGS.map((w) => enrichWing(w, apiBySlug)),
        trikeWings: TRIKE_WING_CATALOG.map((w) => enrichWing(w, apiBySlug)),
        harnesses: PARAGLIDER_HARNESSES.map((h) => enrichHarness(h, apiBySlug)),
        fromApi: true,
        error: null,
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[paragliders] API catalog unavailable, using static fallback:', err?.message || err)
    }
  }

  const staticCatalog = staticParaglidersCatalog()
  return {
    ...staticCatalog,
    fromApi: false,
    error: null,
  }
}
