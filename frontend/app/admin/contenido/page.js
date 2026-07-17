'use client'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { api } from '@/lib/api'

const SECCIONES = [
  { id: 'adventure', label: 'Adventure' },
  { id: 'shows', label: 'Shows' },
  { id: 'events', label: 'Events' },
]

const TIPOS_POR_SECCION = {
  adventure: [
    { value: 'hero', label: 'Hero' },
    { value: 'intro', label: 'Intro' },
    { value: 'expedicion', label: 'Expedition' },
  ],
  shows: [
    { value: 'hero', label: 'Hero' },
    { value: 'intro', label: 'Intro' },
    { value: 'show', label: 'Show' },
  ],
  events: [
    { value: 'hero', label: 'Hero' },
    { value: 'intro', label: 'Intro' },
    { value: 'evento', label: 'Event' },
  ],
}

const CARD_TIPOS = new Set(['expedicion', 'show', 'evento'])

function emptyForm(seccion, tipo = 'expedicion') {
  return {
    seccion,
    tipo,
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

function toFormData(item) {
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

function ContenidoForm({ seccion, initial, onSave, onCancel }) {
  const tipos = TIPOS_POR_SECCION[seccion] || TIPOS_POR_SECCION.adventure
  const [form, setForm] = useState(initial || emptyForm(seccion, tipos[0]?.value))
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
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
    await onSave(payload)
    setSaving(false)
  }

  const isCard = CARD_TIPOS.has(form.tipo)
  const isExpedicion = form.tipo === 'expedicion'
  const isShow = form.tipo === 'show'
  const isEvento = form.tipo === 'evento'

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-borderline rounded-lg p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Type</label>
          <select name="tipo" value={form.tipo} onChange={handleChange} className="w-full p-2 border rounded">
            {tipos.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Order</label>
          <input name="orden" type="number" value={form.orden} onChange={handleChange} className="w-full p-2 border rounded" />
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

      <div>
        <label className="block text-sm font-semibold mb-1">Image (URL or path)</label>
        <input name="imagen" value={form.imagen} onChange={handleChange} placeholder="/images/..." className="w-full p-2 border rounded" />
      </div>

      {isCard && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Location</label>
              <input name="ubicacion" value={form.ubicacion} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Date</label>
              <input name="fecha" value={form.fecha} onChange={handleChange} placeholder="March 15-17, 2025" className="w-full p-2 border rounded" />
            </div>
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

          {isExpedicion && (
            <div>
              <label className="block text-sm font-semibold mb-1">Participants (number)</label>
              <input name="participantes" type="number" value={form.participantes} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-1">
              {isEvento ? 'Includes (one per line)' : 'Highlights (one per line)'}
            </label>
            <textarea name="highlights" value={form.highlights} onChange={handleChange} rows={4} className="w-full p-2 border rounded" />
          </div>
        </>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} />
        Active (visible on site)
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

export default function AdminContenidoPage() {
  const [seccion, setSeccion] = useState('adventure')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [creating, setCreating] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.admin.contenidos({ seccion, por_pagina: 100 })
      setItems(data.items || [])
    } catch {
      setError('Could not load content.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setEditing(null)
    setViewing(null)
    setCreating(false)
    load()
  }, [seccion])

  const handleCreate = async (payload) => {
    try {
      await api.admin.crearContenido(payload)
      setCreating(false)
      load()
    } catch (err) {
      setError(err.detail || 'Error creating content.')
    }
  }

  const handleUpdate = async (payload) => {
    try {
      await api.admin.actualizarContenido(editing.id, payload)
      setEditing(null)
      load()
    } catch (err) {
      setError(err.detail || 'Error updating content.')
    }
  }

  const handleToggleActivo = async (item) => {
    try {
      await api.admin.actualizarContenido(item.id, { activo: !item.activo })
      load()
    } catch {
      setError('Error changing status.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this content?')) return
    try {
      await api.admin.eliminarContenido(id, true)
      load()
    } catch {
      setError('Error deleting content.')
    }
  }

  const tipoLabel = (tipo) => {
    const all = [...TIPOS_POR_SECCION.adventure, ...TIPOS_POR_SECCION.shows, ...TIPOS_POR_SECCION.events]
    return [...new Map(all.map((t) => [t.value, t.label])).entries()].find(([v]) => v === tipo)?.[1] || tipo
  }

  const seccionLabel = SECCIONES.find((s) => s.id === seccion)?.label

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-ink">Content Management</h1>
          <p className="text-ink2 mt-2">Adventure, Shows and Events — create, view, edit and delete.</p>
        </div>
        <button
          onClick={() => { setCreating(true); setEditing(null); setViewing(null) }}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded font-semibold hover:bg-brand/90"
        >
          <Plus className="w-4 h-4" />
          New in {seccionLabel}
        </button>
      </div>

      <div className="flex gap-2 mb-8">
        {SECCIONES.map((s) => (
          <button
            key={s.id}
            onClick={() => setSeccion(s.id)}
            className={`px-4 py-2 rounded font-semibold text-sm transition ${
              seccion === s.id ? 'bg-brand text-white' : 'bg-white border border-borderline text-ink hover:border-brand'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {error && <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>}

      {creating && (
        <div className="mb-8">
          <h2 className="font-black text-lg mb-4">New content — {seccionLabel}</h2>
          <ContenidoForm seccion={seccion} onSave={handleCreate} onCancel={() => setCreating(false)} />
        </div>
      )}

      {editing && (
        <div className="mb-8">
          <h2 className="font-black text-lg mb-4">Edit: {editing.titulo}</h2>
          <ContenidoForm seccion={seccion} initial={toFormData(editing)} onSave={handleUpdate} onCancel={() => setEditing(null)} />
        </div>
      )}

      {viewing && (
        <div className="mb-8 bg-white border border-borderline rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-black text-lg">{viewing.titulo}</h2>
            <button onClick={() => setViewing(null)} className="text-ink2 hover:text-ink">✕</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <p><span className="font-semibold">Type:</span> {tipoLabel(viewing.tipo)}</p>
            <p><span className="font-semibold">Status:</span> {viewing.activo ? 'Active' : 'Inactive'}</p>
            <p className="col-span-2"><span className="font-semibold">Description:</span> {viewing.descripcion || '—'}</p>
            {viewing.imagen && <p className="col-span-2"><span className="font-semibold">Image:</span> {viewing.imagen}</p>}
            {viewing.ubicacion && <p><span className="font-semibold">Location:</span> {viewing.ubicacion}</p>}
            {viewing.fecha && <p><span className="font-semibold">Date:</span> {viewing.fecha}</p>}
            {viewing.highlights?.length > 0 && (
              <ul className="col-span-2 list-disc pl-5">
                {viewing.highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border border-borderline rounded-lg overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-bg2">
            <tr>
              <th className="text-left py-4 px-6 font-semibold">Type</th>
              <th className="text-left py-4 px-6 font-semibold">Title</th>
              <th className="text-left py-4 px-6 font-semibold">Order</th>
              <th className="text-left py-4 px-6 font-semibold">Status</th>
              <th className="text-left py-4 px-6 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="py-8 text-center text-ink2">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="5" className="py-8 text-center text-ink2">No content in {seccionLabel}.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className={`border-t border-borderline hover:bg-bg2 ${!item.activo ? 'opacity-60' : ''}`}>
                  <td className="py-4 px-6 text-ink2">{tipoLabel(item.tipo)}</td>
                  <td className="py-4 px-6 font-semibold">{item.titulo}</td>
                  <td className="py-4 px-6">{item.orden}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {item.activo ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button title="View" onClick={() => { setViewing(item); setEditing(null); setCreating(false) }} className="p-2 border rounded hover:border-brand">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button title="Edit" onClick={() => { setEditing(item); setViewing(null); setCreating(false) }} className="p-2 border rounded hover:border-brand">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button title={item.activo ? 'Hide' : 'Activate'} onClick={() => handleToggleActivo(item)} className="p-2 border rounded hover:border-brand">
                        {item.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button title="Delete" onClick={() => handleDelete(item.id)} className="p-2 border rounded hover:border-red-400 text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
