'use client'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'

const TIPOS = [
  { value: 'hero', label: 'Hero (título principal)' },
  { value: 'intro', label: 'Intro (texto descriptivo)' },
  { value: 'expedicion', label: 'Expedición' },
]

const emptyForm = () => ({
  tipo: 'expedicion',
  titulo: '',
  descripcion: '',
  imagen: '',
  ubicacion: '',
  duracion: '',
  dificultad: '',
  participantes: '',
  highlights: '',
  orden: 0,
  activo: true,
})

function ContenidoForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || emptyForm())
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      seccion: 'adventure',
      tipo: form.tipo,
      titulo: form.titulo,
      descripcion: form.descripcion || null,
      imagen: form.imagen || null,
      ubicacion: form.ubicacion || null,
      duracion: form.duracion || null,
      dificultad: form.dificultad || null,
      participantes: form.participantes ? Number(form.participantes) : null,
      highlights: form.highlights
        ? form.highlights.split('\n').map((h) => h.trim()).filter(Boolean)
        : null,
      orden: Number(form.orden) || 0,
      activo: form.activo,
    }
    await onSave(payload)
    setSaving(false)
  }

  const isExpedicion = form.tipo === 'expedicion'

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-borderline rounded-lg p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Tipo</label>
          <select name="tipo" value={form.tipo} onChange={handleChange} className="w-full p-2 border rounded">
            {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Orden</label>
          <input name="orden" type="number" value={form.orden} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Título *</label>
        <input name="titulo" value={form.titulo} onChange={handleChange} required className="w-full p-2 border rounded" />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Descripción</label>
        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} className="w-full p-2 border rounded" />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Imagen (URL o ruta)</label>
        <input name="imagen" value={form.imagen} onChange={handleChange} placeholder="/images/front1.jpg" className="w-full p-2 border rounded" />
      </div>

      {isExpedicion && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Ubicación</label>
              <input name="ubicacion" value={form.ubicacion} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Duración</label>
              <input name="duracion" value={form.duracion} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Dificultad</label>
              <input name="dificultad" value={form.dificultad} onChange={handleChange} placeholder="Beginner, Advanced..." className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Participantes</label>
              <input name="participantes" type="number" value={form.participantes} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Highlights (uno por línea)</label>
            <textarea name="highlights" value={form.highlights} onChange={handleChange} rows={4} className="w-full p-2 border rounded" />
          </div>
        </>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} />
        Activo
      </label>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="px-4 py-2 bg-brand text-white rounded font-semibold disabled:opacity-50">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-borderline rounded">
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

function toFormData(item) {
  return {
    tipo: item.tipo,
    titulo: item.titulo || '',
    descripcion: item.descripcion || '',
    imagen: item.imagen || '',
    ubicacion: item.ubicacion || '',
    duracion: item.duracion || '',
    dificultad: item.dificultad || '',
    participantes: item.participantes || '',
    highlights: (item.highlights || []).join('\n'),
    orden: item.orden || 0,
    activo: item.activo ?? true,
  }
}

export default function AdminAdventurePage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.admin.contenidos({ seccion: 'adventure', por_pagina: 100 })
      setItems(data.items || [])
    } catch {
      setError('No se pudo cargar el contenido de Adventure.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (payload) => {
    try {
      await api.admin.crearContenido(payload)
      setCreating(false)
      load()
    } catch (err) {
      setError(err.detail || 'Error al crear.')
    }
  }

  const handleUpdate = async (payload) => {
    try {
      await api.admin.actualizarContenido(editing.id, payload)
      setEditing(null)
      load()
    } catch (err) {
      setError(err.detail || 'Error al actualizar.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar este contenido?')) return
    try {
      await api.admin.eliminarContenido(id)
      load()
    } catch {
      setError('Error al desactivar.')
    }
  }

  const tipoLabel = (tipo) => TIPOS.find((t) => t.value === tipo)?.label || tipo

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-ink">Adventure CMS</h1>
          <p className="text-ink2 mt-2">Edita el hero, intro y expediciones de la sección Adventure.</p>
        </div>
        <button
          onClick={() => { setCreating(true); setEditing(null) }}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded font-semibold hover:bg-brand/90"
        >
          <Plus className="w-4 h-4" />
          Nuevo contenido
        </button>
      </div>

      {error && <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>}

      {creating && (
        <div className="mb-8">
          <h2 className="font-black text-lg mb-4">Nuevo contenido</h2>
          <ContenidoForm onSave={handleCreate} onCancel={() => setCreating(false)} />
        </div>
      )}

      {editing && (
        <div className="mb-8">
          <h2 className="font-black text-lg mb-4">Editar: {editing.titulo}</h2>
          <ContenidoForm initial={toFormData(editing)} onSave={handleUpdate} onCancel={() => setEditing(null)} />
        </div>
      )}

      <div className="bg-white border border-borderline rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg2">
            <tr>
              <th className="text-left py-4 px-6 font-semibold">Tipo</th>
              <th className="text-left py-4 px-6 font-semibold">Título</th>
              <th className="text-left py-4 px-6 font-semibold">Orden</th>
              <th className="text-left py-4 px-6 font-semibold">Estado</th>
              <th className="text-left py-4 px-6 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="py-8 text-center text-ink2">Cargando...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="5" className="py-8 text-center text-ink2">Sin contenido.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t border-borderline hover:bg-bg2">
                  <td className="py-4 px-6 text-ink2">{tipoLabel(item.tipo)}</td>
                  <td className="py-4 px-6 font-semibold">{item.titulo}</td>
                  <td className="py-4 px-6">{item.orden}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {item.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(item); setCreating(false) }} className="p-2 border rounded hover:border-brand">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 border rounded hover:border-red-400 text-red-500">
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
