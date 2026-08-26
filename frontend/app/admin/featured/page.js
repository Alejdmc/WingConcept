'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Star } from 'lucide-react'
import { api } from '@/lib/api'
import { FEATURED_CATALOG, FEATURED_EXCLUDED_SLUGS, FEATURED_ORDER } from '@/lib/featuredProductsContent'
import { reorderList, persistOrderChanges } from '@/lib/persistOrder'
import ReorderButtons from '@/components/admin/ReorderButtons'

const CATALOG_SLUGS = new Set(Object.keys(FEATURED_CATALOG))

function sortFeatured(items) {
  return [...items].sort((a, b) => {
    const ai = FEATURED_ORDER.indexOf(a.slug)
    const bi = FEATURED_ORDER.indexOf(b.slug)
    const aRank = ai === -1 ? 100 + (a.orden_display ?? 0) : ai
    const bRank = bi === -1 ? 100 + (b.orden_display ?? 0) : bi
    return aRank - bRank || (a.orden_display ?? 0) - (b.orden_display ?? 0)
  })
}

export default function AdminFeaturedPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [reordering, setReordering] = useState(false)
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const featuredItems = useMemo(
    () => sortFeatured(items.filter((p) => CATALOG_SLUGS.has(p.slug) && !FEATURED_EXCLUDED_SLUGS.includes(p.slug))),
    [items],
  )

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.admin.productos({ por_pagina: 100 })
      setItems(data.items || [])
    } catch {
      setError('Could not load products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const toggleFeatured = async (item) => {
    setSavingId(item.id)
    setError('')
    try {
      await api.admin.actualizarProducto(item.id, { destacado: !item.destacado })
      setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, destacado: !p.destacado } : p)))
      setMessage(`${item.name} ${item.destacado ? 'removed from' : 'added to'} featured section.`)
    } catch (err) {
      setError(err.detail || 'Could not update featured status.')
    } finally {
      setSavingId(null)
    }
  }

  const moveItem = async (index, direction) => {
    const list = [...featuredItems]
    const target = direction === 'up' ? index - 1 : index + 1
    const reordered = reorderList(list, index, target, 'orden_display')
    setItems((prev) => {
      const map = new Map(reordered.map((p) => [p.id, p]))
      return prev.map((p) => map.get(p.id) || p)
    })
    setReordering(true)
    setError('')
    try {
      await persistOrderChanges(reordered, featuredItems, {
        getId: (item) => item.id,
        update: (id, data) => api.admin.actualizarProducto(id, data),
      })
      setMessage('Featured order updated on homepage.')
    } catch {
      setError('Could not save order.')
      load()
    } finally {
      setReordering(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-ink">Featured products</h1>
          <p className="text-ink2 mt-2 max-w-2xl">
            Controls the <strong>Featured Products</strong> section on the homepage.
            Toggle visibility and reorder cards. Product copy and images come from each product&apos;s catalog entry and listing pages.
          </p>
        </div>
        <a
          href="/#featured-products"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 border border-borderline rounded font-semibold text-sm hover:border-brand"
        >
          <ExternalLink className="w-4 h-4" /> View on site
        </a>
      </div>

      {message && <div className="mb-4 p-4 rounded bg-green-100 text-green-700">{message}</div>}
      {error && <div className="mb-4 p-4 rounded bg-red-100 text-red-700">{error}</div>}

      <div className="bg-white border border-borderline rounded-lg overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-bg2">
            <tr>
              <th className="text-left py-4 px-4 font-semibold w-28">Order</th>
              <th className="text-left py-4 px-4 font-semibold">Product</th>
              <th className="text-left py-4 px-4 font-semibold">Category</th>
              <th className="text-left py-4 px-4 font-semibold">Featured</th>
              <th className="text-left py-4 px-4 font-semibold">Edit elsewhere</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="py-8 text-center text-ink2">Loading...</td></tr>
            ) : featuredItems.length === 0 ? (
              <tr><td colSpan="5" className="py-8 text-center text-ink2">No catalog products found.</td></tr>
            ) : (
              featuredItems.map((item, index) => {
                const catalog = FEATURED_CATALOG[item.slug]
                return (
                  <tr key={item.id} className={`border-t border-borderline hover:bg-bg2 ${!item.destacado ? 'opacity-60' : ''}`}>
                    <td className="py-4 px-4">
                      <ReorderButtons
                        index={index}
                        total={featuredItems.length}
                        disabled={reordering || !item.destacado}
                        onMoveUp={() => moveItem(index, 'up')}
                        onMoveDown={() => moveItem(index, 'down')}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-ink2">{catalog?.badge || item.slug} · {item.price || '—'}</p>
                    </td>
                    <td className="py-4 px-4 capitalize text-ink2">{item.categoria}</td>
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        disabled={savingId === item.id}
                        onClick={() => toggleFeatured(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold border transition ${
                          item.destacado
                            ? 'bg-brand text-white border-brand'
                            : 'bg-white text-ink2 border-borderline hover:border-brand'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.destacado ? 'fill-current' : ''}`} />
                        {item.destacado ? 'Featured' : 'Hidden'}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      {item.categoria === 'paratrike' && (
                        <Link href="/admin/paratrikes" className="text-brand hover:underline text-xs font-semibold">
                          Paratrikes page
                        </Link>
                      )}
                      {item.categoria === 'paramotor' && (
                        <Link href="/admin/paramotors" className="text-brand hover:underline text-xs font-semibold">
                          Paramotors page
                        </Link>
                      )}
                      <span className="text-ink2 text-xs block mt-1">
                        <Link href="/admin/configurador" className="hover:text-brand">Configurator prices</Link>
                      </span>
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
