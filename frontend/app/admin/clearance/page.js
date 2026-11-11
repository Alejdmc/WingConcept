'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import SafeImage from '@/components/ui/SafeImage'
import { api } from '@/lib/api'
import { categoryLabel, formatClearancePrice } from '@/lib/clearance'

const LABELS = { activo: 'Active', vendido: 'Sold', oculto: 'Hidden' }

/** Moderación de Clearance: ocultar o volver a mostrar publicaciones de usuarios. */
export default function AdminClearancePage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const data = await api.clearance.adminList()
      setItems(data.items || [])
    } catch (err) {
      setError(err?.detail || 'Could not load listings.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const setStatus = async (id, estado) => {
    setError('')
    try {
      await api.clearance.adminSetStatus(id, estado)
      await load()
    } catch (err) {
      setError(err?.detail || 'Could not update the listing.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink">Clearance</h1>
        <p className="text-ink2 text-sm mt-1">Used equipment published by users. Hide anything inappropriate; sellers manage their own listings.</p>
      </div>
      {error && <p className="p-3 rounded bg-red-100 text-red-700 text-sm">{error}</p>}
      {loading ? (
        <p className="text-ink2">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-ink2">No listings yet.</p>
      ) : (
        <div className="bg-white border border-borderline rounded-lg divide-y divide-borderline">
          {items.map((l) => (
            <div key={l.id} className="p-4 flex gap-4 items-center">
              <div className="relative w-20 h-16 shrink-0 rounded overflow-hidden bg-bg2">
                {l.imagenes?.[0] && <SafeImage src={l.imagenes[0]} alt="" fill sizes="80px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/clearance/${l.id}`} target="_blank" className="font-bold text-ink hover:text-brand truncate block">{l.titulo}</Link>
                <p className="text-xs text-ink2">{categoryLabel(l.categoria)} · {formatClearancePrice(l.precio)} · {l.contacto_nombre} &lt;{l.contacto_email}&gt; · {new Date(l.created_at).toLocaleDateString()}</p>
              </div>
              <span className="text-xs font-bold text-ink2 w-16">{LABELS[l.estado] || l.estado}</span>
              {l.estado === 'oculto' ? (
                <button type="button" onClick={() => setStatus(l.id, 'activo')} className="px-3 py-1.5 rounded border border-borderline text-sm font-bold hover:border-brand">Show</button>
              ) : (
                <button type="button" onClick={() => setStatus(l.id, 'oculto')} className="px-3 py-1.5 rounded border border-red-300 text-red-600 text-sm font-bold hover:bg-red-50">Hide</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
