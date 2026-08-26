'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { api } from '@/lib/api'
import { SECCIONES_CONTENIDO, tipoLabel } from '@/lib/cmsLabels'
import { reorderList, persistOrderChanges } from '@/lib/persistOrder'
import ContenidoForm, { contenidoToFormData } from '@/components/admin/ContenidoForm'
import ReorderButtons from '@/components/admin/ReorderButtons'

const CARD_TIPOS = new Set(['expedicion', 'show', 'evento'])

function sortByOrden(items) {
  return [...items].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || String(a.titulo).localeCompare(String(b.titulo)))
}

export default function AdminContenidoPage() {
  const [seccion, setSeccion] = useState('adventure')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [reordering, setReordering] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [creating, setCreating] = useState(false)

  const sortedItems = useMemo(() => sortByOrden(items), [items])
  const pageBlocks = sortedItems.filter((item) => item.tipo === 'hero' || item.tipo === 'intro')
  const cards = sortedItems.filter((item) => CARD_TIPOS.has(item.tipo))

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.admin.contenidos({ seccion, por_pagina: 100 })
      setItems(data.items || [])
    } catch {
      setError('Could not load content.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setEditing(null)
    setViewing(null)
    setCreating(false)
    load()
  }, [seccion])

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

  const moveCard = async (index, direction) => {
    const list = [...cards]
    const target = direction === 'up' ? index - 1 : index + 1
    const reordered = reorderList(list, index, target, 'orden')
    setItems((prev) => {
      const other = prev.filter((item) => !CARD_TIPOS.has(item.tipo))
      return [...other, ...reordered]
    })
    setReordering(true)
    setError('')
    try {
      await persistOrderChanges(reordered, cards, {
        getId: (item) => item.id,
        update: (id, data) => api.admin.actualizarContenido(id, data),
      })
      setMessage('Order updated.')
    } catch {
      setError('Could not save order.')
      load()
    } finally {
      setReordering(false)
    }
  }

  const seccionLabel = SECCIONES_CONTENIDO.find((s) => s.id === seccion)?.label
  const seccionDesc = SECCIONES_CONTENIDO.find((s) => s.id === seccion)?.descripcion

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-ink">Adventure &amp; events</h1>
          <p className="text-ink2 mt-2">
            Edit banners, introductions and cards on Adventure, Shows and Events pages.
            For homepage news, use <Link href="/admin/news" className="text-brand hover:underline">News</Link>.
          </p>
        </div>
        <button
          onClick={() => { setCreating(true); setEditing(null); setViewing(null) }}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded font-semibold hover:bg-brand/90"
        >
          <Plus className="w-4 h-4" />
          New in {seccionLabel}
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {SECCIONES_CONTENIDO.map((s) => (
          <button
            key={s.id}
            onClick={() => setSeccion(s.id)}
            className={`px-4 py-2 rounded font-semibold text-sm transition ${
              seccion === s.id ? 'bg-brand text-white' : 'bg-white border border-borderline text-ink hover:border-brand'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {seccionDesc && <p className="text-sm text-ink2 mb-6 bg-bg2 p-3 rounded-lg">{seccionDesc}</p>}

      {message && <div className="mb-4 p-4 rounded bg-green-100 text-green-700">{message}</div>}
      {error && <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>}

      {creating && (
        <div className="mb-8">
          <h2 className="font-black text-lg mb-4">New content — {seccionLabel}</h2>
          <ContenidoForm seccion={seccion} onSave={handleCreate} onCancel={() => setCreating(false)} />
        </div>
      )}

      {editing && (
        <div className="mb-8">
          <h2 className="font-black text-lg mb-4">Edit: {editing.titulo}</h2>
          <ContenidoForm seccion={seccion} initial={contenidoToFormData(editing)} onSave={handleUpdate} onCancel={() => setEditing(null)} />
        </div>
      )}

      {viewing && (
        <div className="mb-8 bg-white border border-borderline rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-black text-lg">{viewing.titulo}</h2>
            <button onClick={() => setViewing(null)} className="text-ink2 hover:text-ink">✕</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <p><span className="font-semibold">Section type:</span> {tipoLabel(viewing.seccion, viewing.tipo)}</p>
            <p><span className="font-semibold">Status:</span> {viewing.activo ? 'Active' : 'Inactive'}</p>
            <p className="col-span-2"><span className="font-semibold">Description:</span> {viewing.descripcion || '—'}</p>
            {viewing.imagen && <p className="col-span-2"><span className="font-semibold">Image:</span> {viewing.imagen}</p>}
            {viewing.ubicacion && <p><span className="font-semibold">Location:</span> {viewing.ubicacion}</p>}
            {viewing.fecha && <p><span className="font-semibold">Date:</span> {viewing.fecha}</p>}
            {viewing.highlights?.length > 0 && (
              <ul className="col-span-2 list-disc pl-5">
                {viewing.highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            )}
          </div>
        </div>
      )}

      {pageBlocks.length > 0 && (
        <div className="mb-6 bg-bg2 rounded-lg p-4">
          <h2 className="font-black text-ink mb-3 text-sm uppercase tracking-wide">Page banner &amp; intro</h2>
          <div className="space-y-2">
            {pageBlocks.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 bg-white border rounded p-3">
                <div>
                  <p className="font-semibold text-sm">{tipoLabel(seccion, item.tipo)} — {item.titulo}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(item); setCreating(false); setViewing(null) }} className="p-2 border rounded hover:border-brand">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleToggleActivo(item)} className="p-2 border rounded hover:border-brand">
                    {item.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
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
              <th className="text-left py-4 px-4 font-semibold">Type</th>
              <th className="text-left py-4 px-4 font-semibold">Title</th>
              <th className="text-left py-4 px-4 font-semibold">Status</th>
              <th className="text-left py-4 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="py-8 text-center text-ink2">Loading...</td></tr>
            ) : cards.length === 0 ? (
              <tr><td colSpan="5" className="py-8 text-center text-ink2">No cards in {seccionLabel}.</td></tr>
            ) : (
              cards.map((item, index) => (
                <tr key={item.id} className={`border-t border-borderline hover:bg-bg2 ${!item.activo ? 'opacity-60' : ''}`}>
                  <td className="py-4 px-4">
                    <ReorderButtons
                      index={index}
                      total={cards.length}
                      disabled={reordering}
                      onMoveUp={() => moveCard(index, 'up')}
                      onMoveDown={() => moveCard(index, 'down')}
                    />
                  </td>
                  <td className="py-4 px-4 text-ink2">{tipoLabel(seccion, item.tipo)}</td>
                  <td className="py-4 px-4 font-semibold">{item.titulo}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {item.activo ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <button title="View" onClick={() => { setViewing(item); setEditing(null); setCreating(false) }} className="p-2 border rounded hover:border-brand">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button title="Edit" onClick={() => { setEditing(item); setViewing(null); setCreating(false) }} className="p-2 border rounded hover:border-brand">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button title={item.activo ? 'Hide' : 'Activate'} onClick={() => handleToggleActivo(item)} className="p-2 border rounded hover:border-brand">
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
    </div>
  )
}
