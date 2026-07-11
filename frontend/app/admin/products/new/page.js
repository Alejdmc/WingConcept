'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function NewProductPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', price: '', description: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.admin.crearProducto({ name: form.name, price: form.price, description: form.description })
      router.push('/admin/products')
    } catch (err) {
      alert('Error creating product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-black mb-4">Create Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full p-3 border rounded" />
        <input name="price" value={form.price} onChange={handleChange} placeholder="Price" className="w-full p-3 border rounded" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full p-3 border rounded" />
        <button disabled={loading} className="px-6 py-3 bg-brand text-white rounded">
          {loading ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  )
}
