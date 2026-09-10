'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, ShoppingCart, ArrowLeft } from 'lucide-react'
import { resolveAccessoryImage } from '@/lib/accessoryImages'
import { PRODUCT_IDS } from '@/lib/products'
import { useCart } from '@/hooks/useCart'
import { useConfigOptions, useApplyConfigDefaults } from '@/hooks/useCms'
import WizardProgress from '@/components/configurator/WizardProgress'
import OptionImageGallery from '@/components/configurator/OptionImageGallery'
import QuoteButton from '@/components/configurator/QuoteButton'
import ChassisColorStep from '@/components/configurator/ChassisColorStep'
import ParagliderStep from '@/components/configurator/ParagliderStep'
import ParagliderPreviewPanel from '@/components/configurator/ParagliderPreviewPanel'
import OptionCard from '@/components/configurator/OptionCard'
import ConfigSection from '@/components/configurator/ConfigSection'
import SummaryRow from '@/components/configurator/SummaryRow'
import { buildOptionGallery, normalizeGallery } from '@/lib/configuratorImages'
import { useParagliderConfigurator } from '@/hooks/useParagliderConfigurator'
import { NO_PARAGLIDER_ID, paragliderDisplayName, resolveParagliderColorLabel } from '@/lib/trikeParagliderOptions'
import { QUOTE_PRODUCT_NAMES } from '@/lib/quoteEmail'
import {
  CHASSIS_COLOR_PRESETS,
  CUSTOM_COLOR_ID,
  chassisColorSurcharge,
  resolveChassisColorLabel,
} from '@/lib/chassisColors'
import {
  DISRUPTOR_TRIKE_BASE_PRICE,
  DISRUPTOR_TRIKE_GALLERY,
  DISRUPTOR_TRIKE_HERO,
  DISRUPTOR_TRIKE_ACCESSORIES,
  DISRUPTOR_TRIKE_CHASSIS_FINISHES,
  DISRUPTOR_TRIKE_SUMMARY,
} from '@/lib/disruptorTrikeContent'

const STEPS = ['Color', 'Chassis', 'Paraglider', 'Accessories', 'Review']
const PARAGLIDER_STEP = 2

const DISRUPTOR_TRIKE_PRODUCTO_ID = PRODUCT_IDS.disruptorTrike
const selectedEngine = 'no-engine'
const selectedPropeller = 'no-propeller'

const PRODUCT_IMAGES = DISRUPTOR_TRIKE_GALLERY

function formatOptionPrice(price) {
  if (price === 0) return 'Included'
  return `+$${price.toLocaleString(undefined, { minimumFractionDigits: price % 1 === 0 ? 0 : 2 })}`
}

