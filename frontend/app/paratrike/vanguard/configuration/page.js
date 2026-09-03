'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import SafeImage from '@/components/ui/SafeImage'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronLeft, ChevronRight, ShoppingCart, ArrowLeft, Check, Package } from 'lucide-react'
import { VANGUARD_HERO_IMAGE, VANGUARD_ENGINES } from '@/lib/vanguardContent'
import { resolveAccessoryImage } from '@/lib/accessoryImages'
import { FALLBACK_IMAGES } from '@/lib/imageDefaults'
import { PRODUCT_IDS } from '@/lib/products'
import { useCart } from '@/hooks/useCart'
import { useConfigOptions, useApplyConfigDefaults } from '@/hooks/useCms'
import WizardProgress from '@/components/configurator/WizardProgress'
import QuoteButton from '@/components/configurator/QuoteButton'
import OptionImageGallery from '@/components/configurator/OptionImageGallery'
import { buildOptionGallery, VANGUARD_CONFIGURATOR_GALLERY } from '@/lib/configuratorImages'
import { QUOTE_PRODUCT_NAMES } from '@/lib/quoteEmail'

const vanguardEngineDesc = (name) => VANGUARD_ENGINES.find((engine) => engine.name === name)?.description ?? ''

const DEFAULT_OPTIONS = {
  engines: [
    { id: 'no-engine', name: 'No Engine', basePrice: 0, description: 'Chassis only — add an engine later.' },
    { id: 'rotax-503-preowned', name: 'Pre-Owned Rotax 503', basePrice: 0, priceTbd: true, image: '/images/engines/rotax-503.jpg', infoUrl: 'https://www.rotax.com/', description: 'Pre-owned Rotax 503 two-stroke option for budget-conscious builds.' },
    { id: 'rotax-912', name: 'Rotax 912 ULS (80HP)', basePrice: 25000, image: '/images/engines/rotax-912.jpg', infoUrl: 'https://www.rotax.com/aircraft-engines/rotax-912-series/912-uls-s.html', description: vanguardEngineDesc('Rotax 912') },
    { id: 'RMZ500', name: 'RMZ500 (Rotax 503 compatible)', basePrice: 15000, image: '/images/engines/rmz500.jpg', description: vanguardEngineDesc('RMZ500') },
    { id: 'simonini-v2', name: 'Simonini Victor 2 Super (112HP)', basePrice: 12000, image: '/images/engines/simonini-v2.jpg', infoUrl: 'https://www.simonini-flying.com/en/home/127-victor-2.html', description: vanguardEngineDesc('Simonini Victor 2 Super') },
    { id: 'hirth-3503', name: 'Hirth 3503 (70HP)', basePrice: 11000, image: '/images/engines/hirth-3503.jpg', description: vanguardEngineDesc('Hirth 3503') },
  ],
  chassisTypes: [
    {
      id: 'commercial',
      name: 'Commercial',
      description: 'Designed for tandem flying. The passenger has easy access from the front. The harness is comfortable and positions the passenger deep inside the trike for safety — their head stays below the bars. Foot support does not interfere with the pilot\'s taxiing.',
      image: '/images/chassis/commercial.jpg',
    },
    {
      id: 'adventure',
      name: 'Adventure',
      description: 'For pilots who want to fly fast with a dynamic style — more penetration, less drag, making flight efficient. Ideal for adventurers who want maximum visibility and the exclusive option to mount a camera on a rotating bracket.',
      image: '/images/chassis/adventure.jpg',
    },
    {
      id: 'reportage',
      name: 'Reportage',
      description: 'Stable platform for aerial photography and filming. Also suited for pilots who enjoy hunting — you can add a weapon mount with full left or right-hand access.',
      image: '/images/chassis/reportage.jpg',
    },
  ],
  propellers: [
    { id: 'no-propeller', name: 'No Propeller', description: 'Chassis only — add a propeller later or supply your own.', price: 0 },
    { id: 'bipala', name: 'Helix Two-Blade H40F (up to 47 kW)', description: 'Diameter 165 cm (64.9 in). When you need extra thrust up to 47 kW — the be-all-and-end monster of the trike world.', price: 534.75, image: '/images/propellers/bipala.jpg' },
    { id: 'tripala', name: 'Three-Blade Propeller (Carbon Fiber)', description: 'Three carbon fiber blades. More thrust and smoother flight.', price: 677.35, image: '/images/propellers/bipala.jpg' },
  ],
  colors: [
    { name: 'Candy Red & White', hex: '#e74c3c', accent: '#ffffff' },
    { name: 'Candy Blue & White', hex: '#3498db', accent: '#ffffff' },
    { name: 'Candy Purple & White', hex: '#9b59b6', accent: '#ffffff' },
  ],
  accessories: [
    { id: 'sun-roof-netting', name: 'Sun-Roof Netting', price: 43, description: 'Protects the pilot from the sun and prevents paraglider lines from tangling with the helmet or trike equipment during sideways descent.', image: '/images/parts/sun-roof-netting.png' },
    { id: 'front-bar-protection', name: 'Padded Roll Bar Protector with Handles', price: 47, description: 'Protects the passenger and provides comfortable handles; front bars are padded for a robust look.', image: '/images/parts/front-bar-protection.png' },
    { id: 'front-brake', name: 'Front Brake', price: 120, description: 'Additional cable brake providing extra braking power — conventional mountain-bike derived system.', image: '/images/parts/front-fork.png' },
    { id: 'rear-mirror', name: 'Rear Mirror', price: 25, description: 'Essential for viewing wing position during the first quarter of lift on takeoff.', image: '/images/parts/rear-mirror.png' },
    { id: 'cockpit-liner', name: 'Passenger & Pilot Cockpit Protective Liner', price: 105, description: 'Protective travel cover tailored for the pilot and passenger cockpit area. Designed specifically for trailering to shield sensitive components from dirt without creating aerodynamic drag on open trailers.', image: '/images/parts/cockpit-liner.png' },
    { id: 'parachute-container', name: 'Parachute Container', price: 55, description: 'Exclusive container for mounting on the right or left side of the harnesses.', image: '/images/parts/parachute-container.png' },
    { id: 'lateral-bag', name: 'Two Side Explorer Cases (L-R)', price: 95, description: 'Pair of aerodynamic side cases with extra straps for rods, tents, fuel, etc. without using internal space.', image: '/images/parts/lateral-bag-explorer.png' },
    { id: 'cruise-control', name: 'Cruise Control', price: 25, description: 'For long-distance flights — maintains desired RPM for stable, smooth flight.', image: '/images/parts/cruise-control.png' },
    { id: 'camel-back', name: 'Camel Back for Pilot Hydration', price: 25, description: 'An essential hydration bladder setup for long-endurance flights. Tucks neatly into the instrument holder pocket located on the back of the passenger seat.', image: '/images/parts/passenger-harness.png' },
    { id: 'fuel-gauge-vanguard', name: 'Analog Fuel Gauge (Vanguard)', price: 119, description: 'Analog fuel gauge for the Vanguard L-shaped tank.', image: '/images/parts/fuel-gauge-vanguard.png' },
    { id: 'auxiliary-lights', name: 'Auxiliary Lights Kit', price: 187.10, description: 'Two UP67 50W waterproof LED lights, position indicator lights, luxury switch, wiring and relay.', image: '/images/parts/auxiliary-lights.png' },
    { id: 'instrument-kit', name: 'Basic Instrument Kit (Vanguard)', price: 340, description: 'TTO digital RPM, spark plug temperature, coolant temperature gauges, and 4-port USB charger.', image: '/images/parts/instrument-kit-vanguard.png' },
    { id: 'electrical-kit', name: 'Complete Electrical Installation Kit', price: 218.20, description: 'Regulator/rectifier, relays, starter solenoid, magneto test buttons, master switch, and full wiring harness.', image: '/images/parts/electrical-kit.png' },
    { id: 'carabiners', name: 'Two Carabiners', price: 90, description: 'High-capacity steel carabiners (2.4 kN each) for maximum safety.', image: '/images/parts/carabiners.png' },
    { id: 'propeller-guard', name: 'External Propeller Guard', price: 295, description: 'Prevents wing or lines from entering the propeller. Ideal for schools and beginners.', image: '/images/parts/pilot-dynamic-cage.png' },
    { id: 'reserve-chute', name: 'Reserve Parachute — APCO Mayday UL28', price: 1528, description: 'Certified heavy-duty emergency reserve parachute with max load of 400 kg.', image: '/images/parts/parachute-container.png' },
  ]
}

