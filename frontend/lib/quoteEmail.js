export const QUOTE_EMAIL = 'andres@wingconcept.com'

export const QUOTE_TRANSPORT_NOTE =
  'Transport and shipping are NOT included in this estimate.'

export const QUOTE_PRODUCT_NAMES = {
  vanguard: 'Vanguard V8.0 Trike',
  nomadic: 'Nomadic Trike',
  disruptorTrike: 'Trike Disruptor',
  disruptorParamotor: 'Disruptor Paramotor',
}

/** @param {number|null|undefined} price */
export function formatQuotePrice(price) {
  if (price == null) return null
  if (price === 0) return 'Included'
  return `$${price.toLocaleString(undefined, {
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * @param {string} label
 * @param {string} value
 * @param {number|null|undefined} [price]
 * @param {{ priceLabel?: string }} [options]
 */
export function formatQuoteLine(label, value, price, options = {}) {
  if (!value) return null
  const priceText = options.priceLabel ?? formatQuotePrice(price)
  if (priceText) return `${label}: ${value} — ${priceText}`
  return `${label}: ${value}`
}

/** Reference photo URL for quote requests (absolute when possible). */
export function formatQuoteImageLine(label, imagePath) {
  if (!label || !imagePath) return null
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://wingconcept.com'
  const url = imagePath.startsWith('http') ? imagePath : `${origin}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
  return `Photo (${label}): ${url}`
}

/**
 * @param {string|{ label: string, value: string, price?: number|null, priceLabel?: string }} line
 */
export function quoteLineToText(line) {
  if (typeof line === 'string') return line
  if (!line?.value) return null
  return formatQuoteLine(line.label, line.value, line.price, { priceLabel: line.priceLabel })
}

/** @param {string} productName @param {Array<string|object>} [details] */
export function buildQuoteMailto(productName, details = []) {
  const subject = encodeURIComponent(`Quote request — ${productName}`)
  const bodyLines = [
    'Hello Wing Concept team,',
    '',
    `I would like to request a quote for the ${productName}.`,
    '',
  ]

  const rendered = details.map(quoteLineToText).filter(Boolean)
  if (rendered.length > 0) {
    bodyLines.push('My current configuration:')
    rendered.forEach((line) => bodyLines.push(`- ${line}`))
    bodyLines.push('')
    bodyLines.push(QUOTE_TRANSPORT_NOTE)
    bodyLines.push('')
  }

  bodyLines.push('Please contact me with pricing and availability.')
  bodyLines.push('')
  bodyLines.push('Thank you.')

  const body = encodeURIComponent(bodyLines.join('\n'))
  return `mailto:${QUOTE_EMAIL}?subject=${subject}&body=${body}`
}
