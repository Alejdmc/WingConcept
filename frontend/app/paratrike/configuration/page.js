'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, ShoppingCart, ArrowLeft, ChevronRight, Check } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

const CONFIG_OPTIONS = {
  engines: [
    { id: 'rotax-912', name: 'Rotax 912 (80HP)', basePrice: 15000 },
    { id: 'simonini-v2', name: 'Simonini Victor 2 (112HP)', basePrice: 12000 },
    { id: 'rotax-582', name: 'Rotax 582 (64HP)', basePrice: 10500 },
    { id: 'vanguard-efi', name: 'Vanguard EFI (70HP)', basePrice: 13500 },
    { id: 'hirth-3503', name: 'Hirth 3503 (70HP)', basePrice: 11000 },
  ],
  chassisFinishes: [
    { id: 'black-matte', name: 'Black Stealth Matte', price: 0 },
    { id: 'gloss-carbon', name: 'Gloss Carbon Fiber', price: 800 },
    { id: 'titanium-anodized', name: 'Titanium Anodized', price: 500 },
  ],
  upgrades: [
    { id: 'cooling-shroud', name: 'Carbon Cooling Shroud', price: 210 },
    { id: 'led-pack', name: 'Night Flight LED Package', price: 350 },
    { id: 'rescue-system', name: 'Ballistic Rescue System', price: 1200 },
    { id: 'instrument-upg', name: 'Digital Flight Computer', price: 650 },
  ]
}

