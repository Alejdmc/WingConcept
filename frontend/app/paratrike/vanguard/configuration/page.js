'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronLeft, ChevronRight, ShoppingCart, ArrowLeft, Check, Package } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'
import { resolveAccessoryImage } from '@/lib/accessoryImages'
import { FALLBACK_IMAGES } from '@/lib/imageDefaults'
import { PRODUCT_IDS } from '@/lib/products'
import { useCart } from '@/hooks/useCart'
import { useConfigOptions, useApplyConfigDefaults } from '@/hooks/useCms'
import WizardProgress from '@/components/configurator/WizardProgress'

const DEFAULT_OPTIONS = {
  engines: [
    { id: 'no-engine', name: 'No Engine', basePrice: 0 },
    { id: 'rotax-912', name: 'Rotax 912 (80HP)', basePrice: 25000, image: '/images/engines/rotax-912.jpg' },
    { id: 'RMZ500', name: 'RMZ500', basePrice: 15000, image: '/images/engines/rmz500.jpg' },
    { id: 'simonini-v2', name: 'Simonini Victor 2 (112HP)', basePrice: 12000, image: '/images/engines/simonini-v2.jpg' },
    { id: 'hirth-3503', name: 'Hirth 3503 (70HP)', basePrice: 11000, image: '/images/engines/hirth-3503.jpg' },
  ],
  chassisTypes: [
    { id: 'commercial', name: 'Commercial', description: 'Reinforced frame built for daily commercial operations, tandem flights and rental fleets. Durable and low maintenance.', image: '/images/chassis/commercial.jpg' },
    { id: 'adventure', name: 'Adventure', description: 'Lightweight, agile frame for backcountry flying and off-grid exploration. Built to handle rugged conditions.', image: '/images/chassis/adventure.jpg' },
    { id: 'reportage', name: 'Reportage', description: 'Stable platform tailored for aerial photography and video work, with extra mounting points for camera gear.', image: '/images/chassis/reportage.jpg' },
  ],
  propellers: [
    { id: 'no-propeller', name: 'No Propeller', description: 'Chassis only — add a propeller later or supply your own.', price: 0 },
    { id: 'bipala', name: 'Two-Blade Propeller (Carbon Fiber)', description: 'Two carbon fiber blades. Lightweight, ideal for standard flight.', price: 534.75 },
    { id: 'tripala', name: 'Three-Blade Propeller (Carbon Fiber)', description: 'Three carbon fiber blades. More thrust and smoother flight.', price: 677.35 },
  ],
  colors: [
    { name: 'Candy Red', hex: '#e74c3c' },
    { name: 'Candy Blue', hex: '#3498db' },
    { name: 'Candy Purple', hex: '#9b59b6' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Grey', hex: '#95a5a6' }
  ],
  accessories: [
    { id: 'sun-roof-netting', name: 'Sun-Roof Netting', price: 43, description: 'Protects the pilot from the sun and prevents paraglider lines from tangling with the helmet or trike equipment during sideways descent.', image: '/images/parts/sun-roof-netting.png' },
    { id: 'front-bar-protection', name: 'Padded Roll Bar Protector with Handles', price: 47, description: 'Protects the passenger and provides comfortable handles; front bars are padded for a robust look.', image: '/images/parts/front-bar-protection.png' },
    { id: 'front-brake', name: 'Front Brake', price: 120, description: 'Additional cable brake providing extra braking power — conventional mountain-bike derived system.', image: '/images/parts/front-fork.png' },
    { id: 'rear-mirror', name: 'Rear Mirror', price: 25, description: 'Essential for viewing wing position during the first quarter of lift on takeoff.', image: '/images/parts/instrument-kit-vanguard.png' },
    { id: 'cockpit-liner', name: 'Passenger & Pilot Cockpit Protective Liner', price: 105, description: 'Protective travel cover tailored for the pilot and passenger cockpit area. Designed specifically for trailering to shield sensitive components from dirt without creating aerodynamic drag on open trailers.', image: '/images/parts/cockpit-liner.png' },
    { id: 'parachute-container', name: 'Parachute Container', price: 55, description: 'Exclusive container for mounting on the right or left side of the harnesses.', image: '/images/parts/parachute-container.png' },
    { id: 'lateral-bag', name: 'Two Side Explorer Cases (L-R)', price: 95, description: 'Pair of aerodynamic side cases with extra straps for rods, tents, fuel, etc. without using internal space.', image: '/images/parts/lateral-bag-explorer.png' },
    { id: 'cruise-control', name: 'Cruise Control', price: 25, description: 'For long-distance flights — maintains desired RPM for stable, smooth flight.', image: '/images/parts/front-bar-protection.png' },
    { id: 'camel-back', name: 'Camel Back for Pilot Hydration', price: 25, description: 'An essential hydration bladder setup for long-endurance flights. Tucks neatly into the instrument holder pocket located on the back of the passenger seat.', image: '/images/parts/passenger-harness.png' },
    { id: 'fuel-gauge-vanguard', name: 'Analog Fuel Gauge (Vanguard)', price: 119, description: 'Analog fuel gauge for the Vanguard L-shaped tank.', image: '/images/parts/instrument-kit-vanguard.png' },
    { id: 'auxiliary-lights', name: 'Auxiliary Lights Kit', price: 187.10, description: 'Two UP67 50W waterproof LED lights, position indicator lights, luxury switch, wiring and relay.', image: '/images/parts/instrument-kit-vanguard.png' },
    { id: 'instrument-kit', name: 'Basic Instrument Kit (Vanguard)', price: 340, description: 'TTO digital RPM, spark plug temperature, coolant temperature gauges, and 4-port USB charger.', image: '/images/parts/instrument-kit-vanguard.png' },
    { id: 'electrical-kit', name: 'Complete Electrical Installation Kit', price: 218.20, description: 'Regulator/rectifier, relays, starter solenoid, magneto test buttons, master switch, and full wiring harness.', image: '/images/parts/instrument-kit-vanguard.png' },
    { id: 'carabiners', name: 'Two Carabiners', price: 90, description: 'High-capacity steel carabiners (2.4 kN each) for maximum safety.', image: '/images/parts/front-axle.png' },
    { id: 'propeller-guard', name: 'External Propeller Guard', price: 295, description: 'Prevents wing or lines from entering the propeller. Ideal for schools and beginners.', image: '/images/parts/pilot-dynamic-cage.png' },
  ]
}

const STEPS = ['Chassis', 'Engine', 'Propeller', 'Accessories', 'Review']

const VANGUARD_PRODUCTO_ID = PRODUCT_IDS.vanguard

const PRODUCT_IMAGES = [
  { src: '/images/vanguard/1.png', alt: 'Vanguard 1' },
  { src: '/images/vanguard/2.png', alt: 'Vanguard 2' },
  { src: '/images/vanguard/3.png', alt: 'Vanguard 3' },
  { src: '/images/vanguard/4.png', alt: 'Vanguard 4' },
  { src: '/images/vanguard/5.png', alt: 'Vanguard 5' },
  { src: '/images/vanguard/6.png', alt: 'Vanguard 6' },
  { src: '/images/vanguard/7.png', alt: 'Vanguard 7' },
  { src: '/images/vanguard/8.png', alt: 'Vanguard 8' },
  { src: '/images/vanguard/9.png', alt: 'Vanguard 9' },
  { src: '/images/vanguard/10.png', alt: 'Vanguard 10' },
]

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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
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

  const goToPreviousImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? PRODUCT_IMAGES.length - 1 : prev - 1))
  }

  const goToNextImage = () => {
    setSelectedImageIndex((prev) => (prev === PRODUCT_IMAGES.length - 1 ? 0 : prev + 1))
  }

  const toggleUpgrade = (id) => {
    setSelectedUpgrades(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const goNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
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

            <div className="relative aspect-square bg-bg2 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={PRODUCT_IMAGES[selectedImageIndex].src}
                alt={PRODUCT_IMAGES[selectedImageIndex].alt}
                fill
                className="object-cover"
                priority
              />

              {PRODUCT_IMAGES.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goToPreviousImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-ink shadow-md transition hover:bg-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={goToNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-ink shadow-md transition hover:bg-white"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {PRODUCT_IMAGES.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {PRODUCT_IMAGES.map((image, index) => (
                  <motion.button
                    key={image.src}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImageIndex === index ? 'border-brand' : 'border-borderline hover:border-brand/50'
                    }`}
                  >
                    <Image src={image.src} alt={image.alt} fill className="object-cover" />
                  </motion.button>
                ))}
              </div>
            )}

            {/* Color Selectors */}
            <div className="space-y-4">
              <details className="group border border-borderline rounded-xl p-4 hover:border-brand/50 transition">
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
                  <ConfigSection title="Chassis. Choose your type">
                    <div className="grid sm:grid-cols-1 gap-4">
                      {CONFIG_OPTIONS.chassisTypes.map(t => (
                        <OptionCard
                          key={t.id}
                          selected={selectedChassisType === t.id}
                          onClick={() => setSelectedChassisType(t.id)}
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
                        <OptionCard key={e.id} selected={selectedEngine === e.id} onClick={() => setSelectedEngine(e.id)}>
                          <p className="font-bold uppercase text-ink">{e.name}</p>
                          <p className="text-sm text-ink2 mt-1">
                            {e.basePrice === 0 ? 'Included' : `+$${e.basePrice.toLocaleString()}`}
                          </p>
                          {selectedEngine === e.id && e.image && (
                            <div className="mt-3 pt-3 border-t border-borderline/60 flex gap-3 items-start">
                              <OptionThumb src={e.image} alt={e.name} />
                            </div>
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
                        <OptionCard key={p.id} selected={selectedPropeller === p.id} onClick={() => setSelectedPropeller(p.id)}>
                          <div className="flex justify-between items-center pr-8">
                            <p className="font-bold uppercase text-ink">{p.name}</p>
                            <p className="text-sm text-ink2">{p.price === 0 ? 'Included' : `+$${p.price.toLocaleString()}`}</p>
                          </div>
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
                                <p className="text-sm text-ink2 text-left">{a.description}</p>
                              </div>
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
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Package className="w-8 h-8 text-ink2/40" />
        </div>
      )}
    </div>
  )
}
