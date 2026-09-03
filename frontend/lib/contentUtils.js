/** Treat null, undefined and blank strings as missing CMS values. */
export function pickText(value, fallback = '') {
  if (value == null) return fallback
  if (typeof value === 'string' && !value.trim()) return fallback
  return value
}

/** Merge API content over defaults; empty strings do not override. */
export function mergeContent(defaults, data) {
  if (!data || typeof data !== 'object') return defaults
  if (Array.isArray(defaults)) {
    return Array.isArray(data) && data.length ? data : defaults
  }

  const out = { ...defaults }
  for (const [key, value] of Object.entries(data)) {
    if (value == null) continue
    if (typeof value === 'string') {
      if (value.trim()) out[key] = value
      continue
    }
    if (Array.isArray(value)) {
      if (value.length) out[key] = value
      continue
    }
    if (typeof value === 'object' && defaults[key] && typeof defaults[key] === 'object') {
      out[key] = mergeContent(defaults[key], value)
    } else {
      out[key] = value
    }
  }
  return out
}

export function mergeCompare(fallbackCompare, cmsCompare) {
  const fb = fallbackCompare || { description: '', bullets: [] }
  const cms = cmsCompare && typeof cmsCompare === 'object' ? cmsCompare : {}
  const cmsBullets = Array.isArray(cms.bullets)
    ? cms.bullets.map((b) => String(b || '').trim()).filter(Boolean)
    : []

  return {
    description: pickText(cms.description, fb.description),
    bullets: cmsBullets.length ? cmsBullets : (fb.bullets || []),
  }
}

function indexByKey(items, key) {
  return new Map(
    (items || [])
      .filter((item) => item?.[key])
      .map((item) => [String(item[key]).toLowerCase(), item]),
  )
}

/** CMS engines_list often has name/power only — keep static descriptions in prod. */
export function mergeEngineList(cmsList, fallbackList) {
  if (!Array.isArray(cmsList) || !cmsList.length) return fallbackList || []
  const byName = indexByKey(fallbackList, 'name')
  return cmsList.map((engine) => {
    const fb = byName.get(String(engine.name || '').toLowerCase())
    return {
      ...fb,
      ...engine,
      name: pickText(engine.name, fb?.name),
      power: pickText(engine.power, fb?.power),
      description: pickText(engine.description, fb?.description),
    }
  })
}

/** CMS feature cards may omit desc — merge with static catalog copy. */
export function mergeFeatureList(cmsList, fallbackList) {
  if (!Array.isArray(cmsList) || !cmsList.length) return fallbackList || []
  const byTitle = indexByKey(fallbackList, 'title')
  return cmsList.map((feature) => {
    const fb = byTitle.get(String(feature.title || '').toLowerCase())
    return {
      ...fb,
      ...feature,
      title: pickText(feature.title, fb?.title),
      desc: pickText(feature.desc, fb?.desc),
    }
  })
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
