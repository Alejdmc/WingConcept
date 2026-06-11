'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, ShoppingCart, ArrowLeft, Zap } from 'lucide-react'

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
  const [expandedSection, setExpandedSection] = useState('engine')

  // Cálculo de precio
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

  const selectedEngineObj = CONFIG_OPTIONS.engines.find(e => e.id === selectedEngine)
  const selectedFinishObj = CONFIG_OPTIONS.chassisFinishes.find(f => f.id === selectedFinish)

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-white/10 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/paratrike" className="flex items-center gap-2 hover:text-brand transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-black uppercase tracking-widest">Back</span>
          </Link>
          <h1 className="text-2xl font-black uppercase tracking-widest">Vanguard V7.0 Configurator</h1>
          <div className="w-20" />
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">

        {/* LEFT: Product Image & Preview */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-1 flex flex-col">

          {/* Image Container */}
          <div className="relative aspect-square bg-gradient-to-br from-white/5 to-black rounded-2xl overflow-hidden border border-white/10 mb-8">
            <Image
              src="/images/vanguard_hero.png"
              alt="Vanguard V7.0"
              fill
              className="object-cover"
              priority
            />
            {/* Overlay de specs en tiempo real */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Engine</p>
                <p className="text-lg font-black">{selectedEngineObj?.name}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50 mt-3">Finish</p>
                <p className="text-sm font-semibold">{selectedFinishObj?.name}</p>
              </div>
            </div>
          </div>

          {/* Price Display */}
          <motion.div
            layout
            className="bg-gradient-to-r from-brand/20 to-brand/10 border border-brand/50 rounded-xl p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-brand/80 mb-2">Total Price</p>
            <motion.p
              key={totalPrice}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-5xl font-black text-brand">
              ${totalPrice.toLocaleString()}
            </motion.p>
            <p className="text-xs text-white/40 mt-3">Base trike + customization</p>
          </motion.div>
        </motion.div>

        {/* RIGHT: Configuration Controls */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-2 space-y-4">

          {/* 1. ENGINE SELECTION */}
          <ConfigSection
            title="Engine Selection"
            icon={<Zap className="w-5 h-5" />}
            isExpanded={expandedSection === 'engine'}
            onToggle={() => setExpandedSection(expandedSection === 'engine' ? null : 'engine')}>
            <div className="grid grid-cols-1 gap-3">
              {CONFIG_OPTIONS.engines.map(engine => (
                <motion.button
                  key={engine.id}
                  onClick={() => setSelectedEngine(engine.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 transition-all text-left group
                    ${selectedEngine === engine.id
                      ? 'border-brand bg-brand/10'
                      : 'border-white/10 bg-white/5 hover:border-brand/50'
                    }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black uppercase tracking-wide">{engine.name}</p>
                      <p className="text-xs text-white/50 mt-1">Base: ${engine.basePrice.toLocaleString()}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                      ${selectedEngine === engine.id ? 'border-brand bg-brand' : 'border-white/30'}`}>
                      {selectedEngine === engine.id && <div className="w-2 h-2 bg-black rounded-full" />}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </ConfigSection>

          {/* 2. CHASSIS FINISH */}
          <ConfigSection
            title="Chassis Finish"
            isExpanded={expandedSection === 'finish'}
            onToggle={() => setExpandedSection(expandedSection === 'finish' ? null : 'finish')}>
            <div className="grid grid-cols-1 gap-3">
              {CONFIG_OPTIONS.chassisFinishes.map(finish => (
                <motion.button
                  key={finish.id}
                  onClick={() => setSelectedFinish(finish.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 transition-all text-left
                    ${selectedFinish === finish.id
                      ? 'border-brand bg-brand/10'
                      : 'border-white/10 bg-white/5 hover:border-brand/50'
                    }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black uppercase tracking-wide">{finish.name}</p>
                      <p className="text-xs text-white/50 mt-1">
                        {finish.price === 0 ? 'Standard' : `+$${finish.price.toLocaleString()}`}
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                      ${selectedFinish === finish.id ? 'border-brand bg-brand' : 'border-white/30'}`}>
                      {selectedFinish === finish.id && <div className="w-2 h-2 bg-black rounded-full" />}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </ConfigSection>

          {/* 3. UPGRADES */}
          <ConfigSection
            title="Performance Upgrades"
            isExpanded={expandedSection === 'upgrades'}
            onToggle={() => setExpandedSection(expandedSection === 'upgrades' ? null : 'upgrades')}>
            <div className="grid grid-cols-1 gap-3">
              {CONFIG_OPTIONS.upgrades.map(upgrade => (
                <motion.button
                  key={upgrade.id}
                  onClick={() => toggleUpgrade(upgrade.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 transition-all text-left
                    ${selectedUpgrades.includes(upgrade.id)
                      ? 'border-brand bg-brand/10'
                      : 'border-white/10 bg-white/5 hover:border-brand/50'
                    }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black uppercase tracking-wide">{upgrade.name}</p>
                      <p className="text-xs text-white/50 mt-1">+${upgrade.price.toLocaleString()}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                      ${selectedUpgrades.includes(upgrade.id) ? 'border-brand bg-brand' : 'border-white/30'}`}>
                      {selectedUpgrades.includes(upgrade.id) && (
                        <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </ConfigSection>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-brand to-brand/80 hover:from-brand/90 hover:to-brand/70 text-white py-4 rounded-lg font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all mt-8">
            <ShoppingCart className="w-5 h-5" />
            Add to Cart - ${totalPrice.toLocaleString()}
          </motion.button>

          {/* Summary */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-3">Your Configuration</p>
            <div className="space-y-2 text-sm">
              <p>🔧 <span className="font-semibold">{selectedEngineObj?.name}</span></p>
              <p>🎨 <span className="font-semibold">{selectedFinishObj?.name}</span></p>
              {selectedUpgrades.length > 0 && (
                <p>✨ <span className="font-semibold">{selectedUpgrades.length} upgrades selected</span></p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function ConfigSection({ title, icon, isExpanded, onToggle, children }) {
  return (
    <motion.div
      layout
      className="border border-white/10 rounded-xl overflow-hidden bg-white/5 hover:bg-white/[0.07] transition-all">
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-white/[0.08] transition">
        <div className="flex items-center gap-3">
          {icon && <div className="text-brand">{icon}</div>}
          <h3 className="font-black uppercase tracking-wider text-lg">{title}</h3>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-white/10 px-6 py-6">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}