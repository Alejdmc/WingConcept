'use client'

import { useState } from 'react'
import { TIPOS_CONTENIDO } from '@/lib/cmsLabels'
import ImageUploadField from '@/components/admin/ImageUploadField'

const CARD_TIPOS = new Set(['expedicion', 'show', 'evento', 'noticia'])

export function emptyContenidoForm(seccion, tipo = 'expedicion') {
  const tipos = TIPOS_CONTENIDO[seccion] || TIPOS_CONTENIDO.adventure
  return {
    seccion,
    tipo: tipo || tipos[0]?.value,
    titulo: '',
    descripcion: '',
    imagen: '',
    ubicacion: '',
    duracion: '',
    dificultad: '',
    participantes: '',
    fecha: '',
    hora: '',
    capacidad: '',
    precio: '',
    highlights: '',
    orden: 0,
    activo: true,
  }
}

export function contenidoToFormData(item) {
  return {
    seccion: item.seccion,
    tipo: item.tipo,
    titulo: item.titulo || '',
    descripcion: item.descripcion || '',
    imagen: item.imagen || '',
    ubicacion: item.ubicacion || '',
    duracion: item.duracion || '',
    dificultad: item.dificultad || '',
    participantes: item.participantes || '',
    fecha: item.fecha || '',
    hora: item.hora || '',
    capacidad: item.capacidad || '',
    precio: item.precio || '',
    highlights: (item.highlights || []).join('\n'),
    orden: item.orden || 0,
    activo: item.activo ?? true,
  }
}

export function buildContenidoPayload(form, seccion) {
  return {
    seccion: form.seccion || seccion,
    tipo: form.tipo,
    titulo: form.titulo,
    descripcion: form.descripcion || null,
    imagen: form.imagen || null,
    ubicacion: form.ubicacion || null,
    duracion: form.duracion || null,
    dificultad: form.dificultad || null,
    participantes: form.participantes ? Number(form.participantes) : null,
    fecha: form.fecha || null,
    hora: form.hora || null,
    capacidad: form.capacidad || null,
    precio: form.precio || null,
    highlights: form.highlights
      ? form.highlights.split('\n').map((h) => h.trim()).filter(Boolean)
      : null,
    orden: Number(form.orden) || 0,
    activo: form.activo,
  }
}

export default function ContenidoForm({ seccion, initial, onSave, onCancel, defaultTipo }) {
  const tipos = TIPOS_CONTENIDO[seccion] || TIPOS_CONTENIDO.adventure
  const [form, setForm] = useState(
    initial || emptyContenidoForm(seccion, defaultTipo || tipos[0]?.value),
  )
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSave(buildContenidoPayload(form, seccion))
    setSaving(false)
  }

  const isCard = CARD_TIPOS.has(form.tipo)
  const isExpedicion = form.tipo === 'expedicion'
  const isEvento = form.tipo === 'evento'
  const isNoticia = form.tipo === 'noticia'

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-borderline rounded-lg p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">What are you editing?</label>
          <select name="tipo" value={form.tipo} onChange={handleChange} className="w-full p-2 border rounded">
            {tipos.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <p className="text-xs text-ink2 mt-1">{tipos.find((t) => t.value === form.tipo)?.hint}</p>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Display order</label>
          <input name="orden" type="number" value={form.orden} onChange={handleChange} className="w-full p-2 border rounded" />
          <p className="text-xs text-ink2 mt-1">Lower numbers appear first. You can also reorder in the list below.</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Title *</label>
        <input name="titulo" value={form.titulo} onChange={handleChange} required className="w-full p-2 border rounded" />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Description</label>
        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} className="w-full p-2 border rounded" />
      </div>

      <ImageUploadField
        images={form.imagen ? [form.imagen] : []}
        onChange={(urls) => setForm({ ...form, imagen: urls[0] || '' })}
        label="Image"
        maxImages={1}
      />

      {isCard && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!isNoticia && (
              <div>
                <label className="block text-sm font-semibold mb-1">Location</label>
                <input name="ubicacion" value={form.ubicacion} onChange={handleChange} className="w-full p-2 border rounded" />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold mb-1">Date</label>
              <input name="fecha" value={form.fecha} onChange={handleChange} placeholder="August 2026" className="w-full p-2 border rounded" />
            </div>
            {isNoticia && (
              <>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold mb-1">Category badge</label>
                  <input name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="Product Launch, Paratrike, Shop..." className="w-full p-2 border rounded" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold mb-1">Link to section</label>
                  <input name="capacidad" value={form.capacidad} onChange={handleChange} placeholder="/paratrike/nomadic" className="w-full p-2 border rounded" />
                  <p className="text-xs text-ink2 mt-1">Card links here on the homepage and /news page.</p>
                </div>
              </>
            )}
          </div>

          {isExpedicion && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Duration</label>
                <input name="duracion" value={form.duracion} onChange={handleChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Difficulty</label>
                <input name="dificultad" value={form.dificultad} onChange={handleChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Participants (number)</label>
                <input name="participantes" type="number" value={form.participantes} onChange={handleChange} className="w-full p-2 border rounded" />
              </div>
            </div>
          )}

          {isEvento && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Time</label>
                <input name="hora" value={form.hora} onChange={handleChange} placeholder="8:00 AM - 5:00 PM" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Capacity</label>
                <input name="capacidad" value={form.capacidad} onChange={handleChange} placeholder="20 participants" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Price</label>
                <input name="precio" value={form.precio} onChange={handleChange} placeholder="$1,200" className="w-full p-2 border rounded" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-1">
              {isEvento ? 'Includes (one per line)' : isNoticia ? 'Key points (one per line)' : 'Highlights (one per line)'}
            </label>
            <textarea name="highlights" value={form.highlights} onChange={handleChange} rows={4} className="w-full p-2 border rounded" />
          </div>
        </>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} />
        Active (visible on the public website)
      </label>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="px-4 py-2 bg-brand text-white rounded font-semibold disabled:opacity-50">
          {saving ? 'Saving...' : 'Save'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-borderline rounded">Cancel</button>
        )}
      </div>
    </form>
  )
}
