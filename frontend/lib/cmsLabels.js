/** Etiquetas amigables para el panel admin (sin jerga técnica). */

import { resolveProductSlug } from './productSlugs'

export const SECCIONES_CONTENIDO = [
  { id: 'adventure', label: 'Adventure', descripcion: 'Expediciones y tarjetas en /adventure' },
  { id: 'shows', label: 'Shows', descripcion: 'Demostraciones en vivo en /shows' },
  { id: 'events', label: 'Events', descripcion: 'Eventos y talleres en /events' },
]

export const TIPOS_CONTENIDO = {
  adventure: [
    { value: 'hero', label: 'Banner principal', hint: 'La imagen grande y el título de la página' },
    { value: 'intro', label: 'Texto de introducción', hint: 'Párrafo debajo del banner' },
    { value: 'expedicion', label: 'Tarjeta de expedición', hint: 'Cada aventura en la lista' },
  ],
  shows: [
    { value: 'hero', label: 'Banner principal', hint: 'La imagen grande y el título de la página' },
    { value: 'intro', label: 'Texto de introducción', hint: 'Párrafo debajo del banner' },
    { value: 'show', label: 'Tarjeta de show', hint: 'Cada show en la lista' },
  ],
  events: [
    { value: 'hero', label: 'Banner principal', hint: 'La imagen grande y el título de la página' },
    { value: 'intro', label: 'Texto de introducción', hint: 'Párrafo debajo del banner' },
    { value: 'evento', label: 'Tarjeta de evento', hint: 'Cada evento en la lista' },
  ],
  news: [
    { value: 'hero', label: 'Banner principal', hint: 'La imagen grande y el título de la página' },
    { value: 'intro', label: 'Texto de introducción', hint: 'Párrafo debajo del banner' },
    { value: 'noticia', label: 'Tarjeta de noticia', hint: 'Cada artículo en la lista' },
  ],
}

export const GRUPO_CONFIGURADOR = {
  engine: { label: 'Motor', hint: 'Opciones de motor y su precio' },
  chassis_type: { label: 'Tipo de chasis', hint: 'Commercial, Adventure, Reportage (Vanguard)' },
  finish: { label: 'Acabado', hint: 'Acabado del chasis (Nomadic)' },
  propeller: { label: 'Hélice', hint: 'Opciones de hélice y precio' },
  accessory: { label: 'Accesorio', hint: 'Extras que se pueden agregar al carrito' },
  hand_throttle: { label: 'Hand Throttle', hint: 'Joystick throttle options' },
  color: { label: 'Color', hint: 'Colores disponibles (sin costo extra)' },
}

export const SECCIONES_SITIO = {
  homepage: { label: 'Homepage', descripcion: 'Banner principal y textos del home' },
  paratrike: { label: 'Paratrikes page', descripcion: 'Banner y textos generales de /paratrike' },
}

export const PARATRIKE_HREFS = {
  'vanguard-v8': '/paratrike/vanguard',
  'nomadic-trike': '/paratrike/nomadic',
  'disruptor-trike': '/paratrike/disruptor',
  vanguard: '/paratrike/vanguard',
  nomadic: '/paratrike/nomadic',
  disruptor: '/paratrike/disruptor',
}

/** Slug → public landing URL for paratrike cards and CTAs. */
export function resolveParatrikeHref(slug, fallbackHref) {
  const canonical = resolveProductSlug(slug)
  if (canonical && PARATRIKE_HREFS[canonical]) return PARATRIKE_HREFS[canonical]
  if (slug && PARATRIKE_HREFS[slug]) return PARATRIKE_HREFS[slug]
  if (fallbackHref && fallbackHref !== '#') return fallbackHref
  return null
}

export const PARAMOTOR_HREFS = {
  'disruptor-paramotor': '/paramotors/disruptor',
}

export function tipoLabel(seccion, tipo) {
  const tipos = TIPOS_CONTENIDO[seccion] || TIPOS_CONTENIDO.adventure
  return tipos.find((t) => t.value === tipo)?.label || tipo
}

export function grupoLabel(grupo) {
  return GRUPO_CONFIGURADOR[grupo]?.label || grupo
}
