'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Save, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { api } from '@/lib/api'
import { PARATRIKE_HREFS } from '@/lib/cmsLabels'

function emptyListing() {
  return {
    tagline: '',
    description: '',
    featuresText: '',
    image: '',
    cta_label: '',
    compareDescription: '',
    compareBulletsText: '',
  }
}

function fromProduct(p) {
  const listing = p.contenido_extra?.listing || {}
  const compare = p.contenido_extra?.compare || {}
  const variantes = (p.variantes || []).filter((v) => v.activo !== false)
  const precio = variantes.length
    ? Math.min(...variantes.map((v) => v.precio))
    : p.precio_desde ?? null
  return {
    id: p.id,
    nombre: p.nombre,
    slug: p.slug,
    activo: p.activo,
    precio,
    listing: {
      tagline: listing.tagline || '',
      description: listing.description || p.descripcion_corta || '',
      featuresText: (listing.features || []).join('\n'),
      image: listing.image || p.imagenes?.[0] || '',
      cta_label: listing.cta_label || '',
      compareDescription: compare.description || '',
      compareBulletsText: (compare.bullets || []).join('\n'),
    },
  }
}

export default function AdminParatrikesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [savingId, setSavingId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.admin.productos({ categoria: 'paratrike', por_pagina: 50 })
      const ids = (data.items || []).map((p) => p.id)
      const fullItems = await Promise.all(
        ids.map((id) => api.admin.obtenerProducto(id).catch(() => null))
      )
      setItems(fullItems.filter(Boolean).map(fromProduct))
    } catch {
      setError('Could not load paratrikes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const updateField = (id, field, value) => {
    setItems((prev) => prev.map((item) => {
      if (item.id !== id) return item
      return { ...item, listing: { ...item.listing, [field]: value } }
    }))
  }

  const saveItem = async (item) => {
    setSavingId(item.id)
    setError('')
    setMessage('')
    try {
      const full = await api.admin.obtenerProducto(item.id)
      const contenido_extra = {
        ...(full.contenido_extra || {}),
        listing: {
          tagline: item.listing.tagline,
          description: item.listing.description,
          features: item.listing.featuresText.split('\n').map((s) => s.trim()).filter(Boolean),
          image: item.listing.image || null,
          cta_label: item.listing.cta_label || null,
        },
        compare: {
          description: item.listing.compareDescription || null,
          bullets: item.listing.compareBulletsText.split('\n').map((s) => s.trim()).filter(Boolean),
        },
      }
      await api.admin.actualizarProducto(item.id, {
        descripcion_corta: item.listing.description,
        contenido_extra,
      })
      setMessage(`"${item.nombre}" saved. Changes appear on /paratrike.`)
    } catch (err) {
      setError(err.detail || 'Error saving.')
    } finally {
      setSavingId(null)
    }
  }

  const toggleActive = async (item) => {
    try {
      await api.admin.actualizarProducto(item.id, { activo: !item.activo })
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, activo: !i.activo } : i)))
    } catch {
      setError('Could not change visibility.')
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-ink">Paratrikes page</h1>
          <p className="text-ink2 mt-2 max-w-2xl">
            Edit the selection cards on <strong>/paratrike</strong> (Vanguard &amp; Nomadic). For banner and general texts, use{' '}
            <Link href="/admin/site" className="text-brand hover:underline">Website texts → Paratrikes</Link>.
            Starting price on cards comes from the main variant; configurator prices are in{' '}
            <Link href="/admin/configurador" className="text-brand hover:underline">Customization</Link>.
          </p>
        </div>
        <a
          href="/paratrike"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 border border-borderline rounded font-semibold text-sm hover:border-brand">
          <ExternalLink className="w-4 h-4" /> View page
        </a>
      </div>

      {message && <div className="mb-4 p-4 rounded bg-green-100 text-green-700">{message}</div>}
      {error && <div className="mb-4 p-4 rounded bg-red-100 text-red-700">{error}</div>}

      {loading ? (
        <p className="text-ink2">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-ink2">No paratrike products found. They should exist as category &quot;paratrike&quot; in Products.</p>
      ) : (
        <div className="space-y-10">
          {items.map((item) => (
            <div key={item.id} className={`bg-white border rounded-xl p-6 ${!item.activo ? 'opacity-60' : ''}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-xl font-black text-ink">{item.nombre}</h2>
                  <p className="text-sm text-ink2">
                    Public page: {PARATRIKE_HREFS[item.slug] || '—'}
                    {typeof item.precio === 'number' && (
                      <span className="ml-3 text-brand font-bold">From ${item.precio.toLocaleString()}</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleActive(item)}
                    className="p-2 border rounded hover:border-brand"
                    title={item.activo ? 'Hide on site' : 'Show on site'}>
                    {item.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <Link href={`/admin/products/${item.id}/edit`} className="px-3 py-2 border rounded text-sm font-semibold hover:border-brand">
                    Full product edit
                  </Link>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Card subtitle (under name on photo)</label>
                  <input
                    value={item.listing.tagline}
                    onChange={(e) => updateField(item.id, 'tagline', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Performance Meets Precision"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Card image (URL or path)</label>
                  <input
                    value={item.listing.image}
                    onChange={(e) => updateField(item.id, 'image', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="/images/vanguard/1.png"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">Card description</label>
                  <textarea
                    value={item.listing.description}
                    onChange={(e) => updateField(item.id, 'description', e.target.value)}
                    rows={3}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">Bullet points on card (one per line)</label>
                  <textarea
                    value={item.listing.featuresText}
                    onChange={(e) => updateField(item.id, 'featuresText', e.target.value)}
                    rows={4}
                    className="w-full p-2 border rounded font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Button text</label>
                  <input
                    value={item.listing.cta_label}
                    onChange={(e) => updateField(item.id, 'cta_label', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Explore Vanguard"
                  />
                </div>
                <div className="md:col-span-2 border-t pt-4 mt-2">
                  <p className="text-sm font-bold text-ink mb-3">Comparison section (lower on page)</p>
                  <label className="block text-sm font-semibold mb-1">Comparison text</label>
                  <textarea
                    value={item.listing.compareDescription}
                    onChange={(e) => updateField(item.id, 'compareDescription', e.target.value)}
                    rows={2}
                    className="w-full p-2 border rounded mb-3"
                  />
                  <label className="block text-sm font-semibold mb-1">Comparison bullets (one per line)</label>
                  <textarea
                    value={item.listing.compareBulletsText}
                    onChange={(e) => updateField(item.id, 'compareBulletsText', e.target.value)}
                    rows={3}
                    className="w-full p-2 border rounded font-mono text-sm"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => saveItem(item)}
                disabled={savingId === item.id}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded font-semibold disabled:opacity-50">
                <Save className="w-4 h-4" />
                {savingId === item.id ? 'Saving...' : 'Save card'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
