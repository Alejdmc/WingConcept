'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { api } from '@/lib/api'
import { tipoLabel } from '@/lib/cmsLabels'
import { reorderList, persistOrderChanges } from '@/lib/persistOrder'
import ContenidoForm, { contenidoToFormData } from '@/components/admin/ContenidoForm'
import ReorderButtons from '@/components/admin/ReorderButtons'

function sortByOrden(items) {
  return [...items].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || String(a.titulo).localeCompare(String(b.titulo)))
}

function articleHref(article) {
  if (typeof article.capacidad === 'string' && article.capacidad.startsWith('/')) {
    return article.capacidad
  }
  return null
}

export default function AdminNewsPage() {
  const seccion = 'news'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [reordering, setReordering] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [createTipo, setCreateTipo] = useState('noticia')

  const sortedItems = useMemo(() => sortByOrden(items), [items])
  const pageBlocks = sortedItems.filter((item) => item.tipo === 'hero' || item.tipo === 'intro')
  const articles = sortedItems.filter((item) => item.tipo === 'noticia')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.admin.contenidos({ seccion, por_pagina: 100 })
      setItems(data.items || [])
    } catch {
      setError('Could not load news content.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setEditing(null)
    setCreating(false)
    load()
  }, [])

  const handleCreate = async (payload) => {
    try {
      await api.admin.crearContenido(payload)
      setCreating(false)
      setMessage('Content saved.')
      load()
    } catch (err) {
      setError(err.detail || 'Error creating content.')
    }
  }

  const handleUpdate = async (payload) => {
    try {
      await api.admin.actualizarContenido(editing.id, payload)
      setEditing(null)
      setMessage('Content updated.')
      load()
    } catch (err) {
      setError(err.detail || 'Error updating content.')
    }
  }

  const handleToggleActivo = async (item) => {
    try {
      await api.admin.actualizarContenido(item.id, { activo: !item.activo })
      load()
    } catch {
      setError('Error changing status.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this content?')) return
    try {
      await api.admin.eliminarContenido(id, true)
      load()
    } catch {
      setError('Error deleting content.')
    }
  }

  const moveArticle = async (index, direction) => {
    const list = [...articles]
    const target = direction === 'up' ? index - 1 : index + 1
    const reordered = reorderList(list, index, target, 'orden')
    setItems((prev) => {
      const other = prev.filter((item) => item.tipo !== 'noticia')
      return [...other, ...reordered]
    })
    setReordering(true)
    setError('')
    try {
      await persistOrderChanges(reordered, articles, {
        getId: (item) => item.id,
        update: (id, data) => api.admin.actualizarContenido(id, data),
      })
      setMessage('News order updated.')
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
          <h1 className="text-3xl font-black text-ink">News</h1>
          <p className="text-ink2 mt-2 max-w-2xl">
            Manage the news section on the homepage and the full <strong>/news</strong> page.
            Reorder article cards with the arrows — order matches what visitors see.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/#news"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 border border-borderline rounded font-semibold text-sm hover:border-brand"
          >
            <ExternalLink className="w-4 h-4" /> Homepage section
          </a>
          <a
            href="/news"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 border border-borderline rounded font-semibold text-sm hover:border-brand"
          >
            <ExternalLink className="w-4 h-4" /> Full news page
          </a>
        </div>
      </div>

      {message && <div className="mb-4 p-4 rounded bg-green-100 text-green-700">{message}</div>}
      {error && <div className="mb-4 p-4 rounded bg-red-100 text-red-700">{error}</div>}

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => { setCreating(true); setCreateTipo('noticia'); setEditing(null) }}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded font-semibold hover:bg-brand/90"
        >
          <Plus className="w-4 h-4" /> New article
        </button>
        <button
          onClick={() => { setCreating(true); setCreateTipo('hero'); setEditing(null) }}
          className="px-4 py-2 border border-borderline rounded font-semibold text-sm hover:border-brand"
        >
          Edit page banner
        </button>
        <button
          onClick={() => { setCreating(true); setCreateTipo('intro'); setEditing(null) }}
          className="px-4 py-2 border border-borderline rounded font-semibold text-sm hover:border-brand"
        >
          Edit intro text
        </button>
      </div>

      {creating && (
        <div className="mb-8">
          <h2 className="font-black text-lg mb-4">
            {createTipo === 'noticia' ? 'New article' : createTipo === 'hero' ? 'Page banner' : 'Intro text'}
          </h2>
          <ContenidoForm
            seccion={seccion}
            defaultTipo={createTipo}
            onSave={handleCreate}
            onCancel={() => setCreating(false)}
          />
        </div>
      )}

      {editing && (
        <div className="mb-8">
          <h2 className="font-black text-lg mb-4">Edit: {editing.titulo}</h2>
          <ContenidoForm
            seccion={seccion}
            initial={contenidoToFormData(editing)}
            onSave={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {!loading && articles.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-black text-ink mb-4">Preview — homepage cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {articles.filter((a) => a.activo).map((article) => {
              const href = articleHref(article)
              return (
                <div key={article.id} className="bg-white border border-borderline rounded-xl overflow-hidden">
                  <div className="relative h-40 bg-bg2">
                    {article.imagen ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={article.imagen} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-ink2 text-sm">No image</div>
                    )}
                    {article.ubicacion && (
                      <span className="absolute top-3 right-3 bg-brand text-white px-2 py-1 rounded-full text-xs font-bold uppercase">
                        {article.ubicacion}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-black text-ink uppercase text-sm mb-1">{article.titulo}</p>
                    <p className="text-xs text-ink2 line-clamp-2">{article.descripcion}</p>
                    {href && (
                      <p className="text-xs text-brand mt-2 truncate">→ {href}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {pageBlocks.length > 0 && (
        <div className="mb-8 bg-bg2 rounded-lg p-4">
          <h2 className="font-black text-ink mb-3">Page settings (/news)</h2>
          <div className="space-y-2">
            {pageBlocks.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 bg-white border rounded p-3">
                <div>
                  <p className="font-semibold text-sm">{tipoLabel(seccion, item.tipo)} — {item.titulo}</p>
                  <p className="text-xs text-ink2 truncate max-w-xl">{item.descripcion || '—'}</p>
                </div>
                <button
                  onClick={() => { setEditing(item); setCreating(false) }}
                  className="px-3 py-1.5 border rounded text-sm font-semibold hover:border-brand"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-borderline rounded-lg overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-bg2">
            <tr>
              <th className="text-left py-4 px-4 font-semibold w-28">Order</th>
              <th className="text-left py-4 px-4 font-semibold">Article</th>
              <th className="text-left py-4 px-4 font-semibold">Link</th>
              <th className="text-left py-4 px-4 font-semibold">Status</th>
              <th className="text-left py-4 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="py-8 text-center text-ink2">Loading...</td></tr>
            ) : articles.length === 0 ? (
              <tr><td colSpan="5" className="py-8 text-center text-ink2">No news articles yet.</td></tr>
            ) : (
              articles.map((item, index) => (
                <tr key={item.id} className={`border-t border-borderline hover:bg-bg2 ${!item.activo ? 'opacity-60' : ''}`}>
                  <td className="py-4 px-4">
                    <ReorderButtons
                      index={index}
                      total={articles.length}
                      disabled={reordering}
                      onMoveUp={() => moveArticle(index, 'up')}
                      onMoveDown={() => moveArticle(index, 'down')}
                    />
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-semibold">{item.titulo}</p>
                    <p className="text-xs text-ink2">{item.fecha || '—'} · {item.ubicacion || 'No category'}</p>
                  </td>
                  <td className="py-4 px-4 text-xs text-brand truncate max-w-[180px]">
                    {articleHref(item) || '—'}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {item.activo ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-1">
                      <button title="Edit" onClick={() => { setEditing(item); setCreating(false) }} className="p-2 border rounded hover:border-brand">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button title={item.activo ? 'Hide' : 'Show'} onClick={() => handleToggleActivo(item)} className="p-2 border rounded hover:border-brand">
                        {item.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button title="Delete" onClick={() => handleDelete(item.id)} className="p-2 border rounded hover:border-red-400 text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-ink2 mt-6">
        Need Adventure, Shows or Events? Use{' '}
        <Link href="/admin/contenido" className="text-brand hover:underline">Adventure &amp; events</Link>.
      </p>
    </div>
  )
}
