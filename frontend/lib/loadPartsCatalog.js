import { api } from '@/lib/api'

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
