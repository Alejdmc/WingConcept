'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'
import { api } from '@/lib/api'

/**
 * Admin image upload — sube a Supabase y actualiza lista de URLs.
 */
export default function ImageUploadField({
  images = [],
  onChange,
  productoId = null,
  label = 'Images',
  maxImages = 5,
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed.`)
      return
    }
    setUploading(true)
    setError('')
    try {
      const result = await api.admin.uploadImagen(file, productoId)
      onChange([...(images || []), result.url])
    } catch (err) {
      setError(err.detail || 'Error uploading image.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{label}</label>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      {images?.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {images.map((url, index) => (
            <div key={`${url}-${index}`} className="relative w-24 h-24 border border-borderline rounded overflow-hidden bg-bg2">
              <Image src={url} alt="" fill className="object-cover" sizes="96px" unoptimized />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                aria-label="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="inline-flex items-center gap-2 px-4 py-2 border border-borderline rounded cursor-pointer hover:border-brand">
        <Upload className="w-4 h-4" />
        {uploading ? 'Uploading...' : 'Upload image'}
        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>
    </div>
  )
}
