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
import QuoteButton from '@/components/configurator/QuoteButton'
import OptionImageGallery from '@/components/configurator/OptionImageGallery'
import ChassisColorStep from '@/components/configurator/ChassisColorStep'
import ParagliderStep from '@/components/configurator/ParagliderStep'
import ParagliderPreviewPanel from '@/components/configurator/ParagliderPreviewPanel'
import OptionCard from '@/components/configurator/OptionCard'
import ConfigSection from '@/components/configurator/ConfigSection'
import SummaryRow from '@/components/configurator/SummaryRow'
import { buildOptionGallery, normalizeGallery, NOMADIC_CONFIGURATOR_GALLERY } from '@/lib/configuratorImages'
import { chassisColorPreviewOption } from '@/lib/chassisColorImages'
import { HAND_THROTTLE_OPTIONS } from '@/lib/handThrottleOptions'
import { formatQuoteLine, QUOTE_PRODUCT_NAMES } from '@/lib/quoteEmail'
import { NOMADIC_BASE_PRICE, NOMADIC_HERO_IMAGE, NOMADIC_ENGINES } from '@/lib/nomadicContent'
import { NOMADIC_CONFIGURATOR_ACCESSORIES } from '@/lib/trikeConfiguratorAccessories'
import { formatQuoteImageLine } from '@/lib/quoteEmail'
import {
  CHASSIS_COLOR_PRESETS,
  CUSTOM_COLOR_ID,
  chassisColorSurcharge,
  resolveChassisColorLabel,
} from '@/lib/chassisColors'
import {
  NO_PARAGLIDER_ID,
  findTrikeParaglider,
  getParagliderColorGallery,
  getParagliderDefaultGallery,
  paragliderDisplayName,
  resolveParagliderColorLabel,
} from '@/lib/trikeParagliderOptions'

const NOMADIC_ENGINE_DESCRIPTIONS = Object.fromEntries(
  NOMADIC_ENGINES.map((engine) => [engine.name, engine.description]),
)

const DEFAULT_OPTIONS = {
  engines: [
    { id: 'no-engine', name: 'No Engine', power: '', basePrice: 0, description: 'Chassis only — add an engine later.' },
    { id: 'polini-260', name: 'Polini Thor 260', power: '24 HP', basePrice: 5455, image: '/images/engines/polini-260.jpg', infoUrl: 'https://www.polinithor.com/en/polini-thor-260-2/', description: NOMADIC_ENGINE_DESCRIPTIONS['Polini Thor 260'] },
    { id: 'polini-303', name: 'Polini Thor 303 EVO', power: '38 HP', basePrice: 5987, image: '/images/engines/polini-303.jpg', infoUrl: 'https://www.polinithor.com/en/polini-thor-303-evo-2/', description: NOMADIC_ENGINE_DESCRIPTIONS['Polini Thor 303 EVO'] },
    { id: 'vittorazi-300-my25', name: 'Vittorazi Cosmos 300', power: '36 HP', basePrice: 7225, image: '/images/engines/vittorazi-300-my25.jpg', infoUrl: 'https://vittorazi.com/en/motori/cosmos-300/', description: NOMADIC_ENGINE_DESCRIPTIONS['Vittorazi Cosmos 300'] },
    { id: 'zeus-300', name: 'Sky Engine Zeus 300 Boxer', power: '44 HP', basePrice: 7800, image: '/images/engines/zeus-300.jpg', infoUrl: 'https://www.skyengines.com/zeus300-boxer/?lang=en', description: NOMADIC_ENGINE_DESCRIPTIONS['Sky Engine Zeus 300 Boxer'] },
    { id: 'simonini-victor-1', name: 'Simonini Victor One Super', power: '54 HP', basePrice: 6809, image: '/images/engines/simonini-victor-1.jpg', infoUrl: 'https://www.simonini-flying.com/en/home/109-victor-1.html', description: NOMADIC_ENGINE_DESCRIPTIONS['Simonini Victor One Super'] },
  ],
  handThrottles: HAND_THROTTLE_OPTIONS,
  propellers: [
    { id: 'no-propeller', name: 'No Propeller', description: 'Chassis only — add a propeller later or supply your own.', price: 0 },
    { id: 'bipala', name: 'Helix Two-Blade H40F (up to 47 kW)', description: 'Diameter 165 cm (64.9 in). Special build for Rotax 503, 582, RMZ500 and high-thrust trikes.', price: 534.75, image: '/images/propellers/bipala.jpg', infoUrl: 'https://helix-propeller.de/propellers/paramotor/' },
    { id: 'tripala', name: 'Helix Three-Blade H40F (up to 47 kW)', description: 'Diameter 165 cm (64.9 in). Three-blade variant — reduced noise and ~2% more static thrust.', price: 677.35, image: '/images/propellers/tripala.jpg', infoUrl: 'https://helix-propeller.de/propellers/paramotor/' },
  ],
  colors: [],
  accessories: NOMADIC_CONFIGURATOR_ACCESSORIES,
}

