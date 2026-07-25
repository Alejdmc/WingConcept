'use client'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { api } from '@/lib/api'

function emptyForm() {
  return {
    nombre: '',
    descripcion: '',
    archivo_url: '',
    orden: 0,
    activo: true,
  }
}

function toFormData(item) {
  return {
    nombre: item.nombre || '',
    descripcion: item.descripcion || '',
    archivo_url: item.archivo_url || '',
    orden: item.orden || 0,
    activo: item.activo ?? true,
  }
}

function ManualForm({ initial, onSave, onCancel }) {
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
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      archivo_url: form.archivo_url || null,
      orden: Number(form.orden) || 0,
      activo: form.activo,
    }
    await onSave(payload)
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-borderline rounded-lg p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Name *</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Order</label>
          <input name="orden" type="number" value={form.orden} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Description</label>
        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={4} className="w-full p-2 border rounded" />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">File URL (PDF)</label>
        <input name="archivo_url" value={form.archivo_url} onChange={handleChange} placeholder="/manuals/... or https://..." className="w-full p-2 border rounded" />
      </div>

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

export default function AdminManualsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.admin.manuals({ por_pagina: 100 })
      setItems(data.items || [])
    } catch {
      setError('Could not load manuals.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (payload) => {
    try {
      await api.admin.crearManual(payload)
      setCreating(false)
      load()
    } catch (err) {
      setError(err.detail || 'Error creating manual.')
    }
  }

  const handleUpdate = async (payload) => {
    try {
      await api.admin.actualizarManual(editing.id, payload)
      setEditing(null)
      load()
    } catch (err) {
      setError(err.detail || 'Error updating manual.')
    }
  }

  const handleToggleActivo = async (item) => {
    try {
      await api.admin.actualizarManual(item.id, { activo: !item.activo })
      load()
    } catch {
      setError('Error changing status.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this manual?')) return
    try {
      await api.admin.eliminarManual(id, true)
      load()
    } catch {
      setError('Error deleting manual.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-ink">Manuals</h1>
          <p className="text-ink2 mt-2">Downloadable manuals shown on /manuals — create, view, edit and delete.</p>
        </div>
        <button
          onClick={() => { setCreating(true); setEditing(null) }}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded font-semibold hover:bg-brand/90"
        >
          <Plus className="w-4 h-4" />
          New Manual
        </button>
      </div>

      {error && <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>}

      {creating && (
        <div className="mb-8">
          <h2 className="font-black text-lg mb-4">New manual</h2>
          <ManualForm onSave={handleCreate} onCancel={() => setCreating(false)} />
        </div>
      )}

      {editing && (
        <div className="mb-8">
          <h2 className="font-black text-lg mb-4">Edit: {editing.nombre}</h2>
          <ManualForm initial={toFormData(editing)} onSave={handleUpdate} onCancel={() => setEditing(null)} />
        </div>
      )}

      <div className="bg-white border border-borderline rounded-lg overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-bg2">
            <tr>
              <th className="text-left py-4 px-6 font-semibold">Name</th>
              <th className="text-left py-4 px-6 font-semibold">File</th>
              <th className="text-left py-4 px-6 font-semibold">Order</th>
              <th className="text-left py-4 px-6 font-semibold">Status</th>
              <th className="text-left py-4 px-6 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="py-8 text-center text-ink2">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="5" className="py-8 text-center text-ink2">No manuals yet.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className={`border-t border-borderline hover:bg-bg2 ${!item.activo ? 'opacity-60' : ''}`}>
                  <td className="py-4 px-6 font-semibold">{item.nombre}</td>
                  <td className="py-4 px-6 text-ink2">{item.archivo_url ? 'Linked' : '—'}</td>
                  <td className="py-4 px-6">{item.orden}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {item.activo ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button title="Edit" onClick={() => { setEditing(item); setCreating(false) }} className="p-2 border rounded hover:border-brand">
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
