'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { api } from '@/lib/api'
import { pickText, sleep } from '@/lib/contentUtils'
import { normalizeAccessoryId, resolveAccessoryImage, resolveAccessoryGallery } from '@/lib/accessoryImages'

import { HOMEPAGE_BLOCKS } from '@/lib/staticContent'

const cache = new Map()
const MAX_ATTEMPTS = 1

const DEFAULT_BLOCKS_BY_SECTION = {
  homepage: HOMEPAGE_BLOCKS,
}

function readCache(key) {
  return cache.get(key)?.data ?? null
}

function writeCache(key, data) {
  cache.set(key, { data, ts: Date.now() })
}

export function useSiteBlocks(seccion = null) {
  const key = seccion || '__all__'
  const defaultBlocks = seccion ? (DEFAULT_BLOCKS_BY_SECTION[seccion] || {}) : {}
  const [blocks, setBlocks] = useState(() => readCache(key) || defaultBlocks)
  const [loading, setLoading] = useState(() => !cache.has(key))

  const get = useCallback((blockKey, fallback = '') => {
    return pickText(blocks[blockKey], fallback)
  }, [blocks])

  useEffect(() => {
    let cancelled = false
    const cached = readCache(key)

    const load = async (attempt = 0) => {
      try {
        const data = await api.cms.site(seccion)
        const b = data?.blocks || {}
        if (!cancelled) {
          writeCache(key, b)
          setBlocks(b)
          setLoading(false)
        }
      } catch {
        if (attempt + 1 < MAX_ATTEMPTS && !cancelled) {
          await sleep(400 * (attempt + 1))
          return load(attempt + 1)
        }
        if (!cancelled) {
          // Keep previous blocks / fallbacks — do not wipe on transient failure
          setLoading(false)
        }
      }
    }

    if (cached) {
      setBlocks(cached)
      setLoading(false)
      // Refetch en background solo si el caché tiene más de 5 minutos
      const entry = cache.get(key)
      if (entry && Date.now() - entry.ts < 5 * 60 * 1000) {
        return () => { cancelled = true }
      }
    }

    load()

    return () => { cancelled = true }
  }, [key, seccion])

  return { blocks, loading, get }
}

function sortNoOptionFirst(items, noId) {
  return [...(items || [])].sort((a, b) => {
    if (a.id === noId) return -1
    if (b.id === noId) return 1
    return 0
  })
}

function pickDefaultId(items, preferredId) {
  if ((items || []).some((item) => item.id === preferredId)) return preferredId
  return items?.[0]?.id ?? null
}

function normalizeConfigOptions(catalog, productoId, fallbackOptions) {
  const engines = sortNoOptionFirst(
    catalog.engines?.length
      ? catalog.engines.map((o) => mapEngine(o, fallbackOptions.engines))
      : fallbackOptions.engines,
    'no-engine',
  )
  const propellers = sortNoOptionFirst(
    catalog.propellers?.length
      ? catalog.propellers.map((o) => mapPropeller(o, fallbackOptions.propellers))
      : fallbackOptions.propellers,
    'no-propeller',
  )
  return {
    engines,
    chassisTypes: catalog.chassis_types?.length
      ? catalog.chassis_types.map((o) => mapChassis(o, fallbackOptions.chassisTypes))
      : fallbackOptions.chassisTypes,
    chassisFinishes: catalog.finishes?.length
      ? catalog.finishes.map((o) => mapFinish(o, fallbackOptions.chassisFinishes))
      : fallbackOptions.chassisFinishes,
    handThrottles: catalog.hand_throttles?.length
      ? catalog.hand_throttles.map((o) => mapHandThrottle(o, fallbackOptions.handThrottles))
      : fallbackOptions.handThrottles || [],
    propellers,
    colors: catalog.colors?.length ? catalog.colors.map(mapColor) : fallbackOptions.colors,
    accessories: catalog.accessories?.length
      ? catalog.accessories.map((o) => mapAccessory(o, productoId, fallbackOptions.accessories))
      : fallbackOptions.accessories,
  }
}