export default function ConfiguratorPage() {
  const [selectedEngine, setSelectedEngine] = useState(CONFIG_OPTIONS.engines[0].id)
  const [selectedFinish, setSelectedFinish] = useState(CONFIG_OPTIONS.chassisFinishes[0].id)
  const [selectedUpgrades, setSelectedUpgrades] = useState([])
  const [addedToCart, setAddedToCart] = useState(false)
  const { addConfiguredProduct, cargando } = useCart()

  const totalPrice = useMemo(() => {
    const enginePrice = CONFIG_OPTIONS.engines.find(e => e.id === selectedEngine)?.basePrice || 0
    const finishPrice = CONFIG_OPTIONS.chassisFinishes.find(f => f.id === selectedFinish)?.price || 0
    const upgradesPrice = selectedUpgrades.reduce((sum, upgradeId) => {
      return sum + (CONFIG_OPTIONS.upgrades.find(u => u.id === upgradeId)?.price || 0)
    }, 0)
    return enginePrice + finishPrice + upgradesPrice
  }, [selectedEngine, selectedFinish, selectedUpgrades])

  const toggleUpgrade = (upgradeId) => {
    setSelectedUpgrades(prev =>
      prev.includes(upgradeId)
        ? prev.filter(id => id !== upgradeId)
        : [...prev, upgradeId]
    )
  }

  const handleAddToCart = async () => {
    const engineObj = CONFIG_OPTIONS.engines.find(e => e.id === selectedEngine)
    const finishObj = CONFIG_OPTIONS.chassisFinishes.find(f => f.id === selectedFinish)
    
    await addConfiguredProduct({
      engine: selectedEngine,
      engineName: engineObj?.name,
      finish: selectedFinish,
      finishName: finishObj?.name,
      upgrades: selectedUpgrades,
      totalPrice
    })
    
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const selectedEngineObj = CONFIG_OPTIONS.engines.find(e => e.id === selectedEngine)
  const selectedFinishObj = CONFIG_OPTIONS.chassisFinishes.find(f => f.id === selectedFinish)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-white border-b border-borderline py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/paratrike" className="flex items-center gap-2 text-ink hover:text-brand transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </Link>
          <h1 className="text-lg font-black uppercase text-ink tracking-tight">Vanguard V7.0</h1>
          <div className="w-20" />
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* LEFT: Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-start pt-0">
            
            {/* Image Container */}
            <div className="relative aspect-square bg-bg2 rounded-2xl overflow-hidden mb-8 shadow-lg">
              <Image
                src="/images/vanguard1.png"
                alt="Vanguard V7.0"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Image Navigation Dots */}
            <div className="flex justify-center gap-2 mb-12">
              {[0, 1, 2].map(i => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.2 }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === 0 ? 'bg-brand w-8' : 'bg-borderline'
                  }`}
                />
              ))}
            </div>

            {/* Price Display */}
            <motion.div
              layout
              className="space-y-2">
              <p className="text-sm font-semibold text-ink2 uppercase tracking-widest">Total Price</p>
              <motion.p
                key={totalPrice}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-black text-ink">
                ${totalPrice.toLocaleString()}
              </motion.p>
            </motion.div>
          </motion.div>

          {/* RIGHT: Configuration Controls */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10">
            
            {/* ENGINE SELECTION */}
            <ConfigSection title="Engine. Which is right for you?">
              <div className="space-y-3">
                {CONFIG_OPTIONS.engines.map(engine => (
                  <motion.button
                    key={engine.id}
                    onClick={() => setSelectedEngine(engine.id)}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left
                      ${selectedEngine === engine.id
                        ? 'border-brand bg-brand-soft'
                        : 'border-borderline bg-white hover:border-brand/50'
                      }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-ink uppercase tracking-wide">{engine.name}</p>
                        <p className="text-sm text-ink2 mt-1">From ${engine.basePrice.toLocaleString()}</p>
                      </div>
                      {selectedEngine === engine.id && (
                        <div className="w-5 h-5 rounded-full border-2 border-brand flex items-center justify-center bg-brand">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </ConfigSection>

            {/* CHASSIS FINISH */}
            <ConfigSection title="Finish. Pick your favourite">
              <div className="space-y-3">
                {CONFIG_OPTIONS.chassisFinishes.map(finish => (
                  <motion.button
                    key={finish.id}
                    onClick={() => setSelectedFinish(finish.id)}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left
                      ${selectedFinish === finish.id
                        ? 'border-brand bg-brand-soft'
                        : 'border-borderline bg-white hover:border-brand/50'
                      }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-ink uppercase tracking-wide">{finish.name}</p>
                        <p className="text-sm text-ink2 mt-1">
                          {finish.price === 0 ? 'Standard' : `+ $${finish.price.toLocaleString()}`}
                        </p>
                      </div>
                      {selectedFinish === finish.id && (
                        <div className="w-5 h-5 rounded-full border-2 border-brand flex items-center justify-center bg-brand">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </ConfigSection>

            {/* UPGRADES */}
            <ConfigSection title="Upgrades. Enhance your flight">
              <div className="space-y-3">
                {CONFIG_OPTIONS.upgrades.map(upgrade => (
                  <motion.button
                    key={upgrade.id}
                    onClick={() => toggleUpgrade(upgrade.id)}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left
                      ${selectedUpgrades.includes(upgrade.id)
                        ? 'border-brand bg-brand-soft'
                        : 'border-borderline bg-white hover:border-brand/50'
                      }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-ink uppercase tracking-wide">{upgrade.name}</p>
                        <p className="text-sm text-ink2 mt-1">+ ${upgrade.price.toLocaleString()}</p>
                      </div>
                      {selectedUpgrades.includes(upgrade.id) && (
                        <div className="w-5 h-5 rounded-full border-2 border-brand flex items-center justify-center bg-brand">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </ConfigSection>

            {/* CTA Button */}
            <motion.button
              onClick={handleAddToCart}
              disabled={cargando || addedToCart}
              whileHover={{ scale: cargando || addedToCart ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                addedToCart 
                  ? 'bg-green-500 text-white' 
                  : cargando 
                  ? 'bg-brand/50 text-white cursor-not-allowed'
                  : 'bg-brand text-white hover:bg-brand/90'
              }`}>
              {addedToCart ? (
                <>
                  <Check className="w-5 h-5" />
                  Added to Cart!
                </>
              ) : cargando ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </motion.div>
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function ConfigSection({ title, children }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}>
      <h2 className="text-2xl font-black text-ink mb-6 tracking-tight">
        {title}
      </h2>
      {children}
    </motion.div>
  )
}