'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Check, Package } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { PARTS } from '@/lib/parts'
import { ACCESSORIES } from '@/lib/accessories'

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
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-ink">Parts & Accessories</h1>
          <p className="text-xl text-ink2 mt-2">Structural parts and accessories sold separately for Vanguard and Nomadic</p>
        </div>

        <section className="mb-16">
          <h2 className="text-xl font-black uppercase tracking-tight text-ink mb-6">Parts</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {PARTS.map((part) => (
              <PartCard key={part.id} part={part} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-ink mb-6">Accessories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {ACCESSORIES.map((accessory) => (
              <PartCard key={accessory.id} part={accessory} />
            ))}
          </div>
        </section>
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
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            className="object-contain p-3"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-ink2/40" />
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {part.compatibleWith.map((m) => (
            <span key={m} className="text-[10px] font-bold uppercase tracking-wide text-brand bg-brand-soft px-2 py-0.5 rounded-full">
              {MODEL_LABEL[m] || m}
            </span>
          ))}
        </div>

        <p className="text-sm font-bold uppercase text-ink">{part.name}</p>
        {part.description && (
          <p className="text-xs text-ink2 mt-1.5 line-clamp-3 flex-1">{part.description}</p>
        )}
        <p className="text-xl font-black text-brand mt-2 mb-3">${part.price.toLocaleString()}</p>

        <button
          type="button"
          onClick={handleAdd}
          disabled={status === 'loading'}
          className="inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand text-white font-black uppercase tracking-wide text-xs hover:bg-brand/90 disabled:opacity-50 transition-all">
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
