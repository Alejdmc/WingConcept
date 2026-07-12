'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronLeft, ChevronRight, ShoppingCart, ArrowLeft, Check } from 'lucide-react'
import { PRODUCT_IDS } from '@/lib/products'
import { useCart } from '@/hooks/useCart'

const CONFIG_OPTIONS = {
  engines: [
    { id: 'no-engine', name: 'No Engine', basePrice: 0 },
    { id: 'rotax-912', name: 'Rotax 912 (80HP)', basePrice: 15000 },
    { id: 'RMZ500', name: 'RMZ500', basePrice: 15000 },
    { id: 'simonini-v2', name: 'Simonini Victor 2 (112HP)', basePrice: 12000 },
    { id: 'hirth-3503', name: 'Hirth 3503 (70HP)', basePrice: 11000 },
  ],
  chassisFinishes: [
    { id: 'black-matte', name: 'Black Stealth Matte', price: 0 },
    { id: 'gloss-carbon', name: 'Gloss Carbon Fiber', price: 800 },
    { id: 'titanium-anodized', name: 'Titanium Anodized', price: 500 },
  ],
  colors: [
    { name: 'Candy Red', hex: '#e74c3c' },
    { name: 'Candy Blue', hex: '#3498db' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Grey', hex: '#95a5a6' }
  ],
  accessories: [
    { id: 'cruise-control', name: 'Cruise Control', price: 20 },
    { id: 'camel-back', name: 'Camel Back for Pilot Hydration', price: 25 },
    { id: 'sun-roof-netting', name: 'Sun-Roof Netting', price: 30 },
    { id: 'parachute-container', name: 'Parachute Container', price: 55 },
    { id: 'front-axle', name: 'Front Axle', price: 75 },
    { id: 'front-bar-protection', name: 'Protection with Front Bar Handle', price: 80 },
    { id: 'lateral-bag', name: 'Lateral Bag for Vanguard', price: 90 },
    { id: 'cockpit-liner', name: 'Passenger & Pilot Cockpit Protective Liner', price: 105 },
    { id: 'pilot-harness', name: 'Pilot Harness', price: 190 },
    { id: 'passenger-harness', name: 'Passenger Harness', price: 220 },
    { id: 'front-fork', name: 'Front Fork', price: 280 },
    { id: 'pilot-dynamic-cage', name: 'Pilot Dynamic Cage', price: 300 },
    { id: 'pilot-hunter-cage', name: 'Pilot Hunter Cage', price: 300 },
    { id: 'instrument-kit', name: 'Basic Instrument Kit (Vanguard)', price: 440 },
  ]
}

const VANGUARD_PRODUCTO_ID = PRODUCT_IDS.vanguard

const PRODUCT_IMAGES = [
  { src: '/images/1vanguard.png', alt: 'Vanguard 1' },
  { src: '/images/2vanguard.png', alt: 'Vanguard 2' },
  { src: '/images/3vanguard.png', alt: 'Vanguard 3' },
  { src: '/images/4vanguard.png', alt: 'Vanguard 4' },
  { src: '/images/5vanguard.png', alt: 'Vanguard 5' },
  { src: '/images/6vanguard.png', alt: 'Vanguard 6' },
  { src: '/images/7vanguard.png', alt: 'Vanguard 7' },
  { src: '/images/8vanguard.png', alt: 'Vanguard 8' },
  { src: '/images/9vanguard.png', alt: 'Vanguard 9' },
  { src: '/images/10vanguard.png', alt: 'Vanguard 10' },
]

export default function ConfiguratorPage() {
  const router = useRouter()
  const { addConfiguredProduct } = useCart()
  const [selectedEngine, setSelectedEngine] = useState(CONFIG_OPTIONS.engines[0].id)
  const [selectedFinish, setSelectedFinish] = useState(CONFIG_OPTIONS.chassisFinishes[0].id)
  const [selectedUpgrades, setSelectedUpgrades] = useState([])
  const [selectedChassisColor, setSelectedChassisColor] = useState(CONFIG_OPTIONS.colors[0].name)
  const [selectedPeriphColor, setSelectedPeriphColor] = useState(CONFIG_OPTIONS.colors[0].name)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const totalPrice = useMemo(() => {
    const baseChassis = 5950
    const enginePrice = CONFIG_OPTIONS.engines.find(e => e.id === selectedEngine)?.basePrice || 0
    const finishPrice = CONFIG_OPTIONS.chassisFinishes.find(f => f.id === selectedFinish)?.price || 0
    const upgradesPrice = selectedUpgrades.reduce((sum, id) => sum + (CONFIG_OPTIONS.accessories.find(a => a.id === id)?.price || 0), 0)
    return baseChassis + enginePrice + finishPrice + upgradesPrice
  }, [selectedEngine, selectedFinish, selectedUpgrades])

  const goToPreviousImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? PRODUCT_IMAGES.length - 1 : prev - 1))
  }

  const goToNextImage = () => {
    setSelectedImageIndex((prev) => (prev === PRODUCT_IMAGES.length - 1 ? 0 : prev + 1))
  }

  const toggleUpgrade = (id) => {
    setSelectedUpgrades(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleAddToCart = async () => {
    setLoading(true)
    setError('')

    try {
      await addConfiguredProduct({
        producto_id: VANGUARD_PRODUCTO_ID,
        cantidad: 1,
        engine: selectedEngine,
        finish: selectedFinish,
        chassisColor: selectedChassisColor,
        peripheralColor: selectedPeriphColor,
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
          <h1 className="text-5xl font-black uppercase tracking-tight text-ink">Vanguard V8.0</h1>
          <p className="text-xl text-ink2 mt-2">Configure your dream machine</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left: Image & Colors */}
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
                  Peripheral Color
                  <ChevronDown className="group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 flex gap-3 flex-wrap">
                  {CONFIG_OPTIONS.colors.map(c => (
                    <motion.button
                      key={c.name}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedPeriphColor(c.name)}
                      className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center
                        ${selectedPeriphColor === c.name ? 'border-brand scale-110' : 'border-borderline hover:border-brand/50'}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}>
                      {selectedPeriphColor === c.name && <Check className="w-5 h-5 text-white drop-shadow" />}
                    </motion.button>
                  ))}
                </div>
              </details>
            </div>
          </motion.div>

          {/* Right: Configuration Options */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8">
            
            {/* Engine */}
            <ConfigSection title="Engine. Which is right for you?">
              <div className="space-y-3">
                {CONFIG_OPTIONS.engines.map(e => (
                  <motion.button
                    key={e.id}
                    onClick={() => setSelectedEngine(e.id)}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 border-2 rounded-xl text-left transition-all
                      ${selectedEngine === e.id ? 'border-brand bg-brand-soft' : 'border-borderline hover:border-brand/50'}`}>
                    <p className="font-bold uppercase text-ink">{e.name}</p>
                    <p className="text-sm text-ink2 mt-1">
                      {e.basePrice === 0 ? 'Included' : `+$${e.basePrice.toLocaleString()}`}
                    </p>
                  </motion.button>
                ))}
              </div>
            </ConfigSection>

            {/* Finish */}
            <ConfigSection title="Finish. Pick your favourite">
              <div className="space-y-3">
                {CONFIG_OPTIONS.chassisFinishes.map(f => (
                  <motion.button
                    key={f.id}
                    onClick={() => setSelectedFinish(f.id)}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 border-2 rounded-xl text-left transition-all
                      ${selectedFinish === f.id ? 'border-brand bg-brand-soft' : 'border-borderline hover:border-brand/50'}`}>
                    <div className="flex justify-between items-center">
                      <p className="font-bold uppercase text-ink">{f.name}</p>
                      <p className="text-sm text-ink2">
                        {f.price === 0 ? 'Standard' : `+$${f.price.toLocaleString()}`}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </ConfigSection>

            {/* Accessories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}>
              <details className="group border-2 border-borderline rounded-xl p-4 hover:border-brand/50 transition">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <span className="text-2xl font-black uppercase text-ink tracking-tight">
                    Accessories. Enhance your flight
                    {selectedUpgrades.length > 0 && (
                      <span className="ml-3 text-sm font-bold text-brand align-middle">
                        {selectedUpgrades.length} selected
                      </span>
                    )}
                  </span>
                  <ChevronDown className="w-6 h-6 text-ink shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-6 space-y-3">
                  {CONFIG_OPTIONS.accessories.map(a => (
                    <motion.button
                      key={a.id}
                      onClick={() => toggleUpgrade(a.id)}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-4 border-2 rounded-xl flex justify-between items-center transition-all
                        ${selectedUpgrades.includes(a.id) ? 'border-brand bg-brand-soft' : 'border-borderline hover:border-brand/50'}`}>
                      <p className="font-bold uppercase text-ink">{a.name}</p>
                      <p className="font-semibold text-ink2">+${a.price}</p>
                    </motion.button>
                  ))}
                </div>
              </details>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                {error}
              </motion.div>
            )}

            {/* Price & CTA */}
            <motion.div
              layout
              className="bg-brand-soft border-2 border-brand rounded-xl p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-brand/80 mb-2">Total Price</p>
              <motion.p
                key={totalPrice}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-black text-brand mb-6">
                ${totalPrice.toLocaleString()}
              </motion.p>

              <motion.button
                onClick={handleAddToCart}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-brand text-white font-black uppercase tracking-widest rounded-lg hover:bg-brand/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                {loading ? 'Adding to cart...' : 'Add to Cart'}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function ConfigSection({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}>
      <h2 className="text-2xl font-black uppercase text-ink mb-6 tracking-tight">{title}</h2>
      {children}
    </motion.div>
  )
}