export function useConfigOptions(productoId, fallbackOptions) {
  const [options, setOptions] = useState(() => normalizeConfigOptions({}, productoId, fallbackOptions))
  const [basePrice, setBasePrice] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!productoId) {
      setOptions(normalizeConfigOptions({}, productoId, fallbackOptions))
      setLoading(false)
      return
    }
    let cancelled = false

    const load = async (attempt = 0) => {
      try {
        const catalog = await api.cms.configurador(productoId)
        if (cancelled || !catalog) return
        setBasePrice(catalog.base_chassis_price ?? null)
        setOptions(normalizeConfigOptions(catalog, productoId, fallbackOptions))
      } catch {
        if (attempt + 1 < MAX_ATTEMPTS && !cancelled) {
          await sleep(400 * (attempt + 1))
          return load(attempt + 1)
        }
        if (!cancelled) setOptions(normalizeConfigOptions({}, productoId, fallbackOptions))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [productoId])

  const defaultSelections = {
    engineId: pickDefaultId(options.engines, 'no-engine'),
    propellerId: pickDefaultId(options.propellers, 'no-propeller'),
    chassisTypeId: options.chassisTypes?.[0]?.id ?? null,
    finishId: options.chassisFinishes?.[0]?.id ?? null,
    handThrottleId: pickDefaultId(options.handThrottles, 'no-throttle'),
    colorId: options.colors?.[0]?.id ?? null,
  }

  return { options, basePrice, loading, defaultSelections }
}

/** Aplica selecciones por defecto una sola vez cuando el catálogo CMS termina de cargar. */
export function useApplyConfigDefaults(defaultSelections, loading, apply) {
  const applied = useRef(false)
  useEffect(() => {
    if (loading || applied.current) return
    apply(defaultSelections)
    applied.current = true
  }, [loading, defaultSelections, apply])
}

function resolveOptionImage(cmsImage, fallbackImage, conventionPath) {
  const pick = (src) => (typeof src === 'string' && src.startsWith('/images/') ? src.trim() : null)
  return pick(fallbackImage) || pick(cmsImage) || pick(conventionPath) || fallbackImage || cmsImage || null
}

function normalizeOptionGallery(o) {
  if (Array.isArray(o.gallery) && o.gallery.length) {
    return o.gallery.filter(Boolean).slice(0, 3)
  }
  return undefined
}

function withOptionalGallery(base, o) {
  const gallery = normalizeOptionGallery(o)
  return gallery ? { ...base, gallery } : base
}

