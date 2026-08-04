/** Etiquetas amigables para el panel admin (sin jerga técnica). */

export const SECCIONES_CONTENIDO = [
  { id: 'adventure', label: 'Adventure', descripcion: 'Expediciones y aventuras en la página Adventure' },
  { id: 'shows', label: 'Shows', descripcion: 'Demostraciones y eventos en vivo' },
  { id: 'events', label: 'Events', descripcion: 'Eventos y talleres' },
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
}

export const GRUPO_CONFIGURADOR = {
  engine: { label: 'Motor', hint: 'Opciones de motor y su precio' },
  chassis_type: { label: 'Tipo de chasis', hint: 'Commercial, Adventure, Reportage (Vanguard)' },
  finish: { label: 'Acabado', hint: 'Acabado del chasis (Nomadic)' },
  propeller: { label: 'Hélice', hint: 'Opciones de hélice y precio' },
  accessory: { label: 'Accesorio', hint: 'Extras que se pueden agregar al carrito' },
  color: { label: 'Color', hint: 'Colores disponibles (sin costo extra)' },
}

export const SECCIONES_SITIO = {
  homepage: { label: 'Página de inicio', descripcion: 'Banner principal y textos del home' },
  paratrike: { label: 'Página Paratrikes', descripcion: 'Banner, textos generales y sección comparación de /paratrike' },
}

export const PARATRIKE_HREFS = {
  'vanguard-v8': '/paratrike/vanguard',
  'nomadic-trike': '/paratrike/nomadic',
}

export function tipoLabel(seccion, tipo) {
  const tipos = TIPOS_CONTENIDO[seccion] || TIPOS_CONTENIDO.adventure
  return tipos.find((t) => t.value === tipo)?.label || tipo
}

export function grupoLabel(grupo) {
  return GRUPO_CONFIGURADOR[grupo]?.label || grupo
}
