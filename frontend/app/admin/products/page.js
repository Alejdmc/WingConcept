'use client'
import { useState } from 'react'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts] = useState([
    { id: 1, name: 'Disruptor', price: '$5,000', stock: 12, sales: 45 },
    { id: 2, name: 'I-Pro', price: '$5,200', stock: 8, sales: 32 },
    { id: 3, name: 'Paramotor Trike', price: '$1,350', stock: 5, sales: 18 },
  ])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', price: '', stock: '' })

  const handleAdd = (e) => {
    e.preventDefault()
    if (editingId) {
      setProducts(products.map(p => p.id === editingId ? { ...p, ...formData } : p))
      setEditingId(null)
    } else {
      setProducts([...products, { id: Date.now(), ...formData, sales: 0 }])
    }
    setFormData({ name: '', price: '', stock: '' })
    setShowForm(false)
  }

  const handleEdit = (product) => {
    setFormData(product)
    setEditingId(product.id)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    setProducts(products.filter(p => p.id !== id))
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-ink">Productos</h1>
        <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', price: '', stock: '' }) }} className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded font-bold hover:bg-brand/90">
          <Plus className="w-5 h-5" /> Nuevo Producto
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-ink2" />
        <input type="text" placeholder="Buscar producto..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-borderline rounded bg-bg2 text-ink focus:outline-none focus:border-brand" />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-black text-ink mb-6">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Nombre</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-3 py-2 border border-borderline rounded focus:outline-none focus:border-brand" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Precio</label>
                <input type="text" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required className="w-full px-3 py-2 border border-borderline rounded focus:outline-none focus:border-brand" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Stock</label>
                <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required className="w-full px-3 py-2 border border-borderline rounded focus:outline-none focus:border-brand" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-brand text-white py-2 rounded font-bold hover:bg-brand/90">Guardar</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-borderline text-ink py-2 rounded font-bold hover:bg-borderline/80">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-borderline rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg2">
            <tr className="border-b border-borderline">
              <th className="text-left py-4 px-6 font-semibold text-ink">Producto</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Precio</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Stock</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Ventas</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className="border-b border-borderline hover:bg-bg2 transition">
                <td className="py-4 px-6 font-semibold text-ink">{product.name}</td>
                <td className="py-4 px-6 text-brand font-bold">{product.price}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded text-xs font-bold ${
                    product.stock > 10 ? 'bg-green-100 text-green-700' :
                    product.stock > 5 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {product.stock} unidades
                  </span>
                </td>
                <td className="py-4 px-6 text-ink2">{product.sales}</td>
                <td className="py-4 px-6 flex gap-2">
                  <button onClick={() => handleEdit(product)} className="p-2 hover:bg-blue-100 rounded transition">
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-red-100 rounded transition">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}