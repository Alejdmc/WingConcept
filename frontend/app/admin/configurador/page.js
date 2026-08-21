'use client'
import { useEffect, useState } from 'react'
import { Pencil, Eye, EyeOff, Plus, Save, X } from 'lucide-react'
import { api } from '@/lib/api'
import { PRODUCT_IDS } from '@/lib/products'
import { GRUPO_CONFIGURADOR, grupoLabel } from '@/lib/cmsLabels'
import ImageUploadField from '@/components/admin/ImageUploadField'

const PRODUCTOS = [
  { id: PRODUCT_IDS.vanguard, label: 'Vanguard V8.0' },
  { id: PRODUCT_IDS.nomadic, label: 'Nomadic Trike' },
  { id: PRODUCT_IDS.disruptorParamotor, label: 'Disruptor Paramotor' },
  { id: PRODUCT_IDS.disruptorTrike, label: 'Disruptor Trike' },
]

const GRUPOS = Object.keys(GRUPO_CONFIGURADOR)

function emptyForm(productoId) {
  return {
    producto_id: productoId,
    grupo: 'accessory',
    slug: '',
    nombre: '',
    descripcion: '',
    precio: 0,
    imagen: '',
    orden: 0,
    activo: true,
  }
}

export default function AdminConfiguradorPage() {
  const [productoId, setProductoId] = useState(PRODUCTOS[0].id)
  const [grupoFilter, setGrupoFilter] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(emptyForm(PRODUCTOS[0].id))
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.admin.configuradorOpciones({
        producto_id: productoId,
        grupo: grupoFilter || undefined,
        por_pagina: 200,
      })
      setItems(data.items || [])
    } catch {
      setError('Could not load customization options.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setEditing(null)
    setCreating(false)
    load()
  }, [productoId, grupoFilter])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        precio: Number(form.precio) || 0,
        orden: Number(form.orden) || 0,
        descripcion: form.descripcion || null,
        imagen: form.imagen || null,
      }
      if (editing) {
        await api.admin.actualizarConfiguradorOpcion(editing.id, payload)
        setMessage('Option updated.')
      } else {
        await api.admin.crearConfiguradorOpcion(payload)
        setMessage('Option created.')
      }
      setEditing(null)
      setCreating(false)
      load()
    } catch (err) {
      setError(err.detail || 'Error saving.')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (item) => {
    setEditing(item)
    setCreating(false)
    setForm({
      producto_id: item.producto_id,
      grupo: item.grupo,
      slug: item.slug,
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      precio: item.precio,
      imagen: item.imagen || '',
      orden: item.orden,
      activo: item.activo,
    })
  }

  const toggleActive = async (item) => {
    try {
      await api.admin.actualizarConfiguradorOpcion(item.id, { activo: !item.activo })
      load()
    } catch {
      setError('Could not change visibility.')
    }
  }

  const productoLabel = PRODUCTOS.find((p) => p.id === productoId)?.label

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink">Product customization</h1>
        <p className="text-ink2 mt-2">
          Edit engines, propellers, accessories and prices shown in the configurator and cart.
          Prices here must match what customers see on the website.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {PRODUCTOS.map((p) => (
          <button
            key={p.id}
            onClick={() => setProductoId(p.id)}
            className={`px-4 py-2 rounded font-semibold text-sm ${
              productoId === p.id ? 'bg-brand text-white' : 'bg-white border border-borderline'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setGrupoFilter('')}
          className={`px-3 py-1.5 rounded text-sm ${!grupoFilter ? 'bg-ink text-white' : 'border'}`}
        >
          All
        </button>
        {GRUPOS.map((g) => (
          <button
            key={g}
            onClick={() => setGrupoFilter(g)}
            className={`px-3 py-1.5 rounded text-sm ${grupoFilter === g ? 'bg-ink text-white' : 'border'}`}
            title={GRUPO_CONFIGURADOR[g]?.hint}
          >
            {grupoLabel(g)}
          </button>
        ))}
        <button
          onClick={() => { setCreating(true); setEditing(null); setForm(emptyForm(productoId)) }}
          className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-brand text-white rounded text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Add option
        </button>
      </div>

      {message && <div className="mb-4 p-4 rounded bg-green-100 text-green-700">{message}</div>}
      {error && <div className="mb-4 p-4 rounded bg-red-100 text-red-700">{error}</div>}

      {(creating || editing) && (
        <form onSubmit={handleSave} className="mb-8 bg-white border rounded-lg p-6 space-y-4">
          <h2 className="font-black text-lg">{editing ? `Edit: ${editing.nombre}` : `New option — ${productoLabel}`}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Category</label>
              <select
                value={form.grupo}
                onChange={(e) => setForm({ ...form, grupo: e.target.value })}
                disabled={!!editing}
                className="w-full p-2 border rounded"
              >
                {GRUPOS.map((g) => (
                  <option key={g} value={g}>{grupoLabel(g)}</option>
                ))}
              </select>
              <p className="text-xs text-ink2 mt-1">{GRUPO_CONFIGURADOR[form.grupo]?.hint}</p>
            </div>
            {!editing && (
              <div>
                <label className="block text-sm font-semibold mb-1">Internal ID (slug)</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="w-full p-2 border rounded" placeholder="e.g. cruise-control" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Name shown to customer *</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Description</label>
            <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={2} className="w-full p-2 border rounded" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Price (USD)</label>
              <input type="number" step="0.01" min="0" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Display order</label>
              <input type="number" value={form.orden} onChange={(e) => setForm({ ...form, orden: e.target.value })} className="w-full p-2 border rounded" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
                Visible on site
              </label>
            </div>
          </div>
          <ImageUploadField
            images={form.imagen ? [form.imagen] : []}
            onChange={(urls) => setForm({ ...form, imagen: urls[0] || '' })}
            productoId={productoId}
            label="Image"
            maxImages={1}
          />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded font-semibold">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={() => { setEditing(null); setCreating(false) }} className="px-4 py-2 border rounded">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-bg2">
            <tr>
              <th className="text-left py-3 px-4 font-semibold">Category</th>
              <th className="text-left py-3 px-4 font-semibold">Name</th>
              <th className="text-left py-3 px-4 font-semibold">Price</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
              <th className="text-left py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="py-8 text-center text-ink2">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="5" className="py-8 text-center text-ink2">No options found.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className={`border-t ${!item.activo ? 'opacity-50' : ''}`}>
                  <td className="py-3 px-4">{grupoLabel(item.grupo)}</td>
                  <td className="py-3 px-4 font-semibold">{item.nombre}</td>
                  <td className="py-3 px-4">${Number(item.precio).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                      {item.activo ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(item)} className="p-1.5 border rounded hover:border-brand"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => toggleActive(item)} className="p-1.5 border rounded hover:border-brand">
                        {item.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
