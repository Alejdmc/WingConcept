'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Check, ExternalLink, ShoppingCart } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'
import { useCart } from '@/hooks/useCart'
import { loadParaglidersPageCatalog } from '@/lib/loadParaglidersCatalog'
import { resolveParagliderColorLabel } from '@/lib/trikeParagliderOptions'
import {
  PARAGLIDER_TABS,
  PARAGLIDER_EXAMPLE,
  PG_FREE_WINGS,
  PARAGLIDER_ACCESSORIES,
} from '@/lib/paraglidersContent'

export default function ParaglidersPage() {
  const [activeTab, setActiveTab] = useState('ppg')
  const [ppgWings, setPpgWings] = useState([])
  const [trikeWings, setTrikeWings] = useState([])
  const [harnesses, setHarnesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const catalog = await loadParaglidersPageCatalog()
        if (cancelled) return
        setPpgWings(catalog.ppgWings)
        setTrikeWings(catalog.trikeWings)
        setHarnesses(catalog.harnesses)
        setUsingFallback(!catalog.fromApi)
      } catch {
        if (cancelled) return
        setPpgWings([])
        setTrikeWings([])
        setHarnesses([])
        setUsingFallback(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const trikeOnlyWings = trikeWings.filter((w) => !ppgWings.some((p) => p.id === w.id))

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky-below-nav bg-white border-b border-borderline py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 pl-2 pr-4 py-2 rounded-full border border-borderline bg-white text-ink text-sm font-bold uppercase tracking-wide hover:border-brand hover:text-brand hover:bg-brand-soft transition-all">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-bg2 group-hover:bg-brand transition-colors">
              <ArrowLeft className="w-4 h-4 text-ink2 group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
            </span>
            Back
          </Link>
        </div>
      </div>

      <section className="py-16 px-6 bg-gradient-to-b from-bg2 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-brand font-bold uppercase tracking-[0.3em] text-sm mb-4">Wings & Gear</p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase text-ink tracking-tight mb-4">Paragliders</h1>
          <div className="h-1 w-16 bg-brand mx-auto mb-6" />
          <p className="text-lg text-ink2 max-w-2xl mx-auto">
            Order wings and gear separately — same catalog as the configurador, with direct add-to-cart checkout like Parts & Accessories.
          </p>
          {usingFallback && (
            <p className="text-sm text-amber-700 mt-4">
              Live catalog unavailable — showing reference list with catalog IDs for cart.
            </p>
          )}
        </div>
      </section>

      <section className="py-8 px-6 border-b border-borderline bg-white sticky-below-nav z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-2">
          {PARAGLIDER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide transition-all ${
                activeTab === tab.id
                  ? 'bg-brand text-white'
                  : 'bg-bg2 text-ink2 hover:text-brand hover:bg-brand-soft border border-borderline'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          {loading && (
            <p className="text-sm text-ink2 mb-8">Loading catalog...</p>
          )}

          {PARAGLIDER_TABS.filter((t) => t.id === activeTab).map((tab) => (
            <motion.div key={tab.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-ink2 text-lg mb-10 max-w-3xl">{tab.description}</p>

              {activeTab === 'pg-free' && (
                <WingGrid items={PG_FREE_WINGS.map((w) => ({ ...w, category: 'PG Free' }))} />
              )}

              {activeTab === 'ppg' && (
                <>
                  <div className="mb-8 p-4 bg-brand-soft border border-brand/30 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="text-sm text-ink">
                      <span className="font-bold">Add wings directly to cart</span> — or bundle with a full Disruptor Paramotor build in the configurador.
                    </p>
                    <Link
                      href="/paramotors/disruptor/configurador"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-bold uppercase hover:bg-brand/90 transition shrink-0">
                      <ShoppingCart className="w-4 h-4" /> Configure Paramotor
                    </Link>
                  </div>
                  <WingGrid items={ppgWings} showConfiguratorLink />
                  <h2 className="text-xl font-black uppercase text-ink mt-16 mb-6">Also on Trike Configurators</h2>
                  <p className="text-ink2 mb-6 max-w-2xl">These wings are also available when configuring Vanguard, Nomadic, or Disruptor Trike.</p>
                  <WingGrid items={trikeOnlyWings} />
                </>
              )}

              {activeTab === 'harnesses' && (
                <>
                  <ExampleCard product={PARAGLIDER_EXAMPLE} />
                  <h2 className="text-xl font-black uppercase text-ink mt-12 mb-6">Harness Catalog</h2>
                  <HarnessGrid items={harnesses} />
                </>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16 px-6 bg-bg2">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-black uppercase text-ink mb-8 text-center">Accessories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PARAGLIDER_ACCESSORIES.map((item) => (
              <div key={item.name} className="bg-white border border-borderline rounded-xl p-6 hover:border-brand transition">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-black uppercase text-ink">{item.name}</h3>
                  <span className="text-sm font-bold text-brand shrink-0">{item.priceLabel}</span>
                </div>
                <p className="text-ink2 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-gradient-to-r from-brand to-brand/80 text-white text-center">
        <h2 className="text-2xl sm:text-4xl font-black uppercase mb-4">Need a Wing Quote?</h2>
        <p className="text-white/90 mb-8 max-w-xl mx-auto">
          Add wings to your cart below, configure a full paramotor build, or contact us for PG Free models and harness fitment.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/paramotors/disruptor/configurador" className="inline-block bg-white text-brand px-8 py-4 font-black uppercase tracking-widest rounded-lg hover:bg-white/90 transition">
            Configure Paramotor
          </Link>
          <Link href="/contact" className="inline-block border-2 border-white text-white px-8 py-4 font-black uppercase tracking-widest rounded-lg hover:bg-white/10 transition">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  )
}

function WingGrid({ items, showConfiguratorLink = false }) {
  if (!items.length) {
    return <p className="text-ink2">No wings listed yet.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <WingCard key={item.id || item.name} item={item} showConfiguratorLink={showConfiguratorLink} />
      ))}
    </div>
  )
}

function WingCard({ item, showConfiguratorLink }) {
  const { addToCart } = useCart()
  const [status, setStatus] = useState('idle')
  const [addError, setAddError] = useState('')
  const colors = item.colors?.length ? item.colors : []
  const sizes = item.sizes?.length ? item.sizes : ['Standard']
  const [colorId, setColorId] = useState(colors[0]?.id || 'standard')
  const [size, setSize] = useState(sizes[0] || 'Standard')

  const hasPrice = typeof item.price === 'number' && item.price > 0
  const canAddToCart = Boolean(item.productoId) && hasPrice
  const price = item.priceLabel || (hasPrice ? `$${item.price.toLocaleString()}` : 'Contact for price')
  const showColorPicker = colors.length > 1
  const showSizePicker = sizes.length > 1 || (sizes.length === 1 && sizes[0] !== 'Standard')

  const handleAdd = async () => {
    if (!item.productoId) return
    setStatus('loading')
    setAddError('')
    try {
      const configuracion = {}
      if (colorId) configuracion.paragliderColor = colorId
      if (size) configuracion.paragliderSize = size
      await addToCart({
        producto_id: item.productoId,
        cantidad: 1,
        configuracion: Object.keys(configuracion).length ? configuracion : undefined,
      })
      setStatus('added')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      setAddError(err?.detail || 'Could not add to cart.')
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  return (
    <div className="bg-bg2 border border-borderline rounded-xl overflow-hidden hover:border-brand transition group flex flex-col">
      <div className="relative aspect-[4/3] bg-white">
        <SafeImage
          src={item.image || '/images/front1.jpg'}
          alt={`${item.brand || ''} ${item.name}`.trim()}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wide text-brand mb-1">{item.category || item.brand}</p>
        <h3 className="font-black uppercase text-ink">{item.brand ? `${item.brand} ${item.name}` : item.name}</h3>
        {item.description && <p className="text-ink2 text-sm mt-2 leading-relaxed line-clamp-3">{item.description}</p>}
        <p className="text-lg font-black text-brand mt-3">{price}</p>

        {canAddToCart && showColorPicker && (
          <label className="mt-3 block">
            <span className="text-[10px] font-bold uppercase tracking-wide text-ink2">Color</span>
            <select
              value={colorId}
              onChange={(e) => setColorId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-borderline bg-white px-3 py-2 text-sm text-ink">
              {colors.map((c) => (
                <option key={c.id} value={c.id}>{c.name || resolveParagliderColorLabel(item, c.id) || c.id}</option>
              ))}
            </select>
          </label>
        )}

        {canAddToCart && showSizePicker && (
          <label className="mt-3 block">
            <span className="text-[10px] font-bold uppercase tracking-wide text-ink2">Size</span>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="mt-1 w-full rounded-lg border border-borderline bg-white px-3 py-2 text-sm text-ink">
              {sizes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          {item.infoUrl && (
            <a href={item.infoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold uppercase text-brand hover:underline">
              More info <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {showConfiguratorLink && item.configuratorHref && (
            <Link href={item.configuratorHref} className="inline-flex items-center gap-1 text-xs font-bold uppercase text-ink hover:text-brand">
              Add in configurador →
            </Link>
          )}
        </div>

        {canAddToCart ? (
          <button
            type="button"
            onClick={handleAdd}
            disabled={status === 'loading'}
            className="mt-4 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand text-white font-black uppercase tracking-wide text-xs hover:bg-brand/90 disabled:opacity-50 transition-all w-full">
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
            className="mt-4 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-bg2 text-ink2 font-black uppercase tracking-wide text-xs w-full cursor-not-allowed">
            <ShoppingCart className="w-4 h-4 opacity-50" />
            Unavailable
          </button>
        ) : (
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg border border-brand text-brand font-black uppercase tracking-wide text-xs hover:bg-brand-soft transition-all w-full">
            Contact Us
          </Link>
        )}

        {status === 'error' && canAddToCart && (
          <p className="text-red-600 text-xs font-semibold mt-2">{addError || 'Could not add to cart.'}</p>
        )}
      </div>
    </div>
  )
}

function HarnessGrid({ items }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <HarnessCard key={item.name} item={item} />
      ))}
    </div>
  )
}

function HarnessCard({ item }) {
  const { addToCart } = useCart()
  const [status, setStatus] = useState('idle')
  const [addError, setAddError] = useState('')
  const hasPrice = typeof item.price === 'number' && item.price > 0
  const canAddToCart = Boolean(item.productoId) && hasPrice

  const handleAdd = async () => {
    if (!item.productoId) return
    setStatus('loading')
    setAddError('')
    try {
      await addToCart({ producto_id: item.productoId, cantidad: 1 })
      setStatus('added')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      setAddError(err?.detail || 'Could not add to cart.')
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  return (
    <div className="bg-bg2 border border-borderline rounded-xl p-5 hover:border-brand transition flex flex-col">
      <p className="text-[10px] font-bold uppercase tracking-wide text-brand mb-1">{item.brand}</p>
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-black uppercase text-ink">{item.name}</h3>
        <span className="text-sm font-bold text-brand shrink-0">{item.priceLabel}</span>
      </div>
      <p className="text-ink2 text-sm mt-2 leading-relaxed flex-1">{item.description}</p>
      {item.productUrl && (
        <a href={item.productUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold uppercase text-brand mt-3 hover:underline">
          More info <ExternalLink className="w-3 h-3" />
        </a>
      )}

      {canAddToCart ? (
        <button
          type="button"
          onClick={handleAdd}
          disabled={status === 'loading'}
          className="mt-4 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand text-white font-black uppercase tracking-wide text-xs hover:bg-brand/90 disabled:opacity-50 transition-all w-full">
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
          className="mt-4 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-bg2 text-ink2 font-black uppercase tracking-wide text-xs w-full cursor-not-allowed">
          <ShoppingCart className="w-4 h-4 opacity-50" />
          Unavailable
        </button>
      ) : (
        <Link
          href="/contact"
          className="mt-4 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg border border-brand text-brand font-black uppercase tracking-wide text-xs hover:bg-brand-soft transition-all w-full">
          Contact Us
        </Link>
      )}

      {status === 'error' && canAddToCart && (
        <p className="text-red-600 text-xs font-semibold mt-2">{addError || 'Could not add to cart.'}</p>
      )}
    </div>
  )
}

function ExampleCard({ product }) {
  return (
    <div className="bg-bg2 border-2 border-brand/30 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-0">
      <div className="relative aspect-square lg:aspect-auto min-h-[280px] bg-white">
        <SafeImage src={product.images[0]} alt={product.name} fill className="object-cover" />
      </div>
      <div className="p-8 flex flex-col justify-center">
        <p className="text-brand font-bold uppercase tracking-widest text-xs mb-2">Featured harness</p>
        <h2 className="text-2xl font-black uppercase text-ink mb-2">{product.brand} {product.name}</h2>
        <p className="text-ink2 leading-relaxed mb-6">{product.description}</p>
        <p className="text-xl font-black text-brand mb-6">{product.priceLabel}</p>
        <div className="flex flex-wrap gap-3">
          {product.productUrl && (
            <a href={product.productUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-bold uppercase hover:bg-brand/90 transition">
              More info <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {product.specUrl && (
            <a href={product.specUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand text-brand text-sm font-bold uppercase hover:bg-brand-soft transition">
              Spec sheet <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
