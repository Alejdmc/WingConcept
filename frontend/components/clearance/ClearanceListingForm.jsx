'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Star, X } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'
import { api } from '@/lib/api'
import { CLEARANCE_CATEGORIES, CLEARANCE_MAX_PHOTOS, isGmail } from '@/lib/clearance'

const EMPTY = {
  titulo: '',
  descripcion: '',
  precio: '',
  categoria: 'trike',
  ubicacion: '',
  contacto_nombre: '',
  contacto_email: '',
  contacto_telefono: '',
  imagenes: [],
}

export function listingToForm(listing) {
  if (!listing) return EMPTY
  return {
    titulo: listing.titulo || '',
    descripcion: listing.descripcion || '',
    precio: String(listing.precio ?? ''),
    categoria: listing.categoria || 'trike',
    ubicacion: listing.ubicacion || '',
    contacto_nombre: listing.contacto_nombre || '',
    contacto_email: listing.contacto_email || '',
    contacto_telefono: listing.contacto_telefono || '',
    imagenes: listing.imagenes || [],
  }
}

/**
 * Crear / editar una publicación de Clearance.
 * defaults: valores iniciales (p. ej. nombre y email del perfil).
 */
export default function ClearanceListingForm({ listing, defaults = {}, onSaved, onCancel }) {
  const [form, setForm] = useState(() => (listing ? listingToForm(listing) : { ...EMPTY, ...defaults }))
  const [uploading, setUploading] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  const remaining = CLEARANCE_MAX_PHOTOS - form.imagenes.length

  const handleFiles = async (e) => {
    const files = [...(e.target.files || [])].slice(0, remaining)
    e.target.value = ''
    if (!files.length) return
    setError('')
    setUploading((n) => n + files.length)
    for (const file of files) {
      try {
        const { url } = await api.clearance.uploadPhoto(file)
        setForm((f) => (f.imagenes.length >= CLEARANCE_MAX_PHOTOS ? f : { ...f, imagenes: [...f.imagenes, url] }))
      } catch (err) {
        setError(err?.detail || `Could not upload ${file.name}.`)
      } finally {
        setUploading((n) => n - 1)
      }
    }
  }

  const removePhoto = (url) => setForm((f) => ({ ...f, imagenes: f.imagenes.filter((u) => u !== url) }))
  const makeCover = (url) => setForm((f) => ({ ...f, imagenes: [url, ...f.imagenes.filter((u) => u !== url)] }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.imagenes.length) {
      setError('Add at least one photo.')
      return
    }
    if (!isGmail(form.contacto_email)) {
      setError('The contact email must be a Gmail address (@gmail.com).')
      return
    }
    const payload = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      precio: Number(form.precio),
      categoria: form.categoria,
      ubicacion: form.ubicacion.trim() || null,
      imagenes: form.imagenes,
      contacto_nombre: form.contacto_nombre.trim(),
      contacto_email: form.contacto_email.trim().toLowerCase(),
      contacto_telefono: form.contacto_telefono.trim() || null,
    }
    setSaving(true)
    try {
      const saved = listing
        ? await api.clearance.update(listing.id, payload)
        : await api.clearance.create(payload)
      onSaved?.(saved)
    } catch (err) {
      const detail = Array.isArray(err?.detail) ? err.detail.map((d) => d.msg).join(' ') : err?.detail
      setError(detail || 'Could not save your listing.')
    } finally {
      setSaving(false)
    }
  }

  const input = 'w-full p-3 border border-borderline rounded focus:border-brand focus:outline-none'
  const label = 'block text-sm font-semibold mb-1'

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-borderline rounded-lg p-6 space-y-5">
      <h2 className="font-black text-lg text-ink">{listing ? 'Edit listing' : 'New listing'}</h2>

      <div>
        <label className={label} htmlFor="cl-titulo">Title *</label>
        <input id="cl-titulo" name="titulo" value={form.titulo} onChange={set} required minLength={5} maxLength={150} placeholder="e.g. Vanguard V7 2022 with Rotax 582" className={input} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={label} htmlFor="cl-precio">Price (USD) *</label>
          <input id="cl-precio" name="precio" type="number" min={0} step="0.01" value={form.precio} onChange={set} required className={input} />
        </div>
        <div>
          <label className={label} htmlFor="cl-categoria">Category *</label>
          <select id="cl-categoria" name="categoria" value={form.categoria} onChange={set} className={input}>
            {CLEARANCE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="cl-ubicacion">Location</label>
          <input id="cl-ubicacion" name="ubicacion" value={form.ubicacion} onChange={set} maxLength={150} placeholder="City, country" className={input} />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="cl-descripcion">Description *</label>
        <textarea id="cl-descripcion" name="descripcion" value={form.descripcion} onChange={set} required minLength={20} maxLength={5000} rows={6} placeholder="Year, hours, engine, condition, what's included…" className={input} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={label}>Photos * <span className="font-normal text-ink2">({form.imagenes.length}/{CLEARANCE_MAX_PHOTOS})</span></span>
          {remaining > 0 && (
            <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline">
              <ImagePlus className="w-4 h-4" /> Add photos
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={handleFiles} />
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {form.imagenes.map((url, i) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-borderline bg-bg2 group">
              <SafeImage src={url} alt={`Photo ${i + 1}`} fill sizes="120px" className="object-cover" />
              {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-brand text-white text-[10px] font-bold px-1.5 py-0.5">Cover</span>}
              <div className="absolute top-1 right-1 flex gap-1">
                {i > 0 && (
                  <button type="button" onClick={() => makeCover(url)} className="rounded-full bg-white/90 p-1 text-ink hover:text-brand" aria-label="Use as cover">
                    <Star className="w-3.5 h-3.5" />
                  </button>
                )}
                <button type="button" onClick={() => removePhoto(url)} className="rounded-full bg-white/90 p-1 text-ink hover:text-red-600" aria-label="Remove photo">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {Array.from({ length: uploading }).map((_, i) => (
            <div key={`up-${i}`} className="aspect-square rounded-lg border border-dashed border-borderline flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-ink2" />
            </div>
          ))}
          {remaining > 0 && uploading === 0 && (
            <button type="button" onClick={() => fileRef.current?.click()} className="aspect-square rounded-lg border-2 border-dashed border-borderline flex flex-col items-center justify-center text-ink2 hover:border-brand hover:text-brand">
              <ImagePlus className="w-6 h-6" />
              <span className="text-[11px] mt-1">Upload</span>
            </button>
          )}
        </div>
        <p className="text-xs text-ink2 mt-2">JPEG, PNG or WebP, up to 8 MB each. Maximum {CLEARANCE_MAX_PHOTOS} photos. The first one is the cover.</p>
      </div>

      <fieldset className="border-t border-borderline pt-5">
        <legend className="font-black text-ink text-sm uppercase tracking-wide">Contact details</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
          <div>
            <label className={label} htmlFor="cl-nombre">Name *</label>
            <input id="cl-nombre" name="contacto_nombre" value={form.contacto_nombre} onChange={set} required minLength={2} maxLength={120} className={input} />
          </div>
          <div>
            <label className={label} htmlFor="cl-email">Gmail *</label>
            <input id="cl-email" name="contacto_email" type="email" value={form.contacto_email} onChange={set} required placeholder="you@gmail.com" className={input} />
          </div>
          <div>
            <label className={label} htmlFor="cl-tel">Phone / WhatsApp</label>
            <input id="cl-tel" name="contacto_telefono" value={form.contacto_telefono} onChange={set} maxLength={40} placeholder="+1 801 555 1234" className={input} />
          </div>
        </div>
      </fieldset>

      <p className="text-xs text-ink2 bg-bg2 rounded p-3">
        Wing Concept only connects buyers and sellers. Payment, inspection and delivery are agreed directly between you and the buyer.
      </p>

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving || uploading > 0} className="px-6 py-3 bg-brand text-white rounded font-bold hover:bg-brand/90 disabled:opacity-50">
          {saving ? 'Saving…' : listing ? 'Save changes' : 'Publish listing'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-6 py-3 border border-borderline rounded font-bold text-ink hover:border-brand">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
