/** Disruptor paramotor engine thumbnails and galleries (configurator + product page). */

function engineTriplet(slug) {
  return [
    `/images/engines/${slug}-1.jpg`,
    `/images/engines/${slug}-2.jpg`,
    `/images/engines/${slug}-3.jpg`,
  ]
}

/** Primary card/preview image per engine option id. */
export const PARAMOTOR_ENGINE_IMAGES = {
  'vittorazi-atom-80': '/images/engines/vittorazi-atom-80.jpg',
  'vittorazi-moster-185': '/images/engines/vittorazi-moster-185.jpg',
  'vittorazi-moster-185-efi': '/images/engines/vittorazi-moster-185.jpg',
  'vittorazi-moster-185-factory-r': '/images/engines/vittorazi-moster-185.jpg',
  'vittorazi-cosmos-300': '/images/engines/vittorazi-cosmos-300.jpg',
  'polini-130-evo': '/images/engines/polini-130-evo.jpg',
  'polini-202-racing': '/images/engines/polini-202-racing.jpg',
  'polini-303': '/images/engines/polini-303.jpg',
  'sky-150': '/images/engines/sky-150.jpg',
  'sky-zeus-300': '/images/engines/sky-zeus-300.jpg',
}

/** Up to 3 gallery paths keyed by configurador option id. */
export const PARAMOTOR_ENGINE_GALLERIES = {
  'vittorazi-atom-80': engineTriplet('vittorazi-atom-80'),
  'vittorazi-moster-185': engineTriplet('vittorazi-moster-185'),
  'vittorazi-moster-185-efi': engineTriplet('vittorazi-moster-185'),
  'vittorazi-moster-185-factory-r': engineTriplet('vittorazi-moster-185'),
  'vittorazi-cosmos-300': engineTriplet('vittorazi-cosmos-300'),
  'polini-130-evo': engineTriplet('polini-130-evo'),
  'polini-202-racing': engineTriplet('polini-202-racing'),
  'polini-303': engineTriplet('polini-303'),
  'sky-150': engineTriplet('sky-150'),
  'sky-zeus-300': engineTriplet('sky-zeus-300'),
}

export function resolveParamotorEngineImage(engineId) {
  return PARAMOTOR_ENGINE_IMAGES[engineId] || null
}

export function resolveParamotorEngineGallery(engineId) {
  return PARAMOTOR_ENGINE_GALLERIES[engineId] || null
}
