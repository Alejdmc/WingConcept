import { api } from '@/lib/api'
import { ACCESSORIES } from '@/lib/accessories'
import { PARTS } from '@/lib/parts'
import {
  normalizeAccessoryId,
  resolveAccessoryGallery,
  resolveAccessoryImage,
} from '@/lib/accessoryImages'
import { padGallery } from '@/lib/configuratorImages'
import {
  catalogSlugForItem,
  resolveCatalogProductoId,
} from '@/lib/partsCatalogIds'

const PAGE_SIZE = 50

/** Load all products for a category (paginated). Same source as GET /api/v1/productos. */
export async function loadPublicCatalog(categoria) {
  const items = []
  let pagina = 1
  let paginas = 1
  while (pagina <= paginas) {
    const res = await api.productos.listar({ categoria, por_pagina: PAGE_SIZE, pagina })
    items.push(...(res.items || []))
    paginas = res.paginas || 1
    pagina += 1
  }
  return items
}

/** Admin list — includes inactive items; same repuestos/accesorios categories. */
export async function loadAdminCatalog(categoria) {
  const items = []
  let pagina = 1
  let paginas = 1
  while (pagina <= paginas) {
    const res = await api.admin.productos({ categoria, por_pagina: PAGE_SIZE, pagina })
    items.push(...(res.items || []))
    paginas = res.paginas || 1
    pagina += 1
  }
  return items
}

export function parseListPrice(item) {
  if (typeof item?.precio_desde === 'number') return item.precio_desde
  if (typeof item?.price === 'number') return item.price
  if (typeof item?.price === 'string') {
    const n = parseFloat(item.price.replace(/[^0-9.]/g, ''))
    return Number.isFinite(n) ? n : null
  }
  return null
}

function galleryForCatalogItem(accessoryId, options = {}) {
  try {
    const paths = resolveAccessoryGallery(accessoryId, options)
    return padGallery(
      paths.map((src) => ({ src, alt: options.alt || '' })),
    ).map((entry) => entry.src)
  } catch {
    const fallback = options.fallbackImage || options.cmsImage
    return fallback ? [fallback] : []
  }
}

/** Map API row or static catalog entry to /parts card shape. */
export function mapCatalogProduct(item, kind = null) {
  if (!item) return null

  try {
    const catalogSlug = catalogSlugForItem({
      ...item,
      categoria: item.categoria || (kind === 'part' ? 'repuestos' : kind === 'accessory' ? 'accesorios' : item.categoria),
    })
    const slug = catalogSlug || item.slug || item.id
    const accessoryId = normalizeAccessoryId(slug)
    const name = item.name || item.nombre || ''
    const cmsImage = item.image || item.imagenes?.[0] || null
    const productoId = resolveCatalogProductoId(item)

    const images = galleryForCatalogItem(accessoryId, {
      cmsImage,
      productImages: item.imagenes,
      productoId,
      fallbackImage: item.image,
      alt: name,
    })

    return {
      id: slug,
      productoId,
      slug,
      name,
      price: parseListPrice(item),
      image: images[0] || resolveAccessoryImage(accessoryId, cmsImage, productoId, item.image) || cmsImage,
      images,
      description: item.desc || item.descripcion_corta || item.descripcion || item.description || '',
      compatibleWith: item.compatible_with?.length
        ? item.compatible_with
        : item.compatibleWith?.length
          ? item.compatibleWith
          : ['vanguard', 'nomadic'],
    }
  } catch {
    return null
  }
}

export function staticPartsCatalog() {
  return PARTS.map((item) => mapCatalogProduct({ ...item, categoria: 'repuestos' }, 'part')).filter(Boolean)
}

export function staticAccessoriesCatalog() {
  return ACCESSORIES.map((item) => mapCatalogProduct({ ...item, categoria: 'accesorios' }, 'accessory')).filter(Boolean)
}

/**
 * Load /parts catalog: API first, static PARTS + ACCESSORIES if unavailable or empty.
 */
export async function loadPartsPageCatalog() {
  try {
    const [partsRows, accRows] = await Promise.all([
      loadPublicCatalog('repuestos'),
      loadPublicCatalog('accesorios'),
    ])
    const parts = partsRows.map(mapCatalogProduct).filter(Boolean)
    const accessories = accRows.map(mapCatalogProduct).filter(Boolean)
    if (parts.length || accessories.length) {
      return { parts, accessories, fromApi: true, error: null }
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[parts] API catalog unavailable, using static fallback:', err?.message || err)
    }
  }

  return {
    parts: staticPartsCatalog(),
    accessories: staticAccessoriesCatalog(),
    fromApi: false,
    error: null,
  }
}
