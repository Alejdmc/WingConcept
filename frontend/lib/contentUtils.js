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

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
