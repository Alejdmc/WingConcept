'use client'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload } from 'lucide-react'
import { api } from '@/lib/api'

const PAGE_FALLBACK = {
  hero: {
    titulo: 'Download Manuals',
    descripcion: 'Owner and Maintenance Manuals',
    imagen: '/images/front1.jpg',
  },
  intro: {
    descripcion: 'Download owner and maintenance manuals for Wing Concept equipment.',
  },
}

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

function toPageForm(item, tipo) {
  return {
    id: item?.id || null,
    tipo,
    titulo: item?.titulo || (tipo === 'hero' ? PAGE_FALLBACK.hero.titulo : 'Manuals Intro'),
    descripcion: item?.descripcion || (tipo === 'hero' ? PAGE_FALLBACK.hero.descripcion : PAGE_FALLBACK.intro.descripcion),
    imagen: item?.imagen || (tipo === 'hero' ? PAGE_FALLBACK.hero.imagen : ''),
    orden: item?.orden ?? (tipo === 'hero' ? 0 : 1),
    activo: item?.activo ?? true,
  }
}

function ManualForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || emptyForm())
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const result = await api.admin.uploadManual(file)
      setForm((prev) => ({ ...prev, archivo_url: result.url }))
    } catch (err) {
      setError(err.detail || 'Error uploading PDF.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      archivo_url: form.archivo_url || null,
      orden: Number(form.orden) || 0,
      activo: form.activo,
    }
    try {
      await onSave(payload)
    } catch (err) {
      setError(err.detail || 'Error saving manual.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-borderline rounded-lg p-6 space-y-4">
      {error && <div className="p-3 rounded bg-red-100 text-red-700 text-sm">{error}</div>}

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
        <label className="block text-sm font-semibold mb-1">PDF file</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            name="archivo_url"
            value={form.archivo_url}
            onChange={handleChange}
            placeholder="Filled automatically after upload"
            className="flex-1 p-2 border rounded bg-bg2"
            readOnly
          />
          <label className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-borderline rounded cursor-pointer hover:border-brand shrink-0">
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload PDF'}
            <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} />
        Active (visible on site)
      </label>

      <div className="flex gap-3">
        <button type="submit" disabled={saving || uploading} className="px-4 py-2 bg-brand text-white rounded font-semibold disabled:opacity-50">
          {saving ? 'Saving...' : 'Save'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-borderline rounded">Cancel</button>
        )}
      </div>
    </form>
  )
}

function PageBlockForm({ label, initial, onSave }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-borderline rounded-lg p-6 space-y-4">
      <h3 className="font-black text-lg">{label}</h3>
      <div>
        <label className="block text-sm font-semibold mb-1">Title</label>
        <input name="titulo" value={form.titulo} onChange={handleChange} required className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Description</label>
        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} className="w-full p-2 border rounded" />
      </div>
      {form.tipo === 'hero' && (
        <div>
          <label className="block text-sm font-semibold mb-1">Hero image (URL or path)</label>
          <input name="imagen" value={form.imagen} onChange={handleChange} placeholder="/images/front1.jpg" className="w-full p-2 border rounded" />
        </div>
      )}
      <button type="submit" disabled={saving} className="px-4 py-2 bg-brand text-white rounded font-semibold disabled:opacity-50">
        {saving ? 'Saving...' : 'Save page content'}
      </button>
    </form>
  )
}

export default function AdminManualsPage() {
  const [items, setItems] = useState([])
  const [pageContent, setPageContent] = useState({ hero: null, intro: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [creating, setCreating] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [manualsData, contenidoData] = await Promise.all([
        api.admin.manuals({ por_pagina: 100 }),
        api.admin.contenidos({ seccion: 'manuals', por_pagina: 20 }),
      ])
      setItems(manualsData.items || [])
      const blocks = contenidoData.items || []
      setPageContent({
        hero: blocks.find((b) => b.tipo === 'hero') || null,
        intro: blocks.find((b) => b.tipo === 'intro') || null,
      })
    } catch {
      setError('Could not load manuals.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const savePageBlock = async (form) => {
    try {
      const payload = {
        seccion: 'manuals',
        tipo: form.tipo,
        titulo: form.titulo,
        descripcion: form.descripcion || null,
        imagen: form.imagen || null,
        orden: Number(form.orden) || 0,
        activo: form.activo,
      }
      if (form.id) {
        await api.admin.actualizarContenido(form.id, payload)
      } else {
        await api.admin.crearContenido(payload)
      }
      load()
    } catch (err) {
      setError(err.detail || 'Error saving page content.')
    }
  }

  const handleCreate = async (payload) => {
    await api.admin.crearManual(payload)
    setCreating(false)
    load()
  }

  const handleUpdate = async (payload) => {
    await api.admin.actualizarManual(editing.id, payload)
    setEditing(null)
    load()
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
          <p className="text-ink2 mt-2">Page content and downloadable manuals shown on /manuals — create, view, edit and delete.</p>
        </div>
        <button
          onClick={() => { setCreating(true); setEditing(null); setViewing(null) }}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded font-semibold hover:bg-brand/90"
        >
          <Plus className="w-4 h-4" />
          New Manual
        </button>
      </div>

      {error && <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <PageBlockForm
          label="Page hero"
          initial={toPageForm(pageContent.hero, 'hero')}
          onSave={savePageBlock}
        />
        <PageBlockForm
          label="Page intro"
          initial={toPageForm(pageContent.intro, 'intro')}
          onSave={savePageBlock}
        />
      </div>

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

      {viewing && (
        <div className="mb-8 bg-white border border-borderline rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-black text-lg">{viewing.nombre}</h2>
            <button onClick={() => setViewing(null)} className="text-ink2 hover:text-ink">✕</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <p><span className="font-semibold">Status:</span> {viewing.activo ? 'Active' : 'Inactive'}</p>
            <p><span className="font-semibold">Order:</span> {viewing.orden}</p>
            <p className="col-span-2"><span className="font-semibold">Description:</span> {viewing.descripcion || '—'}</p>
            <p className="col-span-2"><span className="font-semibold">File:</span> {viewing.archivo_url || '—'}</p>
          </div>
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
