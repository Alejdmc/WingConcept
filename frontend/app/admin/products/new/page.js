'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'

const CATEGORIAS = ['paramotor', 'vela', 'motor', 'accesorios', 'repuestos', 'paratrike']

const emptyVariante = () => ({
  nombre: 'Standard',
  precio: '',
  stock: 0,
  es_principal: true,
  activo: true,
})

export default function NewProductPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    descripcion_corta: '',
    categoria: 'paramotor',
    activo: true,
    destacado: false,
  })
  const [variante, setVariante] = useState(emptyVariante())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleVarianteChange = (e) => {
    const { name, value, type, checked } = e.target
    setVariante({ ...variante, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!variante.precio || Number(variante.precio) <= 0) {
      setError('Please enter a valid price for the variant.')
      setLoading(false)
      return
    }

    try {
      await api.admin.crearProducto({
        ...form,
        variantes: [{
          nombre: variante.nombre,
          precio: Number(variante.precio),
          stock: Number(variante.stock) || 0,
          es_principal: variante.es_principal,
          activo: variante.activo,
        }],
      })
      router.push('/admin/products')
    } catch (err) {
      setError(err.detail || 'Error creating product.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Link href="/admin/products" className="flex items-center gap-2 text-ink2 hover:text-brand mb-6 transition">
        <ArrowLeft className="w-4 h-4" />
        Back to products
      </Link>

      <h1 className="text-3xl font-black text-ink mb-2">New product</h1>
      <p className="text-ink2 mb-8">Create a product with its main variant and initial stock.</p>

      {error && <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white border border-borderline rounded-lg p-6 space-y-4">
          <h2 className="font-black text-ink">Product information</h2>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1">Name *</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required className="w-full p-3 border border-borderline rounded" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1">Category *</label>
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
          <h2 className="font-black text-ink">Main variant (price and stock)</h2>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1">Variant name</label>
            <input name="nombre" value={variante.nombre} onChange={handleVarianteChange} className="w-full p-3 border border-borderline rounded" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1">Price (USD) *</label>
              <input name="precio" type="number" min="0" step="0.01" value={variante.precio} onChange={handleVarianteChange} required className="w-full p-3 border border-borderline rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1">Initial stock</label>
              <input name="stock" type="number" min="0" value={variante.stock} onChange={handleVarianteChange} className="w-full p-3 border border-borderline rounded" />
            </div>
          </div>
        </div>

        <button disabled={loading} className="px-6 py-3 bg-brand text-white rounded font-bold hover:bg-brand/90 disabled:opacity-50">
          {loading ? 'Creating...' : 'Create product'}
        </button>
      </form>
    </div>
  )
}
