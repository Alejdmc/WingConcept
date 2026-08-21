/** Homepage featured cards — copy aligned to product PDFs, uniform length. */

import { NOMADIC_HERO_IMAGE, NOMADIC_PRICE_LABEL } from './nomadicContent'
import {
  DISRUPTOR_PARAMOTOR_BASE_PRICE,
  DISRUPTOR_PARAMOTOR_HERO,
} from './disruptorParamotorContent'
import { PARAMOTOR_HREFS, PARATRIKE_HREFS } from './cmsLabels'

export const FEATURED_EXCLUDED_SLUGS = ['i-pro', 'disruptor-trike', 'paramotor-trike', 'disruptor']

export const FEATURED_ORDER = ['vanguard-v8', 'nomadic-trike', 'disruptor-paramotor']

/** Tagline under title — keep ~2 lines at card width (line-clamp-2). */
export const FEATURED_CATALOG = {
  'vanguard-v8': {
    slug: 'vanguard-v8',
    name: 'Vanguard V8.0',
    image: '/images/vanguard/1.png',
    price: '$5,950.25',
    desc: 'High-performance trike for precision flying, tandem ops, and serious adventure.',
    specs: 'Premium aluminum chassis | Advanced aerodynamics',
    badge: 'Performance',
    href: PARATRIKE_HREFS['vanguard-v8'],
  },
  'nomadic-trike': {
    slug: 'nomadic-trike',
    name: 'Nomadic Trike',
    image: NOMADIC_HERO_IMAGE,
    price: NOMADIC_PRICE_LABEL,
    desc: 'Rugged expedition trike built for off-grid terrain and extreme conditions.',
    specs: 'Stainless steel | All-terrain capability',
    badge: 'Expedition',
    href: PARATRIKE_HREFS['nomadic-trike'],
  },
  'disruptor-paramotor': {
    slug: 'disruptor-paramotor',
    name: 'Disruptor Paramotor',
    image: DISRUPTOR_PARAMOTOR_HERO,
    price: `$${DISRUPTOR_PARAMOTOR_BASE_PRICE.toLocaleString()}`,
    desc: 'The paramotor that evolves with you — in-flight CG correction and tilting arms.',
    specs: 'Gravity Control System | Integrated fuel tank',
    badge: 'Innovation',
    href: PARAMOTOR_HREFS['disruptor-paramotor'],
  },
}

export function buildFeaturedProduct(apiProduct, catalogEntry) {
  const base = catalogEntry || FEATURED_CATALOG[apiProduct?.slug]
  if (!base) return null

  let price = base.price
  if (apiProduct?.slug === 'nomadic-trike') {
    price = NOMADIC_PRICE_LABEL
  } else if (typeof apiProduct?.precio_desde === 'number') {
    price = `$${apiProduct.precio_desde.toLocaleString(undefined, {
      minimumFractionDigits: apiProduct.precio_desde % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })}`
  }

  return {
    id: apiProduct?.id || base.slug,
    slug: base.slug,
    name: apiProduct?.nombre || apiProduct?.name || base.name,
    image: base.image,
    price,
    desc: base.desc,
    specs: base.specs,
    badge: base.badge,
    href: base.href,
  }
}

export function mergeFeaturedProducts(apiItems = []) {
  const allowed = apiItems.filter((p) => !FEATURED_EXCLUDED_SLUGS.includes(p.slug))
  const bySlug = new Map()

  for (const slug of FEATURED_ORDER) {
    bySlug.set(slug, buildFeaturedProduct(null, FEATURED_CATALOG[slug]))
  }

  for (const p of allowed) {
    const built = buildFeaturedProduct(p, FEATURED_CATALOG[p.slug])
    if (built) bySlug.set(p.slug, built)
  }

  return FEATURED_ORDER.map((slug) => bySlug.get(slug)).filter(Boolean)
}
