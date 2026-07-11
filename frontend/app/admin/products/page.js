'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Plus, Pencil, Package } from 'lucide-react'
import { api } from '@/lib/api'

function StockModal({ product, onClose, onSaved }) {
  const [variantes, setVariantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await api.admin.obtenerProducto(product.id)
        setVariantes(data.variantes || [])
      } catch {
        setError('No se pudieron cargar las variantes.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [product.id])

  const updateStock = async (varianteId, stock) => {
    setSaving(varianteId)
    setError('')
    try {
      const updated = await api.admin.actualizarStock(varianteId, { stock: Number(stock) })
      setVariantes((prev) => prev.map((v) => (v.id === varianteId ? updated : v)))
      onSaved()
    } catch {
      setError('Error al actualizar el stock.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-ink">Stock — {product.name}</h3>
          <button onClick={onClose} className="text-ink2 hover:text-ink font-bold">✕</button>
        </div>

        {error && <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">{error}</div>}

        {loading ? (
          <p className="text-ink2">Cargando variantes...</p>
        ) : variantes.length === 0 ? (
          <p className="text-ink2">Este producto no tiene variantes. Edítalo para agregar una.</p>
        ) : (
          <div className="space-y-4">
            {variantes.map((v) => (
              <div key={v.id} className="flex items-center gap-4 p-4 border border-borderline rounded">
                <div className="flex-1">
                  <p className="font-semibold text-ink">{v.nombre}</p>
                  <p className="text-sm text-ink2">${v.precio?.toLocaleString()} USD</p>
                </div>
                <input
                  type="number"
                  min="0"
                  defaultValue={v.stock}
                  onBlur={(e) => {
                    const val = Number(e.target.value)
                    if (val !== v.stock) updateStock(v.id, val)
                  }}
                  className="w-24 px-3 py-2 border border-borderline rounded text-center"
                />
                {saving === v.id && <span className="text-xs text-ink2">Guardando...</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stockProduct, setStockProduct] = useState(null)

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

  useEffect(() => {
    loadProducts()
  }, [])

  const filtered = products.filter((product) =>
    product.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-ink">Productos</h1>
          <p className="text-ink2 mt-2">Gestiona productos y stock desde el panel admin.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded font-semibold hover:bg-brand/90 transition"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>
      )}

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-ink2" />
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-borderline rounded bg-bg2 text-ink focus:outline-none focus:border-brand"
        />
      </div>

      <div className="bg-white border border-borderline rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg2">
            <tr className="border-b border-borderline">
              <th className="text-left py-4 px-6 font-semibold text-ink">Producto</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Categoría</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Tipo</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Precio</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Stock</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Ventas</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-ink2">Cargando productos...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-ink2">No se encontraron productos.</td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product.id} className="border-b border-borderline hover:bg-bg2 transition">
                  <td className="py-4 px-6 font-semibold text-ink">{product.name}</td>
                  <td className="py-4 px-6 text-ink2 capitalize">{product.categoria}</td>
                  <td className="py-4 px-6 text-ink2 capitalize">{product.subcategoria || '—'}</td>
                  <td className="py-4 px-6 text-brand font-bold">{product.price}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded text-xs font-bold ${
                      product.stock > 10 ? 'bg-green-100 text-green-700' :
                      product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {product.stock} unidades
                    </span>
                  </td>
                  <td className="py-4 px-6 text-ink2">{product.sales}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setStockProduct(product)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-borderline rounded hover:border-brand hover:text-brand transition"
                      >
                        <Package className="w-3 h-3" />
                        Stock
                      </button>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-borderline rounded hover:border-brand hover:text-brand transition"
                      >
                        <Pencil className="w-3 h-3" />
                        Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {stockProduct && (
        <StockModal
          product={stockProduct}
          onClose={() => setStockProduct(null)}
          onSaved={loadProducts}
        />
      )}
    </div>
  )
}
