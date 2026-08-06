'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { api } from '@/lib/api'
import { pickText, sleep } from '@/lib/contentUtils'

const cache = new Map()
const MAX_ATTEMPTS = 3

function readCache(key) {
  return cache.get(key)?.data ?? null
}

function writeCache(key, data) {
  cache.set(key, { data, ts: Date.now() })
}

export function useSiteBlocks(seccion = null) {
  const key = seccion || '__all__'
  const [blocks, setBlocks] = useState(() => readCache(key) || {})
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

export function useConfigOptions(productoId, fallbackOptions) {
  const [options, setOptions] = useState(fallbackOptions)
  const [basePrice, setBasePrice] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!productoId) {
      setOptions(fallbackOptions)
      setLoading(false)
      return
    }
    let cancelled = false

    const load = async (attempt = 0) => {
      try {
        const catalog = await api.cms.configurador(productoId)
        if (cancelled || !catalog) return
        setBasePrice(catalog.base_chassis_price ?? null)
        setOptions({
          engines: catalog.engines?.length ? catalog.engines.map(mapEngine) : fallbackOptions.engines,
          chassisTypes: catalog.chassis_types?.length ? catalog.chassis_types.map(mapChassis) : fallbackOptions.chassisTypes,
          chassisFinishes: catalog.finishes?.length ? catalog.finishes.map(mapFinish) : fallbackOptions.chassisFinishes,
          propellers: catalog.propellers?.length ? catalog.propellers.map(mapPropeller) : fallbackOptions.propellers,
          colors: catalog.colors?.length ? catalog.colors.map(mapColor) : fallbackOptions.colors,
          accessories: catalog.accessories?.length ? catalog.accessories.map(mapAccessory) : fallbackOptions.accessories,
        })
      } catch {
        if (attempt + 1 < MAX_ATTEMPTS && !cancelled) {
          await sleep(400 * (attempt + 1))
          return load(attempt + 1)
        }
        if (!cancelled) setOptions(fallbackOptions)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [productoId])

  const defaultSelections = {
    engineId: options.engines?.[0]?.id ?? null,
    propellerId: options.propellers?.[0]?.id ?? null,
    chassisTypeId: options.chassisTypes?.[0]?.id ?? null,
    finishId: options.chassisFinishes?.[0]?.id ?? null,
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

function mapEngine(o) {
  return { id: o.id, name: o.name, basePrice: o.basePrice ?? o.price ?? 0, image: o.image, power: o.power }
}
function mapChassis(o) {
  return { id: o.id, name: o.name, description: o.description, image: o.image }
}
function mapFinish(o) {
  return { id: o.id, name: o.name, description: o.description, swatch: o.swatch, price: o.price ?? 0 }
}
function mapPropeller(o) {
  return { id: o.id, name: o.name, description: o.description, price: o.price ?? 0 }
}
function mapColor(o) {
  return { name: o.name, hex: o.hex }
}
function mapAccessory(o) {
  return { id: o.id, name: o.name, price: o.price ?? 0, description: o.description, image: o.image }
}

export function formatConfigSummary(config) {
  if (!config || typeof config !== 'object') return []
  const lines = []
  if (config.engine) lines.push({ label: 'Engine', value: String(config.engine).replace(/-/g, ' ') })
  if (config.chassisType) lines.push({ label: 'Chassis', value: String(config.chassisType) })
  if (config.finish) lines.push({ label: 'Finish', value: String(config.finish).replace(/-/g, ' ') })
  if (config.propeller) lines.push({ label: 'Propeller', value: String(config.propeller) })
  if (config.chassisColor) lines.push({ label: 'Chassis color', value: config.chassisColor })
  if (config.accentColor) lines.push({ label: 'Accent color', value: config.accentColor })
  if (Array.isArray(config.upgrades) && config.upgrades.length) {
    lines.push({ label: 'Accessories', value: config.upgrades.map((u) => u.replace(/-/g, ' ')).join(', ') })
  }
  return lines
}
