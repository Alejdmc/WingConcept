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
      prev.includes(upgradeId) ? prev.filter(id => id !== upgradeId) : [...prev, upgradeId]
    )
  }

  const selectedEngineObj = CONFIG_OPTIONS.engines.find(e => e.id === selectedEngine)
  const selectedFinishObj = CONFIG_OPTIONS.chassisFinishes.find(f => f.id === selectedFinish)

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      {/* Fixed Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur border-b border-white/10 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/paratrike" className="flex items-center gap-2 hover:text-brand transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-black uppercase tracking-widest">Back</span>
          </Link>
          <h1 className="text-2xl font-black uppercase tracking-widest text-center">Vanguard V7.0 Configurator</h1>
          <div className="w-20" />
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
        {/* LEFT: Preview */}
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="lg:col-span-1">
          <div className="relative aspect-square bg-gradient-to-br from-white/5 to-black rounded-2xl overflow-hidden border border-white/10 mb-8">
            <Image src="/images/vanguard1.png" alt="Vanguard V7.0" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Engine</p>
              <p className="text-lg font-black">{selectedEngineObj?.name}</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-brand/20 to-brand/10 border border-brand/50 rounded-xl p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-brand/80 mb-2">Total Price</p>
            <p className="text-5xl font-black text-brand">${totalPrice.toLocaleString()}</p>
          </div>
        </motion.div>

        {/* RIGHT: Controls */}
        <div className="lg:col-span-2 space-y-4">
          <ConfigSection title="Engine Selection" icon={<Zap className="w-5 h-5" />} isExpanded={expandedSection === 'engine'} onToggle={() => setExpandedSection(expandedSection === 'engine' ? null : 'engine')}>
            <div className="grid grid-cols-1 gap-3">
              {CONFIG_OPTIONS.engines.map(engine => (
                <button key={engine.id} onClick={() => setSelectedEngine(engine.id)} className={`p-4 rounded-lg border-2 transition-all ${selectedEngine === engine.id ? 'border-brand bg-brand/10' : 'border-white/10 bg-white/5'}`}>
                  <div className="flex justify-between items-center"><p className="font-black uppercase">{engine.name}</p> {selectedEngine === engine.id && <div className="w-3 h-3 bg-brand rounded-full" />}</div>
                </button>
              ))}
            </div>
          </ConfigSection>

          <ConfigSection title="Chassis Finish" isExpanded={expandedSection === 'finish'} onToggle={() => setExpandedSection(expandedSection === 'finish' ? null : 'finish')}>
            {CONFIG_OPTIONS.chassisFinishes.map(finish => (
              <button key={finish.id} onClick={() => setSelectedFinish(finish.id)} className={`w-full p-4 mb-2 rounded-lg border-2 ${selectedFinish === finish.id ? 'border-brand bg-brand/10' : 'border-white/10'}`}>
                {finish.name}
              </button>
            ))}
          </ConfigSection>

          <ConfigSection title="Performance Upgrades" isExpanded={expandedSection === 'upgrades'} onToggle={() => setExpandedSection(expandedSection === 'upgrades' ? null : 'upgrades')}>
            {CONFIG_OPTIONS.upgrades.map(upgrade => (
              <button key={upgrade.id} onClick={() => toggleUpgrade(upgrade.id)} className={`w-full p-4 mb-2 rounded-lg border-2 ${selectedUpgrades.includes(upgrade.id) ? 'border-brand bg-brand/10' : 'border-white/10'}`}>
                {upgrade.name} (+${upgrade.price})
              </button>
            ))}
          </ConfigSection>

          <button className="w-full bg-brand py-4 rounded-lg font-black uppercase tracking-widest mt-8">
            Add to Cart - ${totalPrice.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  )
}

function ConfigSection({ title, icon, isExpanded, onToggle, children }) {
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
      <button onClick={onToggle} className="w-full p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">{icon} <h3 className="font-black uppercase">{title}</h3></div>
        <ChevronDown className={`transition ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {isExpanded && <div className="px-6 pb-6">{children}</div>}
    </div>
  )
}