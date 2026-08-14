'use client'
import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { api } from '@/lib/api'
import ImageUploadField from '@/components/admin/ImageUploadField'
import { loadAdminCatalog, parseListPrice } from '@/lib/loadPartsCatalog'

const DEFAULT_STOCK = 10
const DEFAULT_STOCK_MINIMO = 2
const LOW_STOCK_THRESHOLD = 2

const CATEGORIES = [
  { value: 'repuestos', label: 'Parts (repuestos)' },
  { value: 'accesorios', label: 'Accessories (accesorios)' },
]

const MODELS = [
  { value: 'vanguard', label: 'Vanguard' },
  { value: 'nomadic', label: 'Nomadic' },
]

function emptyForm(categoria = 'repuestos') {
  return {
    id: null,
    varianteId: null,
    nombre: '',
    descripcion: '',
    descripcion_corta: '',
    categoria,
    imagenes: [],
    orden_display: 0,
    precio: '',
    stock: DEFAULT_STOCK,
    compatibleWith: ['vanguard', 'nomadic'],
    activo: true,
  }
}

function fromProduct(product) {
  const variante = product.variantes?.find((v) => v.es_principal) || product.variantes?.[0]
  const compatible = variante?.atributos?.compatible_with
  return {
    id: product.id,
    varianteId: variante?.id || null,
    nombre: product.nombre || '',
    descripcion: product.descripcion || '',
    descripcion_corta: product.descripcion_corta || '',
    categoria: product.categoria || 'repuestos',
    imagenes: product.imagenes || [],
    orden_display: product.orden_display ?? 0,
    precio: variante?.precio ?? '',
    stock: variante?.stock ?? DEFAULT_STOCK,
    compatibleWith: Array.isArray(compatible) ? compatible : ['vanguard', 'nomadic'],
    activo: product.activo ?? true,
  }
}

function adminRowToTableItem(row) {
  return {
    id: row.id,
    nombre: row.name,
    slug: row.slug,
    categoria: row.categoria,
    activo: row.activo,
    orden_display: row.orden_display ?? 0,
    variantes: [{
      es_principal: true,
      precio: parseListPrice(row),
      stock: row.stock ?? 0,
    }],
  }
}

function CatalogForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const toggleModel = (model) => {
    setForm((prev) => {
      const set = new Set(prev.compatibleWith || [])
      if (set.has(model)) set.delete(model)
      else set.add(model)
      return { ...prev, compatibleWith: [...set] }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    if (!form.nombre.trim()) {
      setError('Name is required.')
      setSaving(false)
      return
    }
    if (!form.precio || Number(form.precio) <= 0) {
      setError('Valid price is required.')
      setSaving(false)
      return
    }

    try {
      await onSave(form)
    } catch (err) {
      setError(err.detail || 'Error saving item.')
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
          <label className="block text-sm font-semibold mb-1">Category</label>
          <select name="categoria" value={form.categoria} onChange={handleChange} className="w-full p-2 border rounded">
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Price (USD) *</label>
          <input name="precio" type="number" min="0" step="0.01" value={form.precio} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Stock</label>
          <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Display order</label>
          <input name="orden_display" type="number" value={form.orden_display} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Short description</label>
        <input name="descripcion_corta" value={form.descripcion_corta} onChange={handleChange} className="w-full p-2 border rounded" />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Description</label>
        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={4} className="w-full p-2 border rounded" />
      </div>

      <ImageUploadField
        images={form.imagenes}
        onChange={(imagenes) => setForm({ ...form, imagenes })}
        productoId={form.id}
        label="Product images (shown in cart and /parts)"
      />

      <div>
        <p className="text-sm font-semibold mb-2">Compatible with</p>
        <div className="flex gap-4">
          {MODELS.map((m) => (
            <label key={m.value} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.compatibleWith?.includes(m.value)}
                onChange={() => toggleModel(m.value)}
              />
              {m.label}
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} />
        Active (visible on /parts and addable to cart)
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

export default function AdminPartsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [lowStockAlerts, setLowStockAlerts] = useState([])
  const [editLoading, setEditLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [partsRows, accRows] = await Promise.all([
        loadAdminCatalog('repuestos'),
        loadAdminCatalog('accesorios'),
      ])
      const combined = [...partsRows, ...accRows]
        .map(adminRowToTableItem)
        .sort((a, b) => (a.orden_display ?? 0) - (b.orden_display ?? 0))
      setItems(combined)
      try {
        const alertData = await api.admin.stockAlertas()
        setLowStockAlerts(alertData.items || [])
      } catch {
        setLowStockAlerts([])
      }
    } catch {
      setError('Could not load catalog items.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const saveItem = async (form) => {
    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion || null,
      descripcion_corta: form.descripcion_corta || null,
      categoria: form.categoria,
      imagenes: form.imagenes?.length ? form.imagenes : null,
      orden_display: Number(form.orden_display) || 0,
      activo: form.activo,
    }

    if (form.id) {
      await api.admin.actualizarProducto(form.id, payload)
      if (form.varianteId) {
        await api.admin.actualizarVariante(form.varianteId, {
          precio: Number(form.precio),
          stock: Number(form.stock) || 0,
          stock_minimo: DEFAULT_STOCK_MINIMO,
          atributos: { compatible_with: form.compatibleWith || [] },
        })
      }
    } else {
      await api.admin.crearProducto({
        ...payload,
        variantes: [{
          nombre: 'Standard',
          precio: Number(form.precio),
          stock: Number(form.stock) || DEFAULT_STOCK,
          stock_minimo: DEFAULT_STOCK_MINIMO,
          es_principal: true,
          activo: true,
          atributos: { compatible_with: form.compatibleWith || [] },
        }],
      })
    }

    setCreating(false)
    setEditing(null)
    load()
  }

  const openEdit = async (item) => {
    setCreating(false)
    setEditLoading(true)
    setError('')
    try {
      const full = await api.admin.obtenerProducto(item.id)
      setEditing(full)
    } catch {
      setError('Could not load item for editing.')
    } finally {
      setEditLoading(false)
    }
  }

  const handleToggle = async (item) => {
    try {
      await api.admin.actualizarProducto(item.id, { activo: !item.activo })
      load()
    } catch {
      setError('Error changing status.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this item? It will no longer appear on /parts or in cart.')) return
    try {
      await api.admin.eliminarProducto(id)
      load()
    } catch {
      setError('Error deactivating item.')
    }
  }

  const filtered = items.filter((item) => {
    if (filter === 'all') return true
    return item.categoria === filter
  })

  const activeCount = useMemo(() => items.filter((i) => i.activo).length, [items])
  const inactiveCount = useMemo(() => items.filter((i) => !i.activo).length, [items])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-ink">Parts &amp; Accessories</h1>
          <p className="text-ink2 mt-2">
            Same catalog as <code className="text-xs bg-bg2 px-1 py-0.5 rounded">/parts</code> — active items ({activeCount}) appear on the site. Inactive items are hidden from customers.
          </p>
        </div>
        <button
          onClick={() => { setCreating(true); setEditing(null) }}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded font-semibold hover:bg-brand/90 shrink-0"
        >
          <Plus className="w-4 h-4" />
          New item
        </button>
      </div>

      {error && <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>}

      {inactiveCount > 0 && (
        <div className="mb-6 p-4 rounded-lg border border-borderline bg-bg2 text-sm text-ink2">
          {inactiveCount} inactive item{inactiveCount !== 1 ? 's' : ''} (dimmed below — not shown on /parts).
        </div>
      )}

      {lowStockAlerts.length > 0 && (
        <div className="mb-6 p-4 rounded-lg border border-orange-300 bg-orange-50 text-sm">
          <p className="font-bold text-orange-900">
            {lowStockAlerts.length} item{lowStockAlerts.length !== 1 ? 's' : ''} with low stock (≤ {LOW_STOCK_THRESHOLD} units)
          </p>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {[
          { value: 'all', label: 'All' },
          { value: 'repuestos', label: 'Parts' },
          { value: 'accesorios', label: 'Accessories' },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded font-semibold text-sm border ${filter === tab.value ? 'bg-brand text-white border-brand' : 'border-borderline hover:border-brand'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {creating && (
        <div className="mb-8">
          <h2 className="font-black text-lg mb-4">New catalog item</h2>
          <CatalogForm initial={emptyForm(filter === 'accesorios' ? 'accesorios' : 'repuestos')} onSave={saveItem} onCancel={() => setCreating(false)} />
        </div>
      )}

      {editing && (
        <div className="mb-8">
          <h2 className="font-black text-lg mb-4">Edit: {editing.nombre}</h2>
          <CatalogForm initial={fromProduct(editing)} onSave={saveItem} onCancel={() => setEditing(null)} />
        </div>
      )}

      {editLoading && (
        <p className="text-sm text-ink2 mb-4">Loading item...</p>
      )}

      <div className="bg-white border border-borderline rounded-lg overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-bg2">
            <tr>
              <th className="text-left py-4 px-6 font-semibold">Name</th>
              <th className="text-left py-4 px-6 font-semibold">Slug</th>
              <th className="text-left py-4 px-6 font-semibold">Category</th>
              <th className="text-left py-4 px-6 font-semibold">Price</th>
              <th className="text-left py-4 px-6 font-semibold">Stock</th>
              <th className="text-left py-4 px-6 font-semibold">Order</th>
              <th className="text-left py-4 px-6 font-semibold">Status</th>
              <th className="text-left py-4 px-6 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="py-8 text-center text-ink2">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="8" className="py-8 text-center text-ink2">No items in this category. Run seed_parts_catalog.py in the backend container to populate the catalog.</td></tr>
            ) : (
              filtered.map((item) => {
                const variante = item.variantes?.find((v) => v.es_principal) || item.variantes?.[0]
                const stock = variante?.stock ?? 0
                const isLowStock = stock > 0 && stock <= LOW_STOCK_THRESHOLD
                return (
                  <tr key={item.id} className={`border-t border-borderline hover:bg-bg2 ${!item.activo ? 'opacity-60' : ''} ${isLowStock ? 'bg-orange-50/60' : ''}`}>
                    <td className="py-4 px-6 font-semibold">{item.nombre}</td>
                    <td className="py-4 px-6 text-xs text-ink2 font-mono">{item.slug || '—'}</td>
                    <td className="py-4 px-6 capitalize">{item.categoria}</td>
                    <td className="py-4 px-6">${variante?.precio?.toLocaleString() ?? '—'}</td>
                    <td className="py-4 px-6">
                      <span className={`font-bold ${isLowStock ? 'text-orange-700' : stock === 0 ? 'text-red-600' : 'text-ink'}`}>
                        {stock}
                      </span>
                      {isLowStock && <span className="ml-2 text-xs text-orange-700 font-semibold">LOW</span>}
                    </td>
                    <td className="py-4 px-6">{item.orden_display ?? 0}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${item.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {item.activo ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button title="Edit" onClick={() => openEdit(item)} className="p-2 border rounded hover:border-brand">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button title={item.activo ? 'Hide' : 'Activate'} onClick={() => handleToggle(item)} className="p-2 border rounded hover:border-brand">
                          {item.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button title="Deactivate" onClick={() => handleDelete(item.id)} className="p-2 border rounded hover:border-red-400 text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
