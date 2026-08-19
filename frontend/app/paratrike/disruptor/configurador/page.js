'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronLeft, ChevronRight, ShoppingCart, ArrowLeft, Check } from 'lucide-react'
import { resolveAccessoryImage } from '@/lib/accessoryImages'
import { PRODUCT_IDS } from '@/lib/products'
import { useCart } from '@/hooks/useCart'
import { useConfigOptions, useApplyConfigDefaults } from '@/hooks/useCms'
import WizardProgress from '@/components/configurator/WizardProgress'
import OptionImageGallery from '@/components/configurator/OptionImageGallery'
import { buildOptionGallery } from '@/lib/configuratorImages'
import {
  DISRUPTOR_TRIKE_BASE_PRICE,
  DISRUPTOR_TRIKE_GALLERY,
  DISRUPTOR_TRIKE_ACCESSORIES,
  DISRUPTOR_TRIKE_SUMMARY,
} from '@/lib/disruptorTrikeContent'

const DEFAULT_COLORS = [
  { id: 'white', name: 'White', hex: '#ffffff', price: 0 },
  { id: 'red-candy', name: 'Red Candy', hex: '#e74c3c', price: 0 },
  { id: 'blue-candy', name: 'Blue Candy', hex: '#3498db', price: 0 },
  { id: 'purple-candy', name: 'Purple Candy', hex: '#9b59b6', price: 0 },
]

const STEPS = ['Accessories', 'Review']

const DISRUPTOR_TRIKE_PRODUCTO_ID = PRODUCT_IDS.disruptorTrike

const PRODUCT_IMAGES = DISRUPTOR_TRIKE_GALLERY

