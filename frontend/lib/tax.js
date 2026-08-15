export const DEFAULT_TAX_RATE = 0.19
export const CA_TAX_RATE = 0.0725

export function getItemTaxRate(item) {
  if (item?.tasa_impuesto != null) return Number(item.tasa_impuesto)
  return DEFAULT_TAX_RATE
}

/** Impuesto por línea con descuento repartido proporcionalmente. */
export function calculateCartTax(items, subtotal, discount = 0) {
  if (!items?.length || subtotal <= 0) return 0

  const taxableSubtotal = Math.max(subtotal - discount, 0)
  let totalTax = 0

  for (const item of items) {
    const lineSubtotal = Number(item.subtotal ?? item.precio_unitario * item.cantidad)
    if (lineSubtotal <= 0) continue
    const share = lineSubtotal / subtotal
    const lineTaxable = taxableSubtotal * share
    totalTax += lineTaxable * getItemTaxRate(item)
  }

  return Math.round(totalTax)
}

export function formatTaxLabel(items) {
  const rates = [...new Set((items || []).map(getItemTaxRate))]
  if (rates.length === 1) {
    const pct = rates[0] * 100
    const formatted = Number.isInteger(pct) ? String(pct) : pct.toFixed(2).replace(/\.?0+$/, '')
    return `Tax (${formatted}%)`
  }
  return 'Tax'
}