const STEPS = ['Color', 'Engine', 'Hand Throttle', 'Propeller', 'Paraglider', 'Accessories', 'Review']
const PARAGLIDER_STEP = 4

const NOMADIC_PRODUCTO_ID = PRODUCT_IDS.nomadic

const PRODUCT_IMAGES = NOMADIC_CONFIGURATOR_GALLERY

export default function ConfiguratorNomadicPage() {
  const router = useRouter()
  const { addConfiguredProduct } = useCart()
  const { options, loading: optionsLoading, defaultSelections } = useConfigOptions(NOMADIC_PRODUCTO_ID, {
    engines: DEFAULT_OPTIONS.engines,
    chassisTypes: [],
    handThrottles: DEFAULT_OPTIONS.handThrottles,
    propellers: DEFAULT_OPTIONS.propellers,
    colors: DEFAULT_OPTIONS.colors,
    accessories: DEFAULT_OPTIONS.accessories,
  })
  const CONFIG_OPTIONS = {
    engines: options.engines,
    handThrottles: options.handThrottles?.length ? options.handThrottles : DEFAULT_OPTIONS.handThrottles,
    propellers: options.propellers,
    colors: options.colors,
    accessories: options.accessories,
  }
  const [step, setStep] = useState(0)
  const [selectedEngine, setSelectedEngine] = useState('no-engine')
  const [selectedHandThrottle, setSelectedHandThrottle] = useState('no-throttle')
  const [selectedPropeller, setSelectedPropeller] = useState(DEFAULT_OPTIONS.propellers[0].id)
  const [selectedParagliderId, setSelectedParagliderId] = useState(NO_PARAGLIDER_ID)
  const [selectedParagliderColor, setSelectedParagliderColor] = useState('')
  const [selectedParagliderSize, setSelectedParagliderSize] = useState('')
  const [selectedUpgrades, setSelectedUpgrades] = useState([])
  const [selectedColorId, setSelectedColorId] = useState(CHASSIS_COLOR_PRESETS[0].id)
  const [customColorText, setCustomColorText] = useState('')
  const [previewOption, setPreviewOption] = useState({
    id: `color-${CHASSIS_COLOR_PRESETS[0].id}`,
    image: NOMADIC_HERO_IMAGE,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const applyDefaults = useCallback((d) => {
    if (d.engineId) setSelectedEngine(d.engineId)
    if (d.handThrottleId) setSelectedHandThrottle(d.handThrottleId)
    if (d.propellerId) setSelectedPropeller(d.propellerId)
  }, [])

  useApplyConfigDefaults(defaultSelections, optionsLoading, applyDefaults)

  const accessories = CONFIG_OPTIONS.accessories

  const engine = CONFIG_OPTIONS.engines.find(e => e.id === selectedEngine)
  const handThrottle = CONFIG_OPTIONS.handThrottles.find((h) => h.id === selectedHandThrottle)
  const propeller = CONFIG_OPTIONS.propellers.find(p => p.id === selectedPropeller)
  const paraglider = findTrikeParaglider(selectedParagliderId)
  const selectedAccessoryItems = accessories.filter(a => selectedUpgrades.includes(a.id))

  const totalPrice = useMemo(() => {
    const baseChassis = NOMADIC_BASE_PRICE
    const enginePrice = engine?.basePrice || 0
    const handPrice = handThrottle?.price || 0
    const propellerPrice = propeller?.price || 0
    const paragliderPrice = paraglider?.price || 0
    const upgradesPrice = selectedUpgrades.reduce((sum, id) => sum + (CONFIG_OPTIONS.accessories.find(a => a.id === id)?.price || 0), 0)
    return baseChassis + enginePrice + handPrice + propellerPrice + paragliderPrice + upgradesPrice + chassisColorSurcharge(selectedColorId)
  }, [engine, handThrottle, propeller, paraglider, selectedUpgrades, CONFIG_OPTIONS.accessories, selectedColorId])

  const colorLabel = resolveChassisColorLabel(selectedColorId, customColorText)

  const quoteDetails = useMemo(() => {
    const lines = []
    const colorLine = formatQuoteLine('Chassis color', colorLabel, chassisColorSurcharge(selectedColorId))
    if (colorLine) lines.push(colorLine)
    const engineLine = formatQuoteLine('Engine', engine?.name, engine?.priceTbd ? null : engine?.basePrice, {
      priceLabel: engine?.priceTbd ? 'Price on request' : undefined,
    })
    if (engineLine) lines.push(engineLine)
    const handLine = formatQuoteLine('Hand throttle', handThrottle?.name, handThrottle?.price)
    if (handLine) lines.push(handLine)
    const propLine = formatQuoteLine('Propeller', propeller?.name, propeller?.price)
    if (propLine) lines.push(propLine)
    if (paraglider) {
      const wingLine = formatQuoteLine('Paraglider', paragliderDisplayName(paraglider), paraglider.price)
      if (wingLine) lines.push(wingLine)
      const wingColor = resolveParagliderColorLabel(paraglider, selectedParagliderColor)
      if (wingColor) lines.push(`Wing color: ${wingColor}`)
      if (selectedParagliderSize) lines.push(`Wing size: ${selectedParagliderSize}`)
    }
    selectedAccessoryItems.forEach((a) => {
      const accLine = formatQuoteLine('Accessory', a.name, a.price)
      if (accLine) lines.push(accLine)
      const imgLine = formatQuoteImageLine(a.name, a.image || resolveAccessoryImage(a.id, a.image, NOMADIC_PRODUCTO_ID))
      if (imgLine) lines.push(imgLine)
    })
    if (paraglider?.techImages?.[0]) {
      lines.push(formatQuoteImageLine(`${paragliderDisplayName(paraglider)} tech sheet`, paraglider.techImages[0]))
    }
    if (engine?.image) lines.push(formatQuoteImageLine(engine.name, engine.image))
    if (propeller?.image) lines.push(formatQuoteImageLine(propeller.name, propeller.image))
    lines.push(`Estimated total: $${totalPrice.toLocaleString()}`)
    return lines
  }, [colorLabel, engine, handThrottle, propeller, paraglider, selectedParagliderColor, selectedParagliderSize, selectedAccessoryItems, totalPrice, selectedColorId])

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
    setPreviewOption(chassisColorPreviewOption('nomadic', color.id, NOMADIC_HERO_IMAGE))
  }

  const selectCustomColor = () => {
    setSelectedColorId(CUSTOM_COLOR_ID)
    setPreviewOption(chassisColorPreviewOption('nomadic', CUSTOM_COLOR_ID, NOMADIC_HERO_IMAGE))
  }

  const selectEngine = (id) => {
    setSelectedEngine(id)
    const eng = CONFIG_OPTIONS.engines.find((e) => e.id === id)
    setPreviewOption({ id, image: eng?.image || null, gallery: eng?.gallery })
  }

  const selectHandThrottle = (id) => {
    setSelectedHandThrottle(id)
    const throttle = CONFIG_OPTIONS.handThrottles.find((h) => h.id === id)
    setPreviewOption({ id, image: throttle?.image || null, gallery: throttle?.gallery })
  }

  const selectPropeller = (id) => {
    setSelectedPropeller(id)
    const prop = CONFIG_OPTIONS.propellers.find((p) => p.id === id)
    setPreviewOption({ id, image: prop?.image || null, gallery: prop?.gallery })
  }

  const toggleUpgrade = (id) => {
    setSelectedUpgrades((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
    const acc = CONFIG_OPTIONS.accessories.find((a) => a.id === id)
    setPreviewOption({
      id,
      image: acc?.image || resolveAccessoryImage(id, acc?.image, NOMADIC_PRODUCTO_ID),
      gallery: acc?.gallery,
    })
  }

  useEffect(() => {
    switch (step) {
      case 0:
        setPreviewOption(chassisColorPreviewOption('nomadic', selectedColorId, NOMADIC_HERO_IMAGE))
        break
      case 1: {
        const eng = CONFIG_OPTIONS.engines.find((e) => e.id === selectedEngine)
        setPreviewOption({ id: selectedEngine, image: eng?.image || null, gallery: eng?.gallery })
        break
      }
      case 2: {
        const throttle = CONFIG_OPTIONS.handThrottles.find((h) => h.id === selectedHandThrottle)
        setPreviewOption({ id: selectedHandThrottle, image: throttle?.image || null, gallery: throttle?.gallery })
        break
      }
      case 3: {
        const prop = CONFIG_OPTIONS.propellers.find((p) => p.id === selectedPropeller)
        setPreviewOption({ id: selectedPropeller, image: prop?.image || null, gallery: prop?.gallery })
        break
      }
      case PARAGLIDER_STEP: {
        if (paraglider) {
          const gallery = selectedParagliderColor
            ? getParagliderColorGallery(paraglider, selectedParagliderColor)
            : getParagliderDefaultGallery(paraglider)
          setPreviewOption({ id: selectedParagliderId, gallery })
        } else {
          setPreviewOption({ id: NO_PARAGLIDER_ID, image: NOMADIC_HERO_IMAGE })
        }
        break
      }
      case 5: {
        const lastId = selectedUpgrades[selectedUpgrades.length - 1]
        if (lastId) {
          const acc = CONFIG_OPTIONS.accessories.find((a) => a.id === lastId)
          setPreviewOption({
            id: lastId,
            image: acc?.image || resolveAccessoryImage(lastId, acc?.image, NOMADIC_PRODUCTO_ID),
            gallery: acc?.gallery,
          })
        } else {
          setPreviewOption({ id: 'accessories', image: NOMADIC_HERO_IMAGE })
        }
        break
      }
      default:
        break
    }
  }, [
    step,
    selectedColorId,
    selectedEngine,
    selectedHandThrottle,
    selectedPropeller,
    selectedParagliderId,
    selectedParagliderColor,
    paraglider,
    selectedUpgrades,
    CONFIG_OPTIONS.engines,
    CONFIG_OPTIONS.handThrottles,
    CONFIG_OPTIONS.propellers,
    CONFIG_OPTIONS.accessories,
  ])

  const goNext = () => {
    if (step === PARAGLIDER_STEP && paraglider) {
      if (!selectedParagliderColor || !selectedParagliderSize) {
        setError('Please select wing color and size before continuing.')
        return
      }
    }
    setError('')
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  const goPrev = () => setStep(s => Math.max(s - 1, 0))

  const handleAddToCart = async () => {
    if (paraglider && (!selectedParagliderColor || !selectedParagliderSize)) {
      setError('Please select wing color and size before adding to cart.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await addConfiguredProduct({
        producto_id: NOMADIC_PRODUCTO_ID,
        cantidad: 1,
        engine: selectedEngine,
        handThrottle: selectedHandThrottle,
        propeller: selectedPropeller,
        paraglider: selectedParagliderId !== NO_PARAGLIDER_ID ? selectedParagliderId : undefined,
        paragliderColor: selectedParagliderColor || undefined,
        paragliderSize: selectedParagliderSize || undefined,
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
      {/* Header */}
      <div className="sticky-below-nav bg-white border-b border-borderline py-4 sm:py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/paratrike/nomadic"
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
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-ink">Nomadic Trike</h1>
          <p className="text-xl text-ink2 mt-2">Configure your ultimate adventure machine</p>
        </div>

        <WizardProgress steps={STEPS} currentStep={step} onStepClick={setStep} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Left: product preview gallery */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className={`space-y-6 ${step === 5 ? 'lg:sticky lg:top-28 lg:self-start' : ''}`}>
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

          {/* Right: Wizard step content */}
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
                  <ConfigSection title="Engine. Pure Power">
                    <div className="space-y-3">
                      {CONFIG_OPTIONS.engines.map(e => (
                        <OptionCard key={e.id} selected={selectedEngine === e.id} onClick={() => selectEngine(e.id)}>
                          <p className="font-bold uppercase text-ink">{e.name}</p>
                          <p className="text-sm text-ink2 mt-1">
                            {e.power ? `${e.power} — ` : ''}
                            {e.basePrice === 0 && e.priceTbd
                              ? 'Price on request'
                              : e.basePrice === 0
                                ? 'Included'
                                : `+$${e.basePrice.toLocaleString()}`}
                          </p>
                          {e.description && (
                            <p className="text-sm text-ink2 mt-2 leading-relaxed">{e.description}</p>
                          )}
                          {selectedEngine === e.id && e.infoUrl && (
                            <a
                              href={e.infoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(ev) => ev.stopPropagation()}
                              className="inline-block text-sm text-brand font-bold hover:underline mt-2">
                              More engine info →
                            </a>
                          )}
                        </OptionCard>
                      ))}
                    </div>
                  </ConfigSection>
                )}

                {step === 2 && (
                  <ConfigSection title="Hand Throttle. Control in your grip">
                    <div className="space-y-3">
                      {CONFIG_OPTIONS.handThrottles.map((h) => (
                        <OptionCard key={h.id} selected={selectedHandThrottle === h.id} onClick={() => selectHandThrottle(h.id)}>
                          <div className="flex justify-between items-center pr-8">
                            <p className="font-bold uppercase text-ink">{h.name}</p>
                            <p className="text-sm text-ink2">{h.price === 0 ? 'Included' : `+$${h.price.toLocaleString()}`}</p>
                          </div>
                          <p className="text-sm text-ink2 mt-1">{h.description}</p>
                          {selectedHandThrottle === h.id && h.infoUrl && (
                            <a href={h.infoUrl} target="_blank" rel="noopener noreferrer" onClick={(ev) => ev.stopPropagation()} className="inline-block text-sm text-brand font-bold hover:underline mt-2">
                              More info →
                            </a>
                          )}
                        </OptionCard>
                      ))}
                    </div>
                  </ConfigSection>
                )}

                {step === 3 && (
                  <ConfigSection title="Propeller. Precision in every flight">
                    <div className="space-y-3">
                      {CONFIG_OPTIONS.propellers.map(p => (
                        <OptionCard key={p.id} selected={selectedPropeller === p.id} onClick={() => selectPropeller(p.id)}>
                          <div className="flex justify-between items-center pr-8">
                            <p className="font-bold uppercase text-ink">{p.name}</p>
                            <p className="text-sm text-ink2">{p.price === 0 ? 'Included' : `+$${p.price.toLocaleString()}`}</p>
                          </div>
                          <p className="text-sm text-ink2 mt-1">{p.description}</p>
                          {selectedPropeller === p.id && p.infoUrl && (
                            <a href={p.infoUrl} target="_blank" rel="noopener noreferrer" onClick={(ev) => ev.stopPropagation()} className="inline-block text-sm text-brand font-bold hover:underline mt-2">
                              More info →
                            </a>
                          )}
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

                {step === 5 && (
                  <ConfigSection title="Accessories. Enhance Adventure">
                    <div className="space-y-3">
                      {accessories.map(a => {
                        const isSelected = selectedUpgrades.includes(a.id)
                        return (
                          <OptionCard key={a.id} selected={isSelected} onClick={() => toggleUpgrade(a.id)}>
                            <div className="flex justify-between items-center pr-8">
                              <p className="font-bold uppercase text-ink">{a.name}</p>
                              <p className="font-semibold text-ink2">
                                +${a.price.toLocaleString(undefined, { minimumFractionDigits: a.price % 1 === 0 ? 0 : 2 })}
                              </p>
                            </div>
                            {a.description && (
                              <p className="text-sm text-ink2 mt-2 leading-relaxed">{a.description}</p>
                            )}
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

                {step === 6 && (
                  <ConfigSection title="Review & Purchase">
                    <div className="space-y-3 text-sm">
                      <SummaryRow label="Color" value={colorLabel} price={chassisColorSurcharge(selectedColorId)} />
                      <SummaryRow label="Engine" value={engine?.name} price={engine?.basePrice} />
                      <SummaryRow label="Hand throttle" value={handThrottle?.name} price={handThrottle?.price} />
                      <SummaryRow label="Propeller" value={propeller?.name} price={propeller?.price} />
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
                          {selectedAccessoryItems.map(a => <SummaryRow key={a.id} label={a.name} price={a.price} />)}
                        </div>
                      )}
                    </div>
                  </ConfigSection>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                {error}
              </motion.div>
            )}

            {/* Price */}
            <motion.div layout className="bg-brand-soft border-2 border-brand rounded-xl p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-brand/80 mb-2">Total Price</p>
              <motion.p
                key={totalPrice}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-black text-brand">
                ${totalPrice.toLocaleString()}
              </motion.p>
            </motion.div>

            <QuoteButton productName={QUOTE_PRODUCT_NAMES.nomadic} details={quoteDetails} className="w-full" />

            {/* Wizard navigation */}
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