const STEPS = ['Chassis', 'Engine', 'Propeller', 'Accessories', 'Review']

const VANGUARD_PRODUCTO_ID = PRODUCT_IDS.vanguard

const PRODUCT_IMAGES = VANGUARD_CONFIGURATOR_GALLERY

export default function ConfiguratorPage() {
  const router = useRouter()
  const { addConfiguredProduct } = useCart()
  const { options: CONFIG_OPTIONS, basePrice, loading: optionsLoading, defaultSelections } = useConfigOptions(PRODUCT_IDS.vanguard, DEFAULT_OPTIONS)
  const [step, setStep] = useState(0)
  const [selectedEngine, setSelectedEngine] = useState(DEFAULT_OPTIONS.engines[0].id)
  const [selectedChassisType, setSelectedChassisType] = useState(DEFAULT_OPTIONS.chassisTypes[0].id)
  const [selectedPropeller, setSelectedPropeller] = useState(DEFAULT_OPTIONS.propellers[0].id)
  const [selectedUpgrades, setSelectedUpgrades] = useState([])
  const [selectedChassisColor, setSelectedChassisColor] = useState(DEFAULT_OPTIONS.colors[0].name)
  const [previewOption, setPreviewOption] = useState({
    id: DEFAULT_OPTIONS.chassisTypes[0].id,
    image: VANGUARD_HERO_IMAGE,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const applyDefaults = useCallback((d) => {
    if (d.engineId) setSelectedEngine(d.engineId)
    if (d.propellerId) setSelectedPropeller(d.propellerId)
    if (d.chassisTypeId) setSelectedChassisType(d.chassisTypeId)
  }, [])

  useApplyConfigDefaults(defaultSelections, optionsLoading, applyDefaults)

  const accessories = CONFIG_OPTIONS.accessories

  const engine = CONFIG_OPTIONS.engines.find(e => e.id === selectedEngine)
  const chassisType = CONFIG_OPTIONS.chassisTypes.find(t => t.id === selectedChassisType)
  const propeller = CONFIG_OPTIONS.propellers.find(p => p.id === selectedPropeller)
  const selectedAccessoryItems = accessories.filter(a => selectedUpgrades.includes(a.id))

  const totalPrice = useMemo(() => {
    const baseChassis = basePrice ?? 5950.25
    const enginePrice = engine?.basePrice || 0
    const propellerPrice = propeller?.price || 0
    const upgradesPrice = selectedUpgrades.reduce((sum, id) => sum + (CONFIG_OPTIONS.accessories.find(a => a.id === id)?.price || 0), 0)
    return baseChassis + enginePrice + propellerPrice + upgradesPrice
  }, [engine, propeller, selectedUpgrades, basePrice, CONFIG_OPTIONS.accessories])

  const quoteDetails = useMemo(() => {
    const lines = []
    if (selectedChassisColor) lines.push(`Chassis color: ${selectedChassisColor}`)
    if (chassisType?.name) lines.push(`Chassis type: ${chassisType.name}`)
    if (engine?.name) lines.push(`Engine: ${engine.name}`)
    if (propeller?.name) lines.push(`Propeller: ${propeller.name}`)
    if (selectedAccessoryItems.length > 0) {
      lines.push(`Accessories: ${selectedAccessoryItems.map((a) => a.name).join(', ')}`)
    }
    lines.push(`Estimated total: $${totalPrice.toLocaleString()}`)
    return lines
  }, [selectedChassisColor, chassisType, engine, propeller, selectedAccessoryItems, totalPrice])

  const previewGallery = useMemo(() => {
    if (!previewOption?.id) {
      return buildOptionGallery(null, null, PRODUCT_IMAGES)
    }
    return buildOptionGallery(previewOption.id, previewOption.image, PRODUCT_IMAGES, previewOption.gallery)
  }, [previewOption, step])

  const selectChassisType = (id) => {
    setSelectedChassisType(id)
    setPreviewOption({ id, image: VANGUARD_HERO_IMAGE })
  }

  const selectEngine = (id) => {
    setSelectedEngine(id)
    const eng = CONFIG_OPTIONS.engines.find((e) => e.id === id)
    setPreviewOption({ id, image: eng?.image || null, gallery: eng?.gallery })
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
      image: acc?.image || resolveAccessoryImage(id, acc?.image, VANGUARD_PRODUCTO_ID),
      gallery: acc?.gallery,
    })
  }

  useEffect(() => {
    switch (step) {
      case 0:
        setPreviewOption({ id: selectedChassisType, image: VANGUARD_HERO_IMAGE })
        break
      case 1: {
        const eng = CONFIG_OPTIONS.engines.find((e) => e.id === selectedEngine)
        setPreviewOption({ id: selectedEngine, image: eng?.image || null, gallery: eng?.gallery })
        break
      }
      case 2: {
        const prop = CONFIG_OPTIONS.propellers.find((p) => p.id === selectedPropeller)
        setPreviewOption({ id: selectedPropeller, image: prop?.image || null, gallery: prop?.gallery })
        break
      }
      case 3: {
        const lastId = selectedUpgrades[selectedUpgrades.length - 1]
        if (lastId) {
          const acc = CONFIG_OPTIONS.accessories.find((a) => a.id === lastId)
          setPreviewOption({
            id: lastId,
            image: acc?.image || resolveAccessoryImage(lastId, acc?.image, VANGUARD_PRODUCTO_ID),
            gallery: acc?.gallery,
          })
        } else {
          setPreviewOption({ id: 'accessories', image: VANGUARD_HERO_IMAGE })
        }
        break
      }
      default:
        break
    }
  }, [
    step,
    selectedChassisType,
    selectedEngine,
    selectedPropeller,
    selectedUpgrades,
    CONFIG_OPTIONS.chassisTypes,
    CONFIG_OPTIONS.engines,
    CONFIG_OPTIONS.propellers,
    CONFIG_OPTIONS.accessories,
  ])

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const goPrev = () => setStep(s => Math.max(s - 1, 0))

  const handleAddToCart = async () => {
    setLoading(true)
    setError('')

    try {
      await addConfiguredProduct({
        producto_id: VANGUARD_PRODUCTO_ID,
        cantidad: 1,
        engine: selectedEngine,
        chassisType: selectedChassisType,
        propeller: selectedPropeller,
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
      {/* Header */}
      <div className="sticky-below-nav bg-white border-b border-borderline py-4 sm:py-6 px-4 sm:px-6">
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
        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-ink">Vanguard V8.0</h1>
          <p className="text-xl text-ink2 mt-2">Configure your dream machine</p>
        </div>

        <WizardProgress steps={STEPS} currentStep={step} onStepClick={setStep} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Left: Image & Colors (persistent across steps) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6">

            {/* Color first — then product preview (Nomadic pattern) */}
            <div className="space-y-4">
              <details open className="group border border-borderline rounded-xl p-4 hover:border-brand/50 transition">
                <summary className="flex justify-between items-center cursor-pointer font-bold uppercase tracking-wide text-ink">
                  Chassis Color
                  <ChevronDown className="group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 flex gap-3 flex-wrap">
                  {CONFIG_OPTIONS.colors.map(c => (
                    <motion.button
                      key={c.name}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedChassisColor(c.name)}
                      className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center
                        ${selectedChassisColor === c.name ? 'border-brand scale-110' : 'border-borderline hover:border-brand/50'}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}>
                      {selectedChassisColor === c.name && <Check className="w-5 h-5 text-white drop-shadow" />}
                    </motion.button>
                  ))}
                </div>
              </details>
            </div>

            <OptionImageGallery images={previewGallery} fallbackSrc={null} />
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
                  <ConfigSection title="Chassis. Choose your flying style">
                    <div className="grid sm:grid-cols-1 gap-4">
                      {CONFIG_OPTIONS.chassisTypes.map(t => (
                        <OptionCard
                          key={t.id}
                          selected={selectedChassisType === t.id}
                          onClick={() => selectChassisType(t.id)}
                        >
                          <p className="font-bold uppercase text-ink">{t.name}</p>
                          <p className="text-sm text-ink2 mt-1">{t.description}</p>
                          {selectedChassisType === t.id && (
                            <div className="mt-3 pt-3 border-t border-borderline/60 flex gap-3 items-start">
                              <OptionThumb src={t.image} alt={t.name} />
                            </div>
                          )}
                        </OptionCard>
                      ))}
                    </div>
                  </ConfigSection>
                )}

                {step === 1 && (
                  <ConfigSection title="Engine. Which is right for you?">
                    <div className="space-y-3">
                      {CONFIG_OPTIONS.engines.map(e => (
                        <OptionCard key={e.id} selected={selectedEngine === e.id} onClick={() => selectEngine(e.id)}>
                          <p className="font-bold uppercase text-ink">{e.name}</p>
                          <p className="text-sm text-ink2 mt-1">
                            {e.basePrice === 0 && e.priceTbd
                              ? 'Price on request'
                              : e.basePrice === 0
                                ? 'Included'
                                : `+$${e.basePrice.toLocaleString()}`}
                          </p>
                          {selectedEngine === e.id && e.image && (
                            <div className="mt-3 pt-3 border-t border-borderline/60 flex gap-3 items-start">
                              <OptionThumb src={e.image} alt={e.name} />
                              {e.infoUrl && (
                                <a
                                  href={e.infoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(ev) => ev.stopPropagation()}
                                  className="text-sm text-brand font-bold hover:underline mt-1">
                                  More engine info →
                                </a>
                              )}
                            </div>
                          )}
                          {e.description && (
                            <p className="text-sm text-ink2 mt-2 leading-relaxed">{e.description}</p>
                          )}
                        </OptionCard>
                      ))}
                    </div>
                  </ConfigSection>
                )}

                {step === 2 && (
                  <ConfigSection title="Propeller. Precision in every flight">
                    <div className="space-y-3">
                      {CONFIG_OPTIONS.propellers.map(p => (
                        <OptionCard key={p.id} selected={selectedPropeller === p.id} onClick={() => selectPropeller(p.id)}>
                          <div className="flex justify-between items-center pr-8">
                            <p className="font-bold uppercase text-ink">{p.name}</p>
                            <p className="text-sm text-ink2">{p.price === 0 ? 'Included' : `+$${p.price.toLocaleString()}`}</p>
                          </div>
                          {selectedPropeller === p.id && p.image && (
                            <div className="mt-3 pt-3 border-t border-borderline/60 flex gap-3 items-start">
                              <OptionThumb src={p.image} alt={p.name} />
                            </div>
                          )}
                          <p className="text-sm text-ink2 mt-1">{p.description}</p>
                        </OptionCard>
                      ))}
                    </div>
                  </ConfigSection>
                )}

                {step === 3 && (
                  <ConfigSection title="Accessories. Enhance your flight">
                    <div className="space-y-3">
                      {accessories.map(a => {
                        const isSelected = selectedUpgrades.includes(a.id)
                        return (
                          <OptionCard key={a.id} selected={isSelected} onClick={() => toggleUpgrade(a.id)}>
                            <div className="flex justify-between items-center pr-8">
                              <p className="font-bold uppercase text-ink">{a.name}</p>
                              <p className="font-semibold text-ink2">+${a.price}</p>
                            </div>
                            {isSelected && (
                              <div className="mt-3 pt-3 border-t border-borderline/60 flex gap-3 items-start">
                                <OptionThumb src={resolveAccessoryImage(a.id, a.image, VANGUARD_PRODUCTO_ID)} alt={a.name} />
                              </div>
                            )}
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

                {step === 4 && (
                  <ConfigSection title="Review & Purchase">
                    <div className="space-y-3 text-sm">
                      <SummaryRow label="Color" value={selectedChassisColor} />
                      <SummaryRow label="Chassis Type" value={chassisType?.name} />
                      <SummaryRow label="Engine" value={engine?.name} price={engine?.basePrice} />
                      <SummaryRow label="Propeller" value={propeller?.name} price={propeller?.price} />
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

            <QuoteButton productName={QUOTE_PRODUCT_NAMES.vanguard} details={quoteDetails} className="w-full" />

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

function OptionThumb({ src, alt }) {
  const hasSrc = typeof src === 'string' && src.trim().length > 0

  return (
    <div className="relative w-28 h-28 shrink-0 rounded-lg overflow-hidden bg-bg2">
      {hasSrc ? (
        <SafeImage
          src={src.trim()}
          alt={alt}
          fill
          className="object-cover"
          fallbackSrc={FALLBACK_IMAGES.engine}
          unoptimized
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Package className="w-8 h-8 text-ink2/40" />
        </div>
      )}
    </div>
  )
}