export default function ConfiguratorDisruptorTrikePage() {
  const router = useRouter()
  const { addConfiguredProduct } = useCart()
  const { options, loading: optionsLoading, defaultSelections } = useConfigOptions(DISRUPTOR_TRIKE_PRODUCTO_ID, {
    engines: [],
    chassisTypes: [],
    chassisFinishes: DISRUPTOR_TRIKE_CHASSIS_FINISHES,
    propellers: [],
    colors: [],
    accessories: DISRUPTOR_TRIKE_ACCESSORIES,
  })
  const CONFIG_OPTIONS = {
    chassisFinishes: options.chassisFinishes?.length ? options.chassisFinishes : DISRUPTOR_TRIKE_CHASSIS_FINISHES,
    accessories: options.accessories,
  }
  const [step, setStep] = useState(0)
  const [selectedColorId, setSelectedColorId] = useState(CHASSIS_COLOR_PRESETS[0].id)
  const [customColorText, setCustomColorText] = useState('')
  const [selectedFinish, setSelectedFinish] = useState(DISRUPTOR_TRIKE_CHASSIS_FINISHES[0].id)
  const [selectedUpgrades, setSelectedUpgrades] = useState([])
  const [previewOption, setPreviewOption] = useState({
    id: `color-${CHASSIS_COLOR_PRESETS[0].id}`,
    image: DISRUPTOR_TRIKE_HERO,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const {
    selectedParagliderId,
    setSelectedParagliderId,
    selectedParagliderColor,
    setSelectedParagliderColor,
    selectedParagliderSize,
    setSelectedParagliderSize,
    paraglider,
    paragliderPrice,
    validateParaglider,
    paragliderCartFields,
    appendParagliderQuoteLines,
    getParagliderPreviewGallery,
  } = useParagliderConfigurator()

  const applyDefaults = useCallback((d) => {
    if (d.finishId) setSelectedFinish(d.finishId)
  }, [])

  useApplyConfigDefaults(defaultSelections, optionsLoading, applyDefaults)

  const accessories = CONFIG_OPTIONS.accessories

  const finish = CONFIG_OPTIONS.chassisFinishes.find((f) => f.id === selectedFinish)
  const selectedAccessoryItems = accessories.filter((a) => selectedUpgrades.includes(a.id))

  const totalPrice = useMemo(() => {
    const base = DISRUPTOR_TRIKE_BASE_PRICE
    const colorPrice = chassisColorSurcharge(selectedColorId)
    const finishPrice = finish?.price || 0
    const upgradesPrice = selectedUpgrades.reduce(
      (sum, id) => sum + (CONFIG_OPTIONS.accessories.find((a) => a.id === id)?.price || 0),
      0,
    )
    return base + colorPrice + finishPrice + paragliderPrice + upgradesPrice
  }, [finish, paragliderPrice, selectedUpgrades, CONFIG_OPTIONS.accessories, selectedColorId])

  const colorLabel = resolveChassisColorLabel(selectedColorId, customColorText)

  const quoteDetails = useMemo(() => {
    const lines = []
    if (colorLabel) lines.push(`Chassis color: ${colorLabel}`)
    if (finish?.name) lines.push(`Chassis: ${finish.name}`)
    appendParagliderQuoteLines(lines)
    if (selectedAccessoryItems.length > 0) {
      lines.push(`Accessories: ${selectedAccessoryItems.map((a) => a.name).join(', ')}`)
    }
    lines.push(`Estimated total: $${totalPrice.toLocaleString()}`)
    return lines
  }, [colorLabel, finish, appendParagliderQuoteLines, selectedAccessoryItems, totalPrice])

  const previewGallery = useMemo(() => {
    if (previewOption?.gallery?.length) {
      return normalizeGallery(previewOption.gallery)
    }
    if (!previewOption?.id) {
      return buildOptionGallery(null, null, PRODUCT_IMAGES)
    }
    return buildOptionGallery(previewOption.id, previewOption.image, PRODUCT_IMAGES)
  }, [previewOption, step])

  const selectColorPreset = (color) => {
    setSelectedColorId(color.id)
    setPreviewOption({ id: `color-${color.id}`, image: DISRUPTOR_TRIKE_HERO })
  }

  const selectCustomColor = () => {
    setSelectedColorId(CUSTOM_COLOR_ID)
    setPreviewOption({ id: 'color-custom', image: DISRUPTOR_TRIKE_HERO })
  }

  const selectFinish = (id) => {
    setSelectedFinish(id)
    setPreviewOption({ id, image: DISRUPTOR_TRIKE_HERO })
  }

  const toggleUpgrade = (id) => {
    setSelectedUpgrades((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
    const acc = CONFIG_OPTIONS.accessories.find((a) => a.id === id)
    setPreviewOption({
      id,
      image: acc?.image || resolveAccessoryImage(id, acc?.image, DISRUPTOR_TRIKE_PRODUCTO_ID),
      gallery: acc?.gallery,
    })
  }

  useEffect(() => {
    switch (step) {
      case 0:
        setPreviewOption({
          id: selectedColorId === CUSTOM_COLOR_ID ? 'color-custom' : `color-${selectedColorId}`,
          image: DISRUPTOR_TRIKE_HERO,
        })
        break
      case 1:
        setPreviewOption({ id: selectedFinish, image: DISRUPTOR_TRIKE_HERO })
        break
      case 2: {
        if (paraglider) {
          setPreviewOption({ id: selectedParagliderId, gallery: getParagliderPreviewGallery() })
        } else {
          setPreviewOption({ id: NO_PARAGLIDER_ID, image: DISRUPTOR_TRIKE_HERO })
        }
        break
      }
      case 3: {
        const lastId = selectedUpgrades[selectedUpgrades.length - 1]
        if (lastId) {
          const acc = CONFIG_OPTIONS.accessories.find((a) => a.id === lastId)
          setPreviewOption({
            id: lastId,
            image: acc?.image || resolveAccessoryImage(lastId, acc?.image, DISRUPTOR_TRIKE_PRODUCTO_ID),
            gallery: acc?.gallery,
          })
        } else {
          setPreviewOption({ id: 'accessories', image: DISRUPTOR_TRIKE_HERO })
        }
        break
      }
      default:
        break
    }
  }, [
    step,
    selectedColorId,
    selectedFinish,
    selectedParagliderId,
    selectedParagliderColor,
    paraglider,
    getParagliderPreviewGallery,
    selectedUpgrades,
    CONFIG_OPTIONS.accessories,
  ])

  const goNext = () => {
    if (step === PARAGLIDER_STEP) {
      const validationError = validateParaglider()
      if (validationError) {
        setError(validationError)
        return
      }
    }
    setError('')
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  const goPrev = () => setStep((s) => Math.max(s - 1, 0))

  const handleAddToCart = async () => {
    const validationError = validateParaglider()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')

    try {
      await addConfiguredProduct({
        producto_id: DISRUPTOR_TRIKE_PRODUCTO_ID,
        cantidad: 1,
        engine: selectedEngine,
        finish: selectedFinish,
        propeller: selectedPropeller,
        ...paragliderCartFields,
        chassisColor: colorLabel,
        colorId: selectedColorId,
        customColor: selectedColorId === CUSTOM_COLOR_ID ? customColorText.trim() : undefined,
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
            {step === PARAGLIDER_STEP && paraglider ? (
              <ParagliderPreviewPanel
                wing={paraglider}
                previewGallery={previewGallery}
                selectedColorId={selectedParagliderColor}
                onSelectColor={(colorId, gallery) => {
                  setSelectedParagliderColor(colorId)
                  setPreviewOption({ id: selectedParagliderId, gallery })
                }}
              />
            ) : (
              <OptionImageGallery images={previewGallery} fallbackSrc={null} />
            )}
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
                  <ChassisColorStep
                    selectedColorId={selectedColorId}
                    customColorText={customColorText}
                    onSelectPreset={selectColorPreset}
                    onSelectCustom={selectCustomColor}
                    onCustomTextChange={setCustomColorText}
                  />
                )}

                {step === 1 && (
                  <ConfigSection title="Chassis. Standard package">
                    <p className="text-ink2 mb-6 leading-relaxed">
                      Base trike includes Tundra wheels, stainless chassis, adapters, main straps, and Gravity Control System. Harnesses sold separately.
                    </p>
                    <div className="space-y-3">
                      {CONFIG_OPTIONS.chassisFinishes.map((f) => (
                        <OptionCard key={f.id} selected={selectedFinish === f.id} onClick={() => selectFinish(f.id)}>
                          <div className="flex justify-between items-center pr-8">
                            <p className="font-bold uppercase text-ink">{f.name}</p>
                            <p className="text-sm text-ink2">{formatOptionPrice(f.price || 0)}</p>
                          </div>
                          {f.description && <p className="text-sm text-ink2 mt-2 leading-relaxed">{f.description}</p>}
                        </OptionCard>
                      ))}
                    </div>
                  </ConfigSection>
                )}

                {step === PARAGLIDER_STEP && (
                  <ParagliderStep
                    selectedParagliderId={selectedParagliderId}
                    selectedColorId={selectedParagliderColor}
                    selectedSize={selectedParagliderSize}
                    onSelectParaglider={setSelectedParagliderId}
                    onSelectColor={setSelectedParagliderColor}
                    onSelectSize={setSelectedParagliderSize}
                    onPreviewChange={({ wingId, gallery }) => {
                      setPreviewOption({ id: wingId || selectedParagliderId, gallery })
                    }}
                  />
                )}

                {step === 3 && (
                  <ConfigSection title="Accessories. Enhance Your Flight">
                    <p className="text-ink2 mb-6 leading-relaxed">
                      Add pilot seat, passenger seat, and expedition accessories — photos update in the gallery as you select each item.
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

                {step === 4 && (
                  <ConfigSection title="Review & Purchase">
                    <div className="space-y-3 text-sm">
                      <SummaryRow label="Color" value={colorLabel} price={chassisColorSurcharge(selectedColorId)} />
                      <SummaryRow label="Chassis" value={finish?.name} price={finish?.price} />
                      {paraglider && (
                        <>
                          <SummaryRow label="Paraglider" value={paragliderDisplayName(paraglider)} price={paraglider.price} />
                          <SummaryRow label="Wing color" value={resolveParagliderColorLabel(paraglider, selectedParagliderColor)} />
                          <SummaryRow label="Wing size" value={selectedParagliderSize} />
                        </>
                      )}
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
              <p className="text-xs text-brand/70 mt-2">
                Base trike ${DISRUPTOR_TRIKE_BASE_PRICE.toLocaleString()} — harnesses not included.
              </p>
            </motion.div>

            <QuoteButton productName={QUOTE_PRODUCT_NAMES.disruptorTrike} details={quoteDetails} className="w-full" />

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
