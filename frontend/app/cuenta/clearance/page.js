'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'
import ClearanceListingForm from '@/components/clearance/ClearanceListingForm'
import { api } from '@/lib/api'
import { ensureValidSession, getStoredUser } from '@/lib/auth'
import { categoryLabel, formatClearancePrice } from '@/lib/clearance'

const STATUS = {
  activo: { label: 'Active', cls: 'bg-green-100 text-green-700' },
  vendido: { label: 'Sold', cls: 'bg-bg2 text-ink2' },
  oculto: { label: 'Hidden by admin', cls: 'bg-red-100 text-red-700' },
}

export default function MyClearancePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState([])
  const [editing, setEditing] = useState(null) // null | 'new' | listing
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [defaults, setDefaults] = useState({})

  const load = useCallback(async () => {
    try {
      setListings(await api.clearance.mine())
    } catch (err) {
      setError(err?.detail || 'Could not load your listings.')
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      const ok = await ensureValidSession()
      if (!ok) {
        router.replace('/login?next=/cuenta/clearance')
        return
      }
      const user = await api.usuarios.perfil().catch(() => getStoredUser())
      const email = String(user?.email || '')
      setDefaults({
        contacto_nombre: [user?.nombre, user?.apellido].filter(Boolean).join(' '),
        contacto_email: /@(gmail|googlemail)\.com$/i.test(email) ? email : '',
        contacto_telefono: user?.telefono || '',
      })
      await load()
      setLoading(false)
    }
    init()
  }, [router, load])

  const onSaved = async () => {
    setMessage(editing === 'new' ? 'Your listing is published.' : 'Listing updated.')
    setEditing(null)
    await load()
  }

  const setStatus = async (listing, estado) => {
    setError('')
    try {
      await api.clearance.update(listing.id, { estado })
      await load()
    } catch (err) {
      setError(err?.detail || 'Could not update the listing.')
    }
  }

  const remove = async (listing) => {
    if (!window.confirm(`Delete "${listing.titulo}"? This cannot be undone.`)) return
    setError('')
    try {
      await api.clearance.remove(listing.id)
      await load()
    } catch (err) {
      setError(err?.detail || 'Could not delete the listing.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-ink2">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link href="/cuenta" className="inline-flex items-center gap-2 text-sm font-bold text-ink2 hover:text-brand mb-6">
        <ArrowLeft className="w-4 h-4" /> My account
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-ink">My Clearance listings</h1>
          <p className="text-ink2 mt-1">Sell your used trike or gear. Listings appear on the <Link href="/clearance" className="text-brand font-bold hover:underline">Clearance</Link> page.</p>
        </div>
        {!editing && (
          <button type="button" onClick={() => { setMessage(''); setEditing('new') }} className="inline-flex items-center gap-2 px-5 py-3 bg-brand text-white rounded font-bold hover:bg-brand/90">
            <Plus className="w-4 h-4" /> New listing
          </button>
        )}
      </div>

      {message && <div className="mb-6 p-4 rounded bg-green-100 text-green-700">{message}</div>}
      {error && <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>}

      {editing && (
        <div className="mb-10">
          <ClearanceListingForm
            listing={editing === 'new' ? null : editing}
            defaults={defaults}
            onSaved={onSaved}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {listings.length === 0 && !editing ? (
        <div className="bg-bg2 border border-borderline rounded-lg p-8 text-center">
          <p className="text-ink font-semibold">You have no listings yet.</p>
          <p className="text-ink2 text-sm mt-1">Publish your first one with title, description, price, up to 10 photos and your Gmail contact.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((l) => {
            const st = STATUS[l.estado] || STATUS.activo
            return (
              <div key={l.id} className="bg-white border border-borderline rounded-lg p-4 flex gap-4">
                <div className="relative w-28 h-24 shrink-0 rounded overflow-hidden bg-bg2">
                  {l.imagenes?.[0] && <SafeImage src={l.imagenes[0]} alt={l.titulo} fill sizes="112px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/clearance/${l.id}`} className="font-black text-ink hover:text-brand truncate">{l.titulo}</Link>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${st.cls}`}>{st.label}</span>
                  </div>
                  <p className="text-sm text-ink2 mt-0.5">{categoryLabel(l.categoria)} · {formatClearancePrice(l.precio)} · {l.imagenes?.length || 0} photos</p>
                  <div className="flex flex-wrap gap-3 mt-3 text-sm font-bold">
                    {l.estado !== 'oculto' && (
                      <button type="button" onClick={() => { setMessage(''); setEditing(l) }} className="inline-flex items-center gap-1 text-ink hover:text-brand">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}
                    {l.estado === 'activo' && (
                      <button type="button" onClick={() => setStatus(l, 'vendido')} className="text-ink hover:text-brand">Mark as sold</button>
                    )}
                    {l.estado === 'vendido' && (
                      <button type="button" onClick={() => setStatus(l, 'activo')} className="text-ink hover:text-brand">Publish again</button>
                    )}
                    <button type="button" onClick={() => remove(l)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-700">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
    </div>
  )
}
