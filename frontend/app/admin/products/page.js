'use client'
import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { api } from '@/lib/api'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await api.admin.productos({ por_pagina: 50 })
        setProducts(data.items || [])
      } catch (err) {
        console.error('Error loading admin products:', err)
        setError('No se pudieron cargar los productos.')
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  const filtered = products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-ink">Productos</h1>
          <p className="text-ink2 mt-2">Lista de productos del panel admin conectada al backend.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>
      )}

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-ink2" />
        <input type="text" placeholder="Buscar producto..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-borderline rounded bg-bg2 text-ink focus:outline-none focus:border-brand" />
      </div>

      {/* Table */}
      <div className="bg-white border border-borderline rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg2">
            <tr className="border-b border-borderline">
              <th className="text-left py-4 px-6 font-semibold text-ink">Producto</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Precio</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Stock</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Ventas</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-ink2">Cargando productos...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-ink2">No se encontraron productos.</td>
              </tr>
            ) : (
              filtered.map((product) => (
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}