export default function ConfiguratorDisruptorTrikePage() {
  const router = useRouter()
  const { addConfiguredProduct } = useCart()
  const { options, loading: optionsLoading, defaultSelections } = useConfigOptions(DISRUPTOR_TRIKE_PRODUCTO_ID, {
    engines: [],
    chassisTypes: [],
    chassisFinishes: [],
    propellers: [],
    colors: DEFAULT_COLORS,
    accessories: DISRUPTOR_TRIKE_ACCESSORIES,
  })
  const CONFIG_OPTIONS = {
    colors: options.colors,
    accessories: options.accessories,
  }
  const [step, setStep] = useState(0)
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0].id)
  const [selectedUpgrades, setSelectedUpgrades] = useState([])
  const [selectedChassisColor, setSelectedChassisColor] = useState(DEFAULT_COLORS[0].name)
  const [previewOption, setPreviewOption] = useState({ id: 'accessories', image: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const applyDefaults = useCallback((d) => {
    if (d.colorId) {
      setSelectedColor(d.colorId)
      const c = DEFAULT_COLORS.find((x) => x.id === d.colorId)
      if (c) setSelectedChassisColor(c.name)
    }
  }, [])

  useApplyConfigDefaults(defaultSelections, optionsLoading, applyDefaults)

  const accessories = CONFIG_OPTIONS.accessories

  const color = CONFIG_OPTIONS.colors.find((c) => c.id === selectedColor)
  const selectedAccessoryItems = accessories.filter((a) => selectedUpgrades.includes(a.id))

  const totalPrice = useMemo(() => {
    const base = DISRUPTOR_TRIKE_BASE_PRICE
    const colorPrice = color?.price || 0
    const upgradesPrice = selectedUpgrades.reduce(
      (sum, id) => sum + (CONFIG_OPTIONS.accessories.find((a) => a.id === id)?.price || 0),
      0,
    )
    return base + colorPrice + upgradesPrice
  }, [color, selectedUpgrades, CONFIG_OPTIONS.accessories])

  const previewGallery = useMemo(() => {
    if (!previewOption?.id) {
      return buildOptionGallery(null, null, PRODUCT_IMAGES)
    }
    const optionId = previewOption.id.startsWith('color-')
      ? previewOption.id.replace('color-', '')
      : previewOption.id
    const primary = previewOption.image
      || (previewOption.id.startsWith('color-')
        ? `/images/disruptor/colors/${optionId}-1.jpg`
        : undefined)
    return buildOptionGallery(optionId, primary, PRODUCT_IMAGES)
  }, [previewOption])

  const selectColor = (colorOption) => {
    setSelectedColor(colorOption.id)
    setSelectedChassisColor(colorOption.name)
    setPreviewOption({
      id: `color-${colorOption.id}`,
      image: `/images/disruptor/colors/${colorOption.id}-1.jpg`,
    })
  }

  const toggleUpgrade = (id) => {
    setSelectedUpgrades((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
    const acc = CONFIG_OPTIONS.accessories.find((a) => a.id === id)
    setPreviewOption({
      id,
      image: resolveAccessoryImage(id, acc?.image, DISRUPTOR_TRIKE_PRODUCTO_ID),
    })
  }

  useEffect(() => {
    if (step === 0) {
      const lastId = selectedUpgrades[selectedUpgrades.length - 1]
      if (lastId) {
        const acc = CONFIG_OPTIONS.accessories.find((a) => a.id === lastId)
        setPreviewOption({
          id: lastId,
          image: resolveAccessoryImage(lastId, acc?.image, DISRUPTOR_TRIKE_PRODUCTO_ID),
        })
      } else {
        setPreviewOption({ id: 'accessories', image: null })
      }
    }
  }, [step, selectedUpgrades, CONFIG_OPTIONS.accessories])

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const goPrev = () => setStep((s) => Math.max(s - 1, 0))

  const handleAddToCart = async () => {
    setLoading(true)
    setError('')

    try {
      await addConfiguredProduct({
        producto_id: DISRUPTOR_TRIKE_PRODUCTO_ID,
        cantidad: 1,
        color: selectedColor,
        colorId: selectedColor,
        chassisColor: selectedChassisColor,
        upgrades: selectedUpgrades,
        totalPrice,
      })
      router.push('/cart')
    } catch (err) {
      setError(err.detail || err.message || 'Error adding to cart. Please try again.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky-below-nav bg-white border-b border-borderline py-4 sm:py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/paratrike/disruptor"
            className="group inline-flex items-center gap-2 pl-2 pr-4 py-2 rounded-full border border-borderline bg-white text-ink text-sm font-bold uppercase tracking-wide hover:border-brand hover:text-brand hover:bg-brand-soft transition-all">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-bg2 group-hover:bg-brand transition-colors">
              <ArrowLeft className="w-4 h-4 text-ink2 group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
            </span>
            Back
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-ink">Trike Disruptor</h1>
          <p className="text-xl text-ink2 mt-2">{DISRUPTOR_TRIKE_SUMMARY.tagline}</p>
          <p className="text-ink2 mt-4 max-w-3xl leading-relaxed">{DISRUPTOR_TRIKE_SUMMARY.body}</p>
        </div>

        <WizardProgress steps={STEPS} currentStep={step} onStepClick={setStep} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6">

            <OptionImageGallery images={previewGallery} />

            <div className="space-y-4">
              <details className="group border border-borderline rounded-xl p-4 hover:border-brand/50 transition" open>
                <summary className="flex justify-between items-center cursor-pointer font-bold uppercase tracking-wide text-ink">
                  Chassis Color
                  <ChevronDown className="group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 flex gap-3 flex-wrap">
                  {CONFIG_OPTIONS.colors.map((c) => (
                    <motion.button
                      key={c.id}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => selectColor(c)}
                      className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center
                        ${selectedColor === c.id ? 'border-brand scale-110' : 'border-borderline hover:border-brand/50'}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}>
                      {selectedColor === c.id && (
                        <Check className={`w-5 h-5 drop-shadow ${c.hex === '#ffffff' ? 'text-ink' : 'text-white'}`} />
                      )}
                    </motion.button>
                  ))}
                </div>
              </details>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8">

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                {step === 0 && (
                  <ConfigSection title="Accessories. Enhance Your Flight">
                    <p className="text-ink2 mb-6 leading-relaxed">
                      Harnesses are sold separately. Add optional accessories below — photos update in the gallery as you select each item.
                    </p>
                    <div className="space-y-3">
                      {accessories.map((a) => {
                        const isSelected = selectedUpgrades.includes(a.id)
                        return (
                          <OptionCard key={a.id} selected={isSelected} onClick={() => toggleUpgrade(a.id)}>
                            <div className="flex justify-between items-center pr-8">
                              <p className="font-bold uppercase text-ink">{a.name}</p>
                              <p className="font-semibold text-ink2">
                                +${a.price.toLocaleString(undefined, { minimumFractionDigits: a.price % 1 === 0 ? 0 : 2 })}
                              </p>
                            </div>
                            {a.description && <p className="text-sm text-ink2 mt-2 leading-relaxed">{a.description}</p>}
                          </OptionCard>
                        )
                      })}
                    </div>
                    <p className="text-sm text-ink2 mt-4">
                      Looking for individual parts (axles, harnesses, forks...)? Visit{' '}
                      <Link href="/parts" className="text-brand font-bold hover:underline">parts</Link>.
                    </p>
                  </ConfigSection>
                )}

                {step === 1 && (
                  <ConfigSection title="Review & Purchase">
                    <div className="space-y-3 text-sm">
                      <SummaryRow label="Color" value={color?.name} price={color?.price} />
                      {selectedAccessoryItems.length > 0 && (
                        <div className="pt-2">
                          <p className="font-bold uppercase text-ink2 text-xs tracking-wide mb-1">Accessories</p>
                          {selectedAccessoryItems.map((a) => <SummaryRow key={a.id} label={a.name} price={a.price} />)}
                        </div>
                      )}
                    </div>
                  </ConfigSection>
                )}
              </motion.div>
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                {error}
              </motion.div>
            )}

            <motion.div layout className="bg-brand-soft border-2 border-brand rounded-xl p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-brand/80 mb-2">Total Price</p>
              <motion.p
                key={totalPrice}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-black text-brand">
                ${totalPrice.toLocaleString()}
              </motion.p>
              <p className="text-xs text-brand/70 mt-2">Base trike ${DISRUPTOR_TRIKE_BASE_PRICE.toLocaleString()} — harnesses not included.</p>
            </motion.div>

            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={goPrev}
                disabled={step === 0}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border-2 border-borderline text-ink font-bold uppercase tracking-wide text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand hover:text-brand transition-all">
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-brand text-white font-bold uppercase tracking-wide text-sm hover:bg-brand/90 transition-all">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand text-white font-black uppercase tracking-wide text-sm hover:bg-brand/90 disabled:opacity-50 transition-all">
                  <ShoppingCart className="w-4 h-4" />
                  {loading ? 'Adding to cart...' : 'Add to Cart'}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function ConfigSection({ title, children }) {
  return (
    <div>
      <h2 className="text-2xl font-black uppercase text-ink mb-6 tracking-tight">{title}</h2>
      {children}
    </div>
  )
}

function OptionCard({ selected, onClick, children }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full p-4 border-2 rounded-xl text-left transition-all
        ${selected ? 'border-green-600 bg-green-50' : 'border-borderline hover:border-brand/50'}`}>
      {selected && (
        <span className="absolute top-3 right-3 flex items-center justify-center w-5 h-5 rounded-full bg-green-600">
          <Check className="w-3 h-3 text-white" />
        </span>
      )}
      {children}
    </motion.button>
  )
}

function SummaryRow({ label, value, price }) {
  return (
    <div className="flex justify-between items-start gap-3 py-1 border-b border-borderline/60">
      <span className="text-ink2 min-w-0 pr-2 break-words">{value ? `${label} — ${value}` : label}</span>
      {typeof price === 'number' && (
        <span className="font-semibold text-ink">{price === 0 ? 'Included' : `+$${price.toLocaleString()}`}</span>
      )}
    </div>
  )
}
