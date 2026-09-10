/** Frame color presets — Disruptor Paramotor (aligned with CMS / disruptor_catalog.py). */

export const PARAMOTOR_CUSTOM_COLOR_ID = 'customized'
export const PARAMOTOR_CUSTOM_SURCHARGE = 100

export const PARAMOTOR_COLOR_PRESETS = [
  { id: 'white-red-candy', name: 'White & Red Candy', hex: '#e74c3c', accent: '#ffffff' },
  { id: 'white-purple-candy', name: 'White & Purple Candy', hex: '#9b59b6', accent: '#ffffff' },
  { id: 'white-blue-candy', name: 'White & Blue Candy', hex: '#3498db', accent: '#ffffff' },
]

export function resolveParamotorColorLabel(colorId, customText = '') {
  if (colorId === PARAMOTOR_CUSTOM_COLOR_ID) {
    const trimmed = String(customText || '').trim()
    return trimmed ? `Custom: ${trimmed}` : 'Customized'
  }
  return PARAMOTOR_COLOR_PRESETS.find((c) => c.id === colorId)?.name || colorId || ''
}

export function paramotorColorSurcharge(colorId) {
  if (colorId === PARAMOTOR_CUSTOM_COLOR_ID) return PARAMOTOR_CUSTOM_SURCHARGE
  return 0
}
