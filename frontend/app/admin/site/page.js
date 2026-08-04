'use client'
import { useEffect, useState } from 'react'
import { Pencil, Eye, EyeOff, Save } from 'lucide-react'
import { api } from '@/lib/api'
import { SECCIONES_SITIO } from '@/lib/cmsLabels'

export default function AdminSitePage() {
  const [seccion, setSeccion] = useState('homepage')
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.admin.siteBlocks({ seccion, por_pagina: 50 })
      setBlocks(data.items || [])
    } catch {
      setError('Could not load site content.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setEditing(null)
    load()
  }, [seccion])

  const startEdit = (block) => {
    setEditing(block.id)
    setEditValue(block.valor || '')
    setMessage('')
  }

  const saveBlock = async (block) => {
    setSaving(true)
    setError('')
    try {
      await api.admin.actualizarSiteBlock(block.id, { valor: editValue })
      setMessage(`"${block.etiqueta}" saved.`)
      setEditing(null)
      load()
    } catch (err) {
      setError(err.detail || 'Error saving.')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (block) => {
    try {
      await api.admin.actualizarSiteBlock(block.id, { activo: !block.activo })
      load()
    } catch {
      setError('Could not change visibility.')
    }
  }

  const seccionInfo = SECCIONES_SITIO[seccion]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink">Website texts</h1>
        <p className="text-ink2 mt-2">
          Edit titles, buttons and images that appear on public pages. Changes go live immediately.
        </p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {Object.entries(SECCIONES_SITIO).map(([id, info]) => (
          <button
            key={id}
            onClick={() => setSeccion(id)}
            className={`px-4 py-2 rounded font-semibold text-sm transition ${
              seccion === id ? 'bg-brand text-white' : 'bg-white border border-borderline hover:border-brand'
            }`}
          >
            {info.label}
          </button>
        ))}
      </div>

      {seccionInfo && (
        <p className="text-sm text-ink2 mb-6 bg-bg2 p-4 rounded-lg">{seccionInfo.descripcion}</p>
      )}

      {message && <div className="mb-4 p-4 rounded bg-green-100 text-green-700">{message}</div>}
      {error && <div className="mb-4 p-4 rounded bg-red-100 text-red-700">{error}</div>}

      <div className="space-y-4">
        {loading ? (
          <p className="text-ink2">Loading...</p>
        ) : blocks.length === 0 ? (
          <p className="text-ink2">No editable blocks in this section yet.</p>
        ) : (
          blocks.map((block) => (
            <div key={block.id} className={`bg-white border rounded-lg p-5 ${!block.activo ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-start gap-4 mb-2">
                <div>
                  <h3 className="font-bold text-ink">{block.etiqueta}</h3>
                  <p className="text-xs text-ink2 mt-1">
                    {block.tipo === 'textarea' ? 'Multiple lines or image URLs (one per line)' : 'Short text'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {editing !== block.id && (
                    <button onClick={() => startEdit(block)} className="p-2 border rounded hover:border-brand" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => toggleActive(block)} className="p-2 border rounded hover:border-brand" title={block.activo ? 'Hide on site' : 'Show on site'}>
                    {block.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {editing === block.id ? (
                <div className="mt-3 space-y-3">
                  {block.tipo === 'textarea' ? (
                    <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} rows={5} className="w-full p-3 border rounded font-mono text-sm" />
                  ) : (
                    <input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full p-3 border rounded" />
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => saveBlock(block)} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded font-semibold disabled:opacity-50">
                      <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditing(null)} className="px-4 py-2 border rounded">Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-ink2 mt-2 whitespace-pre-wrap break-words">{block.valor || '—'}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
