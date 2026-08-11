'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Check } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'
import { FALLBACK_IMAGES } from '@/lib/imageDefaults'
import { useCart } from '@/hooks/useCart'
import { api } from '@/lib/api'
import { PARTS as STATIC_PARTS } from '@/lib/parts'
import { ACCESSORIES as STATIC_ACCESSORIES } from '@/lib/accessories'

const MODEL_LABEL = { vanguard: 'Vanguard', nomadic: 'Nomadic' }

function parsePrice(item) {
  if (typeof item.precio_desde === 'number') return item.precio_desde
  if (typeof item.price === 'number') return item.price
  if (typeof item.price === 'string') {
    const n = parseFloat(item.price.replace(/[^0-9.]/g, ''))
    return Number.isFinite(n) ? n : null
  }
  return null
}

function mapApiProduct(item) {
  const price = parsePrice(item)
  return {
    id: item.id,
    productoId: item.id,
    name: item.name || item.nombre,
    price,
    image: item.image || item.imagenes?.[0] || '/images/logo.png',
    description: item.desc || item.descripcion_corta || item.descripcion || '',
    compatibleWith: item.compatible_with?.length ? item.compatible_with : ['vanguard', 'nomadic'],
  }
}

function mapStaticItem(item) {
  return {
    ...item,
    productoId: item.productoId || null,
  }
}

export default function PartsPage() {
  const [parts, setParts] = useState(() => STATIC_PARTS.map(mapStaticItem))
  const [accessories, setAccessories] = useState(() => STATIC_ACCESSORIES.map(mapStaticItem))
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('static')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [partsRes, accRes] = await Promise.all([
          api.productos.listar({ categoria: 'repuestos', por_pagina: 50 }),
          api.productos.listar({ categoria: 'accesorios', por_pagina: 50 }),
        ])
        const apiParts = (partsRes.items || []).map(mapApiProduct)
        const apiAcc = (accRes.items || []).map(mapApiProduct)

        if (apiParts.length > 0 || apiAcc.length > 0) {
          setParts(apiParts)
          setAccessories(apiAcc)
          setSource('api')
        } else {
          setParts(STATIC_PARTS.map(mapStaticItem))
          setAccessories(STATIC_ACCESSORIES.map(mapStaticItem))
          setSource('static')
        }
      } catch {
        setParts(STATIC_PARTS.map(mapStaticItem))
        setAccessories(STATIC_ACCESSORIES.map(mapStaticItem))
        setSource('static')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky-below-nav bg-white border-b border-borderline py-6 px-6">
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
          {source === 'static' && !loading && (
            <p className="text-sm text-amber-700 mt-2">Could not load products from the server. Add items in Admin → Parts &amp; Accessories or run the parts seed script.</p>
          )}
        </div>

        {loading && (
          <p className="text-sm text-ink2 mb-4">Updating catalog...</p>
        )}

        <>
          <section className="mb-16">
              <h2 className="text-xl font-black uppercase tracking-tight text-ink mb-6">Parts</h2>
              {parts.length === 0 ? (
                <p className="text-ink2">No parts listed yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {parts.map((part) => (
                    <PartCard key={part.productoId || part.id} part={part} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-ink mb-6">Accessories</h2>
              {accessories.length === 0 ? (
                <p className="text-ink2">No accessories listed yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {accessories.map((accessory) => (
                    <PartCard key={accessory.productoId || accessory.id} part={accessory} />
                  ))}
                </div>
              )}
            </section>
        </>
      </div>
    </div>
  )
}

function PartCard({ part }) {
  const { addToCart } = useCart()
  const [status, setStatus] = useState('idle')
  const hasPrice = typeof part.price === 'number'
  const canAddToCart = Boolean(part.productoId) && hasPrice

  const handleAdd = async () => {
    if (!part.productoId) return
    setStatus('loading')
    try {
      await addToCart({ producto_id: part.productoId, cantidad: 1 })
      setStatus('added')
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
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
        <SafeImage
          src={part.image}
          alt={part.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          className="object-contain p-3"
          fallbackSrc={FALLBACK_IMAGES.part}
          unoptimized={part.image?.startsWith('http')}
        />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {(part.compatibleWith || []).map((m) => (
            <span key={m} className="text-[10px] font-bold uppercase tracking-wide text-brand bg-brand-soft px-2 py-0.5 rounded-full">
              {MODEL_LABEL[m] || m}
            </span>
          ))}
        </div>

        <p className="text-sm font-bold uppercase text-ink">{part.name}</p>
        {part.description && (
          <p className="text-xs text-ink2 mt-1.5 line-clamp-3 flex-1">{part.description}</p>
        )}
        {hasPrice ? (
          <p className="text-xl font-black text-brand mt-2 mb-3">${part.price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
        ) : (
          <p className="text-xl font-black text-ink2 mt-2 mb-3">Price on request</p>
        )}

        {canAddToCart ? (
          <button
            type="button"
            onClick={handleAdd}
            disabled={status === 'loading'}
            className="mt-auto inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand text-white font-black uppercase tracking-wide text-xs hover:bg-brand/90 disabled:opacity-50 transition-all w-full">
            {status === 'added' ? (
              <>
                <Check className="w-4 h-4" /> Added
              </>
            ) : status === 'error' ? (
              <>Try again</>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                {status === 'loading' ? 'Adding...' : 'Add to Cart'}
              </>
            )}
          </button>
        ) : hasPrice ? (
          <button
            type="button"
            disabled
            className="mt-auto inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-bg2 text-ink2 font-black uppercase tracking-wide text-xs w-full cursor-not-allowed"
            title="Product not linked yet">
            <ShoppingCart className="w-4 h-4 opacity-50" />
            Unavailable
          </button>
        ) : (
          <Link
            href="/contact"
            className="mt-auto inline-flex items-center justify-center gap-2 py-2.5 rounded-lg border border-brand text-brand font-black uppercase tracking-wide text-xs hover:bg-brand-soft transition-all w-full">
            Contact Us
          </Link>
        )}

        {status === 'error' && canAddToCart && (
          <p className="text-red-600 text-xs font-semibold mt-2">Could not add to cart. Check that the backend is running.</p>
        )}
      </div>
    </motion.div>
  )
}
