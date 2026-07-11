'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, ShoppingCart, ArrowLeft, Check } from 'lucide-react'
import { PRODUCT_IDS } from '@/lib/products'
import { useCart } from '@/hooks/useCart'

const CONFIG_OPTIONS = {
  engines: [
    { id: 'polini-303', name: 'Polini Thor 303', power: '38 HP', basePrice: 8000 },
    { id: 'polini-260', name: 'Polini Thor 260', power: '24 HP', basePrice: 6500 },
    { id: 'vittorazi-300', name: 'Vittorazi Cosmos 300', power: '36 HP', basePrice: 7500 },
    { id: 'hirth-3503', name: 'Hirth 3503', power: '70 HP', basePrice: 9000 },
  ],
  chassisFinishes: [
    { id: 'stainless-brushed', name: 'Stainless Steel Brushed', price: 0 },
    { id: 'anodized-black', name: 'Anodized Black', price: 600 },
    { id: 'titanium-finish', name: 'Titanium Finish', price: 1200 },
  ],
  colors: [
    { name: 'Gunmetal', hex: '#2c3e50' },
    { name: 'Desert Sand', hex: '#c9b894' },
    { name: 'Forest Green', hex: '#27ae60' },
    { name: 'Arctic White', hex: '#ecf0f1' }
  ],
  accessories: [
    { id: 'prop-guard', name: 'Propeller Guard', price: 280 },
    { id: 'cage-hoop', name: 'Clear Cage Hoop', price: 150 },
    { id: 'lateral-bag', name: 'Expedition Side Bag', price: 220 },
    { id: 'passenger-pad', name: 'Passenger Pads', price: 95 },
    { id: 'nomadic-cover', name: 'Protective Cover', price: 180 },
    { id: 'front-handle', name: 'Front Handling Grip', price: 60 },
  ]
}

const NOMADIC_PRODUCTO_ID = PRODUCT_IDS.nomadic

export default function ConfiguratorNomadicPage() {
  const router = useRouter()
  const { addConfiguredProduct } = useCart()
  const [selectedEngine, setSelectedEngine] = useState(CONFIG_OPTIONS.engines[0].id)
  const [selectedFinish, setSelectedFinish] = useState(CONFIG_OPTIONS.chassisFinishes[0].id)
  const [selectedUpgrades, setSelectedUpgrades] = useState([])
  const [selectedChassisColor, setSelectedChassisColor] = useState(CONFIG_OPTIONS.colors[0].name)
  const [selectedAccentColor, setSelectedAccentColor] = useState(CONFIG_OPTIONS.colors[0].name)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const totalPrice = useMemo(() => {
    const baseChassis = 8950
    const enginePrice = CONFIG_OPTIONS.engines.find(e => e.id === selectedEngine)?.basePrice || 0
    const finishPrice = CONFIG_OPTIONS.chassisFinishes.find(f => f.id === selectedFinish)?.price || 0
    const upgradesPrice = selectedUpgrades.reduce((sum, id) => sum + (CONFIG_OPTIONS.accessories.find(a => a.id === id)?.price || 0), 0)
    return baseChassis + enginePrice + finishPrice + upgradesPrice
  }, [selectedEngine, selectedFinish, selectedUpgrades])

  const toggleUpgrade = (id) => {
    setSelectedUpgrades(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleAddToCart = async () => {
    setLoading(true)
    setError('')

    try {
      await addConfiguredProduct({
        producto_id: NOMADIC_PRODUCTO_ID,
        cantidad: 1,
        engine: selectedEngine,
        finish: selectedFinish,
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
          <Link href="/paratrike/nomadic" className="flex items-center gap-2 text-ink hover:text-brand transition">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-black uppercase tracking-tight text-ink">Nomadic Trike</h1>
          <p className="text-xl text-ink2 mt-2">Configure your ultimate adventure machine</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left: Image & Colors */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6">
            
            <div className="relative aspect-square bg-bg2 rounded-2xl overflow-hidden shadow-lg">
              <Image 
                src="/images/nomadic1.png" 
                alt="Nomadic Trike" 
                fill 
                className="object-cover"
                priority
              />
            </div>

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

          {/* Right: Configuration Options */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8">
            
            {/* Engine */}
            <ConfigSection title="Engine. Pure Power">
              <div className="space-y-3">
                {CONFIG_OPTIONS.engines.map(e => (
                  <motion.button
                    key={e.id}
                    onClick={() => setSelectedEngine(e.id)}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 border-2 rounded-xl text-left transition-all
                      ${selectedEngine === e.id ? 'border-brand bg-brand-soft' : 'border-borderline hover:border-brand/50'}`}>
                    <p className="font-bold uppercase text-ink">{e.name}</p>
                    <p className="text-sm text-ink2 mt-1">{e.power} — +${e.basePrice.toLocaleString()}</p>
                  </motion.button>
                ))}
              </div>
            </ConfigSection>

            {/* Finish */}
            <ConfigSection title="Finish. Built to Last">
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
            <ConfigSection title="Accessories. Enhance Adventure">
              <div className="space-y-3">
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
            </ConfigSection>

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