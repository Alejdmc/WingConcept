'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronLeft, ChevronRight, ShoppingCart, ArrowLeft, Check, Package } from 'lucide-react'
import { PRODUCT_IDS } from '@/lib/products'
import { useCart } from '@/hooks/useCart'
import WizardProgress from '@/components/configurator/WizardProgress'

const CONFIG_OPTIONS = {
  engines: [
    { id: 'polini-303', name: 'Polini Thor 303', power: '38 HP', basePrice: 3950, image: '/images/engines/polini-303.jpg' },
    { id: 'polini-260', name: 'Polini Thor 260', power: '24 HP', basePrice: 4200, image: '/images/engines/polini-260.jpg' },
    { id: 'vittorazi-300-my25', name: 'Vittorazi Cosmos 300 MY25', power: '36 HP', basePrice: 4560, image: '/images/engines/vittorazi-300-my25.jpg' },
  ],
  chassisFinishes: [
    { id: 'stainless-brushed', name: 'Stainless Steel Brushed', description: 'Brushed stainless steel, maximum weather resistance.', swatch: '#b5b8bb' },
    { id: 'anodized-black', name: 'Anodized Black', description: 'Black anodized finish, aggressive look and extra corrosion protection.', swatch: '#1c1c1c' },
    { id: 'titanium-finish', name: 'Titanium Finish', description: 'Titanium finish, lightweight with high structural strength.', swatch: '#8e8e8e' },
  ],
  propellers: [
    { id: 'bipala', name: 'Two-Blade Propeller (Carbon Fiber)', description: 'Two carbon fiber blades. Lightweight, ideal for standard flight.', price: 0 },
    { id: 'tripala', name: 'Three-Blade Propeller (Carbon Fiber)', description: 'Three carbon fiber blades. More thrust and smoother flight.', price: 0 },
  ],
  colors: [
    { name: 'Candy Red', hex: '#e74c3c' },
    { name: 'Candy Blue', hex: '#3498db' },
    { name: 'Candy Purple', hex: '#9b59b6' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Grey', hex: '#95a5a6' }
  ],
  accessories: [
    { id: 'cruise-control', name: 'Cruise Control', price: 20, description: 'Flight cruise control throttle module engineered for twin-cylinder aviation engines, strategically positioned for instant and safe manual deactivation.', image: '/images/accessories/cruise-control.jpg' },
    { id: 'camel-back', name: 'Camel Back for Pilot Hydration', price: 25, description: "Crucial hydration system for pilots undertaking long cross-country flights. The bladder unit is engineered to fit into the dedicated instrument pocket on the backrest of the passenger seat.", image: '/images/accessories/camel-back.jpg' },
    { id: 'sun-roof-netting', name: 'Sun-Roof Netting', price: 30, description: 'Overhead sunshade mesh netting that blocks harmful UV rays while remaining fully aerodynamic to eliminate flight drag.', image: '/images/parts/sun-roof-netting.png' },
    { id: 'lateral-bag-explorer', name: 'Lateral Bag Explorer', price: 85, description: 'Side-mounted storage bag built from durable materials, optimized for easy access to gear during exploration flights.', image: '/images/parts/lateral-bag-explorer.png' },
    { id: 'cockpit-liner', name: 'Passenger & Pilot Cockpit Protective Liner', price: 105, description: 'Specialized protective storage cover that wraps the pilot and passenger cabin. Intended for open trailer transport, it shields sensitive flight equipment against wind and road grime without adding aerodynamic drag while towing.', image: '/images/parts/cockpit-liner.png' },
    { id: 'bottom-explorer-bag', name: 'Bottom Explorer Bag', price: 124.80, description: 'High-capacity under-carriage storage bag designed exclusively for the Nomadic trike to securely haul heavy travel gear.', image: '/images/parts/bottom-explorer-bag.png' },
    { id: 'instrument-kit', name: 'Basic Instrument Kit (Nomadic)', price: 350, description: 'Flight management dashboard kit with a USB charging port and 3 precision TTO engine sensors monitoring Cylinder Head Temperature (CHT), RPM, and radiator water temperature. Compatible with all engine types (Rotax, Vittorazi, Polini, Sky, etc.).', image: '/images/parts/instrument-kit-nomadic.png' },
  ]
}

const STEPS = ['Chassis', 'Engine', 'Propeller', 'Accessories', 'Review']

const NOMADIC_PRODUCTO_ID = PRODUCT_IDS.nomadic

const PRODUCT_IMAGES = [
  { src: '/images/nomadic/1.jpg', alt: 'Nomadic 1' },
  { src: '/images/nomadic/2.jpg', alt: 'Nomadic 2' },
  { src: '/images/nomadic/3.jpg', alt: 'Nomadic 3' },
  { src: '/images/nomadic/4.jpg', alt: 'Nomadic 4' },
  { src: '/images/nomadic/5.jpg', alt: 'Nomadic 5' },
  { src: '/images/nomadic/6.jpg', alt: 'Nomadic 6' },
]

export default function ConfiguratorNomadicPage() {
  const router = useRouter()
  const { addConfiguredProduct } = useCart()
  const [step, setStep] = useState(0)
  const [selectedEngine, setSelectedEngine] = useState(CONFIG_OPTIONS.engines[0].id)
  const [selectedFinish, setSelectedFinish] = useState(CONFIG_OPTIONS.chassisFinishes[0].id)
  const [selectedPropeller, setSelectedPropeller] = useState(CONFIG_OPTIONS.propellers[0].id)
  const [selectedUpgrades, setSelectedUpgrades] = useState([])
  const [selectedChassisColor, setSelectedChassisColor] = useState(CONFIG_OPTIONS.colors[0].name)
  const [selectedAccentColor, setSelectedAccentColor] = useState(CONFIG_OPTIONS.colors[0].name)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const accessories = CONFIG_OPTIONS.accessories

  const engine = CONFIG_OPTIONS.engines.find(e => e.id === selectedEngine)
  const finish = CONFIG_OPTIONS.chassisFinishes.find(f => f.id === selectedFinish)
  const propeller = CONFIG_OPTIONS.propellers.find(p => p.id === selectedPropeller)
  const selectedAccessoryItems = accessories.filter(a => selectedUpgrades.includes(a.id))

  const totalPrice = useMemo(() => {
    const baseChassis = 8950
    const enginePrice = engine?.basePrice || 0
    const propellerPrice = propeller?.price || 0
    const upgradesPrice = selectedUpgrades.reduce((sum, id) => sum + (CONFIG_OPTIONS.accessories.find(a => a.id === id)?.price || 0), 0)
    return baseChassis + enginePrice + propellerPrice + upgradesPrice
  }, [engine, propeller, selectedUpgrades])

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
        producto_id: NOMADIC_PRODUCTO_ID,
        cantidad: 1,
        engine: selectedEngine,
        finish: selectedFinish,
        propeller: selectedPropeller,
        chassisColor: selectedChassisColor,
        accentColor: selectedAccentColor,
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
      <div className="sticky top-0 z-40 bg-white border-b border-borderline py-6 px-6">
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

              <details className="group border border-borderline rounded-xl p-4 hover:border-brand/50 transition">
                <summary className="flex justify-between items-center cursor-pointer font-bold uppercase tracking-wide text-ink">
                  Accent Color
                  <ChevronDown className="group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 flex gap-3 flex-wrap">
                  {CONFIG_OPTIONS.colors.map(c => (
                    <motion.button
                      key={c.name}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedAccentColor(c.name)}
                      className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center
                        ${selectedAccentColor === c.name ? 'border-brand scale-110' : 'border-borderline hover:border-brand/50'}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}>
                      {selectedAccentColor === c.name && <Check className="w-5 h-5 text-white drop-shadow" />}
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
                  <ConfigSection title="Chassis. Choose your finish">
                    <div className="grid sm:grid-cols-1 gap-4">
                      {CONFIG_OPTIONS.chassisFinishes.map(f => (
                        <OptionCard
                          key={f.id}
                          selected={selectedFinish === f.id}
                          onClick={() => setSelectedFinish(f.id)}
                        >
                          <div className="flex items-center gap-4">
                            <span className="w-14 h-14 rounded-lg shrink-0 border border-borderline" style={{ backgroundColor: f.swatch }} />
                            <div className="flex-1">
                              <p className="font-bold uppercase text-ink">{f.name}</p>
                              <p className="text-sm text-ink2 mt-1">{f.description}</p>
                            </div>
                          </div>
                        </OptionCard>
                      ))}
                    </div>
                  </ConfigSection>
                )}

                {step === 1 && (
                  <ConfigSection title="Engine. Pure Power">
                    <div className="space-y-3">
                      {CONFIG_OPTIONS.engines.map(e => (
                        <OptionCard key={e.id} selected={selectedEngine === e.id} onClick={() => setSelectedEngine(e.id)}>
                          <p className="font-bold uppercase text-ink">{e.name}</p>
                          <p className="text-sm text-ink2 mt-1">{e.power} — +${e.basePrice.toLocaleString()}</p>
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
                            {isSelected && (
                              <div className="mt-3 pt-3 border-t border-borderline/60 flex gap-3 items-start">
                                <OptionThumb src={a.image} alt={a.name} />
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
                      <SummaryRow label="Chassis" value={finish?.name} />
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
    <div className="flex justify-between items-center py-1 border-b border-borderline/60">
      <span className="text-ink2">{value ? `${label} — ${value}` : label}</span>
      {typeof price === 'number' && (
        <span className="font-semibold text-ink">{price === 0 ? 'Included' : `+$${price.toLocaleString()}`}</span>
      )}
    </div>
  )
}

function OptionThumb({ src, alt }) {
  const [imgError, setImgError] = useState(false)
  return (
    <div className="relative w-28 h-28 shrink-0 rounded-lg overflow-hidden bg-bg2">
      {!imgError ? (
        <Image src={src} alt={alt} fill className="object-cover" onError={() => setImgError(true)} />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Package className="w-8 h-8 text-ink2/40" />
        </div>
      )}
    </div>
  )
}