function mapEngine(o, fallbackEngines = []) {
  const fb = (fallbackEngines || []).find((item) => item.id === o.id)
  return withOptionalGallery({
    id: o.id,
    name: o.name,
    basePrice: o.basePrice ?? o.price ?? 0,
    image: resolveOptionImage(o.image, fb?.image, o.id ? `/images/engines/${String(o.id).toLowerCase()}.jpg` : null),
    power: o.power || fb?.power,
    infoUrl: o.infoUrl || fb?.infoUrl,
    priceTbd: Boolean(o.price_tbd || o.priceTbd || fb?.priceTbd),
    description: pickText(o.description, fb?.description),
  }, o)
}
function mapHandThrottle(o, fallbackHandThrottles = []) {
  const fb = (fallbackHandThrottles || []).find((item) => item.id === o.id)
  return {
    id: o.id,
    name: o.name,
    description: pickText(o.description, fb?.description),
    price: o.price ?? fb?.price ?? 0,
  }
}
function mapChassis(o, fallbackChassis = []) {
  const fb = (fallbackChassis || []).find((item) => item.id === o.id)
  return withOptionalGallery({
    id: o.id,
    name: o.name,
    description: pickText(o.description, fb?.description),
    image: resolveOptionImage(o.image, fb?.image, o.id ? `/images/chassis/${o.id}.jpg` : null),
  }, o)
}
function mapFinish(o, fallbackFinishes = []) {
  const fb = (fallbackFinishes || []).find((item) => item.id === o.id)
  return {
    id: o.id,
    name: o.name,
    description: pickText(o.description, fb?.description),
    swatch: o.swatch || fb?.swatch,
    price: o.price ?? fb?.price ?? 0,
  }
}
function mapPropeller(o, fallbackPropellers = []) {
  const fb = (fallbackPropellers || []).find((item) => item.id === o.id)
  const propId = o.id
  const defaultPath = propId === 'tripala' || propId === 'bipala'
    ? '/images/propellers/bipala.jpg'
    : (propId ? `/images/propellers/${propId}.jpg` : null)
  return withOptionalGallery({
    id: o.id,
    name: o.name,
    description: pickText(o.description, fb?.description),
    price: o.price ?? fb?.price ?? 0,
    image: resolveOptionImage(o.image, fb?.image, defaultPath),
  }, o)
}
function mapColor(o) {
  return { id: o.id, name: o.name, hex: o.hex, price: o.price ?? 0, accent: o.accent }
}
function mapAccessory(o, productoId, fallbackAccessories = []) {
  const key = normalizeAccessoryId(o.id)
  const fallback = (fallbackAccessories || []).find(
    (item) => item.id === o.id || normalizeAccessoryId(item.id) === key,
  )
  const gallery = resolveAccessoryGallery(o.id, {
    cmsImage: o.image,
    cmsGallery: o.gallery,
    productoId,
    fallbackImage: fallback?.image,
  })
  return {
    id: o.id,
    name: o.name,
    price: o.price ?? fallback?.price ?? 0,
    description: pickText(o.description, fallback?.description),
    image: gallery[0] || resolveAccessoryImage(o.id, o.image, productoId, fallback?.image),
    gallery,
  }
}

export function formatConfigSummary(config) {
  if (!config || typeof config !== 'object') return []
  const lines = []
  const fmt = (value) => String(value ?? '').replace(/-/g, ' ').trim()

  if (config.bookingType === 'tourist-flight') {
    if (config.firstName || config.lastName) {
      lines.push({ label: 'Guest', value: [config.firstName, config.lastName].filter(Boolean).join(' ') })
    }
    if (config.phone) lines.push({ label: 'Phone', value: config.phone })
    if (config.age) lines.push({ label: 'Age', value: String(config.age) })
    if (config.locationName || config.locationId) lines.push({ label: 'Location', value: config.locationName || fmt(config.locationId) })
    if (config.duration) lines.push({ label: 'Duration', value: config.duration })
    return lines
  }

  if (config.engine) lines.push({ label: 'Engine', value: fmt(config.engine) })
  if (config.chassisType) lines.push({ label: 'Chassis', value: fmt(config.chassisType) })
  if (config.finish) lines.push({ label: 'Flying style', value: fmt(config.finish) })
  if (config.handThrottle) lines.push({ label: 'Hand throttle', value: fmt(config.handThrottle) })
  if (config.propeller) lines.push({ label: 'Propeller', value: fmt(config.propeller) })
  if (config.color || config.colorId) lines.push({ label: 'Color', value: fmt(config.color || config.colorId) })
  if (config.chassisColor) lines.push({ label: 'Chassis color', value: String(config.chassisColor) })
  if (config.accentColor) lines.push({ label: 'Accent color', value: String(config.accentColor) })
  if (Array.isArray(config.upgrades) && config.upgrades.length) {
    lines.push({
      label: 'Accessories',
      value: config.upgrades.map((u) => fmt(typeof u === 'string' ? u : u?.id || u?.name || u)).filter(Boolean).join(', '),
    })
  }
  return lines
}
