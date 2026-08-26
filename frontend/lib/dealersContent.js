/** Canonical dealers shown on /dealers when API is unavailable or incomplete. */
export const DEALERS_FALLBACK = [
  {
    id: 'paramotor-flights-llc',
    nombre: 'Paramotor Flights LLC',
    equipo: 'Team Louish',
    ubicacion: 'Saratoga Springs, Utah',
    descripcion:
      'Authorized Paratrikes dealer serving Utah. Specializing in tandem paramotor flights, professional flight training, pilot support, and high-quality powered paragliding equipment. Dedicated to providing safe, exciting, and unforgettable flying experiences for both new and experienced pilots.',
    instagram: 'https://www.instagram.com/paramotorflights',
    orden: 10,
  },
  {
    id: 'pukana-adventures',
    nombre: 'Pukana Adventures',
    equipo: null,
    ubicacion: 'Utah',
    descripcion:
      "Authorized Paratrikes dealer offering tandem paramotor flights, certified flight training, a fully equipped paramotor shop, and access to a dedicated flight park. Whether you're looking to experience your first flight, become a certified pilot, or purchase premium paramotor equipment, Pukana Adventures provides expert guidance and outstanding customer service.",
    instagram: 'https://www.instagram.com/pukanaadventures?igsh=NXQxcDZtajVmZTEy',
    orden: 20,
  },
]

function dealerKey(dealer) {
  return String(dealer?.nombre || dealer?.id || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
}

/** Fill missing Instagram (and other fields) from fallback; keep API as source of truth. */
export function mergeDealersFromApi(apiList) {
  const fallbackByKey = Object.fromEntries(DEALERS_FALLBACK.map((d) => [dealerKey(d), d]))
  const merged = (Array.isArray(apiList) ? apiList : []).map((dealer) => {
    const fb = fallbackByKey[dealerKey(dealer)]
    if (!fb) return dealer
    return {
      ...fb,
      ...dealer,
      instagram: dealer.instagram || fb.instagram || null,
      equipo: dealer.equipo ?? fb.equipo ?? null,
      ubicacion: dealer.ubicacion || fb.ubicacion || null,
      descripcion: dealer.descripcion || fb.descripcion || null,
    }
  })

  if (merged.length > 0) {
    return merged.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
  }

  return DEALERS_FALLBACK
}

export function instagramHandle(url) {
  if (!url || typeof url !== 'string') return null
  const match = url.match(/instagram\.com\/([^/?#]+)/i)
  return match ? `@${match[1]}` : null
}
