'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import ImageUploadField from '@/components/admin/ImageUploadField'

const CATEGORIAS = ['paramotor', 'vela', 'motor', 'accesorios', 'repuestos', 'paratrike']

export default function EditProductPage({ params }) {
  const { id } = params
  const router = useRouter()
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    descripcion_corta: '',
    categoria: 'paramotor',
    activo: true,
    destacado: false,
    imagenes: [],
    contenido_extra: null,
  })
  const [pageContent, setPageContent] = useState({
    tagline: '',
    philosophy: '',
    galleryText: '',
    featuresJson: '[]',
  })
  const [variantes, setVariantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [newVariante, setNewVariante] = useState({ nombre: '', precio: '', stock: 0 })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await api.admin.obtenerProducto(id)
        setForm({
          nombre: data.nombre || '',
          descripcion: data.descripcion || '',
          descripcion_corta: data.descripcion_corta || '',
          categoria: data.categoria || 'paramotor',
          activo: data.activo ?? true,
          destacado: data.destacado ?? false,
          imagenes: data.imagenes || [],
          contenido_extra: data.contenido_extra || null,
        })
        const extra = data.contenido_extra || {}
        setPageContent({
          tagline: extra.tagline || '',
          philosophy: extra.philosophy || '',
          galleryText: (extra.gallery || []).join('\n'),
          featuresJson: JSON.stringify(extra.features || [], null, 2),
        })
        setVariantes(data.variantes || [])
      } catch {
        setError('Could not load product.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      let features = []
      try {
        features = JSON.parse(pageContent.featuresJson || '[]')
      } catch {
        setError('Features must be valid JSON (array of {title, desc, icon}).')
        setSaving(false)
        return
      }
      const contenido_extra = {
        ...(form.contenido_extra || {}),
        tagline: pageContent.tagline || null,
        philosophy: pageContent.philosophy || null,
        gallery: pageContent.galleryText.split('\n').map((s) => s.trim()).filter(Boolean),
        features,
      }
      await api.admin.actualizarProducto(id, { ...form, contenido_extra })
      router.push('/admin/products')
    } catch (err) {
      setError(err.detail || 'Error saving product.')
    } finally {
      setSaving(false)
    }
  }

  const updateVarianteStock = async (varianteId, stock) => {
    try {
      const updated = await api.admin.actualizarStock(varianteId, { stock: Number(stock) })
      setVariantes((prev) => prev.map((v) => (v.id === varianteId ? updated : v)))
    } catch {
      setError('Error updating stock.')
    }
  }

  const addVariante = async () => {
    if (!newVariante.nombre || !newVariante.precio) {
      setError('Name and price are required for the new variant.')
      return
    }
    try {
      const created = await api.admin.crearVariante(id, {
        nombre: newVariante.nombre,
        precio: Number(newVariante.precio),
        stock: Number(newVariante.stock) || 0,
        activo: true,
      })
      setVariantes((prev) => [...prev, created])
      setNewVariante({ nombre: '', precio: '', stock: 0 })
      setError('')
    } catch (err) {
      setError(err.detail || 'Error creating variant.')
    }
  }

  const deactivateProduct = async () => {
    if (!confirm('Deactivate this product?')) return
    try {
      await api.admin.eliminarProducto(id)
      router.push('/admin/products')
    } catch {
      setError('Error deactivating product.')
    }
  }

  if (loading) {
    return <p className="text-ink2">Loading product...</p>
  }

  return (
    <div>
      <Link href="/admin/products" className="flex items-center gap-2 text-ink2 hover:text-brand mb-6 transition">
        <ArrowLeft className="w-4 h-4" />
        Back to products
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-ink">Edit product</h1>
          <p className="text-ink2 mt-2">Update details and manage variants/stock.</p>
        </div>
        <button onClick={deactivateProduct} className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition">
          <Trash2 className="w-4 h-4" />
          Deactivate
        </button>
      </div>

      {error && <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white border border-borderline rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">Name</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required className="w-full p-3 border border-borderline rounded" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">Category</label>
            <select name="categoria" value={form.categoria} onChange={handleChange} className="w-full p-3 border border-borderline rounded">
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">Short description</label>
            <input name="descripcion_corta" value={form.descripcion_corta} onChange={handleChange} className="w-full p-3 border border-borderline rounded" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">Description</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={4} className="w-full p-3 border border-borderline rounded" />
          </div>

          <ImageUploadField
            images={form.imagenes}
            onChange={(imagenes) => setForm({ ...form, imagenes })}
            productoId={id}
            label="Product images"
          />

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="destacado" checked={form.destacado} onChange={handleChange} />
              Featured
            </label>
          </div>
        </div>

        <div className="bg-white border border-borderline rounded-lg p-6 space-y-4">
          <h2 className="font-black text-ink">Product page content</h2>
          <p className="text-sm text-ink2">Texts and gallery shown on the public product page (e.g. Vanguard, Nomadic). For listing cards and prices, use <Link href="/admin/paratrikes" className="text-brand hover:underline">Paratrikes page</Link> and <Link href="/admin/configurador" className="text-brand hover:underline">Customization</Link>.</p>
          <div>
            <label className="block text-sm font-semibold mb-1">Tagline (subtitle under product name)</label>
            <input value={pageContent.tagline} onChange={(e) => setPageContent({ ...pageContent, tagline: e.target.value })} className="w-full p-3 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Philosophy line</label>
            <input value={pageContent.philosophy} onChange={(e) => setPageContent({ ...pageContent, philosophy: e.target.value })} className="w-full p-3 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Gallery images (one URL per line)</label>
            <textarea value={pageContent.galleryText} onChange={(e) => setPageContent({ ...pageContent, galleryText: e.target.value })} rows={4} className="w-full p-3 border rounded font-mono text-sm" placeholder="/images/vanguard/1.png" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Features (JSON array: title, desc, icon)</label>
            <textarea value={pageContent.featuresJson} onChange={(e) => setPageContent({ ...pageContent, featuresJson: e.target.value })} rows={8} className="w-full p-3 border rounded font-mono text-xs" />
          </div>
        </div>

        <div className="bg-white border border-borderline rounded-lg p-6 space-y-4">
          <h2 className="font-black text-ink">Variants and stock</h2>
          {variantes.map((v) => (
            <div key={v.id} className="flex items-center gap-4 p-4 border border-borderline rounded">
              <div className="flex-1">
                <p className="font-semibold">{v.nombre}</p>
                <p className="text-sm text-ink2">${v.precio?.toLocaleString()} USD</p>
              </div>
              <input
                type="number"
                min="0"
                defaultValue={v.stock}
                onBlur={(e) => {
                  const val = Number(e.target.value)
                  if (val !== v.stock) updateVarianteStock(v.id, val)
                }}
                className="w-24 px-3 py-2 border border-borderline rounded text-center"
              />
            </div>
          ))}

          <div className="pt-4 border-t border-borderline space-y-3">
            <p className="text-sm font-semibold text-ink">Add variant</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                placeholder="Name"
                value={newVariante.nombre}
                onChange={(e) => setNewVariante({ ...newVariante, nombre: e.target.value })}
                className="p-2 border border-borderline rounded"
              />
              <input
                placeholder="Price USD"
                type="number"
                value={newVariante.precio}
                onChange={(e) => setNewVariante({ ...newVariante, precio: e.target.value })}
                className="p-2 border border-borderline rounded"
              />
              <input
                placeholder="Stock"
                type="number"
                value={newVariante.stock}
                onChange={(e) => setNewVariante({ ...newVariante, stock: e.target.value })}
                className="p-2 border border-borderline rounded"
              />
            </div>
            <button type="button" onClick={addVariante} className="flex items-center gap-2 px-4 py-2 border border-borderline rounded hover:border-brand transition">
              <Plus className="w-4 h-4" />
              Add variant
            </button>
          </div>
        </div>

        <button disabled={saving} className="px-6 py-3 bg-brand text-white rounded font-bold hover:bg-brand/90 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
