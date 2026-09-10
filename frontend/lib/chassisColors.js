/** Shared chassis color presets — first step on all trike configurators. */

export const CUSTOM_COLOR_ID = 'custom'
export const CUSTOM_COLOR_SURCHARGE = 100

/** IDs must match CMS seed (candy-*-white) and backend chassis_colors.py */
export const CHASSIS_COLOR_PRESETS = [
  { id: 'candy-red-white', name: 'Red Candy & White', hex: '#e74c3c', accent: '#ffffff' },
  { id: 'candy-blue-white', name: 'Blue Candy & White', hex: '#3498db', accent: '#ffffff' },
  { id: 'candy-purple-white', name: 'Purple Candy & White', hex: '#9b59b6', accent: '#ffffff' },
]

export function resolveChassisColorLabel(colorId, customText = '') {
  if (colorId === CUSTOM_COLOR_ID) {
    const trimmed = String(customText || '').trim()
    return trimmed ? `Custom: ${trimmed}` : 'Custom color'
  }
  return CHASSIS_COLOR_PRESETS.find((c) => c.id === colorId)?.name || colorId || ''
}

export function chassisColorSurcharge(colorId) {
  return colorId === CUSTOM_COLOR_ID ? CUSTOM_COLOR_SURCHARGE : 0
}
