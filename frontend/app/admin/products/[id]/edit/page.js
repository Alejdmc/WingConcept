'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function EditProductPage({ params }) {
  const { id } = params
  const router = useRouter()
  const [form, setForm] = useState({ name: '', price: '', description: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await api.admin.productos({ productoId: id })
        if (mounted && res && res.items && res.items[0]) {
          const p = res.items[0]
          setForm({ name: p.name || '', price: p.price || '', description: p.description || '' })
        }
      } catch (err) {
        console.warn(err)
      }
    })()
    return () => { mounted = false }
  }, [id])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.admin.actualizarProducto(id, { name: form.name, price: form.price, description: form.description })
      router.push('/admin/products')
    } catch (err) {
      alert('Error updating product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-black mb-4">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full p-3 border rounded" />
        <input name="price" value={form.price} onChange={handleChange} placeholder="Price" className="w-full p-3 border rounded" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full p-3 border rounded" />
        <button disabled={loading} className="px-6 py-3 bg-brand text-white rounded">
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  )
}
