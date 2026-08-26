export const QUOTE_EMAIL = 'andres@wingconcept.com'

export const QUOTE_PRODUCT_NAMES = {
  vanguard: 'Vanguard V8.0 Trike',
  nomadic: 'Nomadic Trike',
  disruptorTrike: 'Trike Disruptor',
  disruptorParamotor: 'Disruptor Paramotor',
}

/** @param {string} productName @param {string[]} [details] */
export function buildQuoteMailto(productName, details = []) {
  const subject = encodeURIComponent(`Quote request — ${productName}`)
  const bodyLines = [
    'Hello Wing Concept team,',
    '',
    `I would like to request a quote for the ${productName}.`,
    '',
  ]

  if (details.length > 0) {
    bodyLines.push('My current configuration:')
    details.forEach((line) => bodyLines.push(`- ${line}`))
    bodyLines.push('')
  }

  bodyLines.push('Please contact me with pricing and availability.')
  bodyLines.push('')
  bodyLines.push('Thank you.')

  const body = encodeURIComponent(bodyLines.join('\n'))
  return `mailto:${QUOTE_EMAIL}?subject=${subject}&body=${body}`
}
