/** Human-readable configuration lines — shared by cart, orders, and admin. */

const UPGRADE_LABELS = {
  'sun-roof-netting': 'Sun-roof netting',
  'cruise-control': 'Cruise control',
  'camel-back': 'Camel back',
  'instrument-kit': 'Instrument kit',
  'electrical-kit': 'Electrical kit',
  'rear-mirror': 'Rear mirror',
  'front-brake': 'Front brake',
  'front-bar-protection': 'Padded roll bar',
  'cockpit-liner': 'Cockpit liner',
  'parachute-container': 'Parachute container',
  'lateral-bag': 'Side explorer cases',
  'lateral-bag-explorer': 'Lateral bag explorer',
  'bottom-explorer-bag': 'Bottom explorer bag',
  'reserve-chute': 'Reserve parachute',
  'auxiliary-lights': 'Auxiliary lights',
  carabiners: 'Carabiners',
  'propeller-guard': 'Propeller guard',
  'rock-guard': 'Rock guard',
  'fuel-gauge-vanguard': 'Fuel gauge',
}

export function extractOptionId(value) {
  if (value == null) return null
  if (typeof value === 'string') return value.trim() || null
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (typeof value === 'object') {
    return value.id || value.slug || value.name || value.displayName || value.hex || null
  }
  return null
}

export function fmtOption(value) {
  const raw = extractOptionId(value) || String(value ?? '').trim()
  if (!raw) return ''
  if (UPGRADE_LABELS[raw]) return UPGRADE_LABELS[raw]
  const stripped = raw.replace(/^(vanguard|nomadic|acc|part)-/i, '')
  return stripped.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Normalize configurador payload before POST /carrito — store slugs, not full objects. */
export function normalizeConfigForApi(config = {}) {
  const pick = (value) => extractOptionId(value)
  const pickUpgrade = (item) => {
    const id = extractOptionId(item)
    return id ? String(id) : null
  }

  const normalized = {
    engine: pick(config.engine),
    chassisType: pick(config.chassisType),
    finish: pick(config.finish),
    handThrottle: pick(config.handThrottle),
    propeller: pick(config.propeller),
    color: pick(config.color),
    colorId: pick(config.colorId),
    upgrades: (config.upgrades || []).map(pickUpgrade).filter(Boolean),
    bookingType: config.bookingType,
    firstName: config.firstName,
    lastName: config.lastName,
    phone: config.phone,
    age: config.age,
    locationId: config.locationId,
    locationName: config.locationName,
    duration: config.duration,
    termsAccepted: config.termsAccepted,
  }

  if (config.chassisColor) {
    normalized.chassisColor = typeof config.chassisColor === 'object'
      ? [config.chassisColor.name, config.chassisColor.hex].filter(Boolean).join(', ')
      : String(config.chassisColor)
  }
  if (config.accentColor) {
    normalized.accentColor = typeof config.accentColor === 'object'
      ? [config.accentColor.name, config.accentColor.hex].filter(Boolean).join(', ')
      : String(config.accentColor)
  }

  return Object.fromEntries(
    Object.entries(normalized).filter(([, value]) => value != null && value !== ''),
  )
}

export function formatConfigSummary(config) {
  if (!config || typeof config !== 'object') return []

  if (Array.isArray(config.config_summary) && config.config_summary.length) {
    return config.config_summary
  }

  const source = config.configuracion && typeof config.configuracion === 'object'
    ? config.configuracion
    : config

  const lines = []

  if (source.bookingType === 'tourist-flight') {
    if (source.firstName || source.lastName) {
      lines.push({
        label: 'Guest',
        value: [source.firstName, source.lastName].filter(Boolean).join(' '),
      })
    }
    if (source.phone) lines.push({ label: 'Phone', value: source.phone })
    if (source.age) lines.push({ label: 'Age', value: String(source.age) })
    if (source.locationName || source.locationId) {
      lines.push({ label: 'Location', value: source.locationName || fmtOption(source.locationId) })
    }
    if (source.duration) lines.push({ label: 'Duration', value: source.duration })
    return lines
  }

  if (source.engine) lines.push({ label: 'Engine', value: fmtOption(source.engine) })
  if (source.chassisType) lines.push({ label: 'Chassis', value: fmtOption(source.chassisType) })
  if (source.finish) lines.push({ label: 'Finish', value: fmtOption(source.finish) })
  if (source.handThrottle) lines.push({ label: 'Hand throttle', value: fmtOption(source.handThrottle) })
  if (source.propeller) lines.push({ label: 'Propeller', value: fmtOption(source.propeller) })
  if (source.color || source.colorId) {
    lines.push({ label: 'Color', value: fmtOption(source.color || source.colorId) })
  }
  if (source.chassisColor) lines.push({ label: 'Chassis color', value: fmtOption(source.chassisColor) })
  if (source.accentColor) lines.push({ label: 'Accent color', value: fmtOption(source.accentColor) })

  if (Array.isArray(source.upgrades) && source.upgrades.length) {
    lines.push({
      label: 'Accessories',
      value: source.upgrades.map((u) => fmtOption(u)).filter(Boolean).join(', '),
    })
  }

  return lines
}
