'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Check, Package } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { PARTS } from '@/lib/parts'

const MODEL_LABEL = { vanguard: 'Vanguard', nomadic: 'Nomadic' }

export default function PartsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-40 bg-white border-b border-borderline py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/paratrike"
            className="group inline-flex items-center gap-2 pl-2 pr-4 py-2 rounded-full border border-borderline bg-white text-ink text-sm font-bold uppercase tracking-wide hover:border-brand hover:text-brand hover:bg-brand-soft transition-all">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-bg2 group-hover:bg-brand transition-colors">
              <ArrowLeft className="w-4 h-4 text-ink2 group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
            </span>
            Back
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-ink">Parts</h1>
          <p className="text-xl text-ink2 mt-2">Repuestos y componentes estructurales para Vanguard y Nomadic</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PARTS.map((part) => (
            <PartCard key={part.id} part={part} />
          ))}
        </div>
      </div>
    </div>
  )
}

function PartCard({ part }) {
  const { addToCart } = useCart()
  const [status, setStatus] = useState('idle') // idle | loading | added | error
  const [imgError, setImgError] = useState(false)

  const handleAdd = async () => {
    setStatus('loading')
    try {
      await addToCart({ producto_id: part.productoId, cantidad: 1 })
      setStatus('added')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4 }}
      className="border-2 border-borderline rounded-xl overflow-hidden hover:border-brand/50 transition-all flex flex-col">
      <div className="relative aspect-square bg-bg2">
        {!imgError ? (
          <Image
            src={part.image}
            alt={part.name}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-ink2/40" />
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex flex-wrap gap-2 mb-3">
          {part.compatibleWith.map((m) => (
            <span key={m} className="text-[11px] font-bold uppercase tracking-wide text-brand bg-brand-soft px-2 py-1 rounded-full">
              {MODEL_LABEL[m] || m}
            </span>
          ))}
        </div>

        <p className="font-bold uppercase text-ink flex-1">{part.name}</p>
        <p className="text-2xl font-black text-brand mt-3 mb-4">${part.price.toLocaleString()}</p>

        <button
          type="button"
          onClick={handleAdd}
          disabled={status === 'loading'}
          className="inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-brand text-white font-black uppercase tracking-wide text-sm hover:bg-brand/90 disabled:opacity-50 transition-all">
          {status === 'added' ? (
            <>
              <Check className="w-4 h-4" /> Added
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              {status === 'loading' ? 'Adding...' : 'Add to Cart'}
            </>
          )}
        </button>

        {status === 'error' && (
          <p className="text-red-600 text-xs font-semibold mt-2">Error adding to cart. Try again.</p>
        )}
      </div>
    </motion.div>
  )
}
