'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, ShoppingCart, ArrowLeft, Check, X } from 'lucide-react'
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
    { id: 'front-guard', name: 'Front Guard', price: 150 },
    { id: 'sun-shade', name: 'Sun Shade', price: 90 },
    { id: 'cruise-control', name: 'Cruise Control', price: 250 },
    { id: 'ballistic-parachute', name: 'Ballistic Parachute', price: 1200 },
    { id: 'lights', name: 'Lights', price: 200 },
    { id: 'phone-holder', name: 'Phone Holder', price: 45 },
    { id: 'cover', name: 'Cover', price: 120 },
  ]
}

export default function ConfiguratorPage() {
  const [selectedEngine, setSelectedEngine] = useState(CONFIG_OPTIONS.engines[0].id)
  const [selectedFinish, setSelectedFinish] = useState(CONFIG_OPTIONS.chassisFinishes[0].id)
  const [selectedUpgrades, setSelectedUpgrades] = useState([])
  const [selectedChassisColor, setSelectedChassisColor] = useState(CONFIG_OPTIONS.colors[0].name)
  const [selectedPeriphColor, setSelectedPeriphColor] = useState(CONFIG_OPTIONS.colors[0].name)
  const { addConfiguredProduct, cargando } = useCart()

  const totalPrice = useMemo(() => {
    const baseChassis = 5950;
    const enginePrice = CONFIG_OPTIONS.engines.find(e => e.id === selectedEngine)?.basePrice || 0
    const finishPrice = CONFIG_OPTIONS.chassisFinishes.find(f => f.id === selectedFinish)?.price || 0
    const upgradesPrice = selectedUpgrades.reduce((sum, id) => sum + (CONFIG_OPTIONS.accessories.find(a => a.id === id)?.price || 0), 0)
    return baseChassis + enginePrice + finishPrice + upgradesPrice
  }, [selectedEngine, selectedFinish, selectedUpgrades])

  const toggleUpgrade = (id) => setSelectedUpgrades(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  const handleAddToCart = () => {
    addConfiguredProduct({
      model: "Vanguard V8.0",
      engine: selectedEngine,
      finish: selectedFinish,
      chassisColor: selectedChassisColor,
      peripheralColor: selectedPeriphColor,
      accessories: selectedUpgrades,
      totalPrice
    })
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-5xl font-black uppercase tracking-tight text-ink">Vanguard V8.0</h1>
          <p className="text-xl text-ink2 mt-2">Configure your dream machine</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-6">
            <div className="relative aspect-square bg-bg2 rounded-2xl overflow-hidden shadow-lg">
              <Image src="/images/vanguard1.png" alt="Vanguard V8.0" fill className="object-cover" />
            </div>

            <div className="space-y-4">
              <details className="group border border-borderline rounded-xl p-4">
                <summary className="flex justify-between items-center cursor-pointer font-bold uppercase">Chassis Color <ChevronDown className="group-open:rotate-180 transition-transform"/></summary>
                <div className="mt-4 flex gap-3">
                  {CONFIG_OPTIONS.colors.map(c => (
                    <button key={c.name} onClick={() => setSelectedChassisColor(c.name)} className="w-10 h-10 rounded-full border border-borderline flex items-center justify-center" style={{backgroundColor: c.hex}}>
                      {selectedChassisColor === c.name && <X className="text-black/50" />}
                    </button>
                  ))}
                </div>
              </details>
              <details className="group border border-borderline rounded-xl p-4">
                <summary className="flex justify-between items-center cursor-pointer font-bold uppercase">Peripheral Color <ChevronDown className="group-open:rotate-180 transition-transform"/></summary>
                <div className="mt-4 flex gap-3">
                  {CONFIG_OPTIONS.colors.map(c => (
                    <button key={c.name} onClick={() => setSelectedPeriphColor(c.name)} className="w-10 h-10 rounded-full border border-borderline flex items-center justify-center" style={{backgroundColor: c.hex}}>
                      {selectedPeriphColor === c.name && <X className="text-black/50" />}
                    </button>
                  ))}
                </div>
              </details>
            </div>
          </div>

          <div className="space-y-10">
            <ConfigSection title="Engine">
              {CONFIG_OPTIONS.engines.map(e => (
                <button key={e.id} onClick={() => setSelectedEngine(e.id)} className={`w-full p-4 mb-3 border-2 rounded-xl text-left ${selectedEngine === e.id ? 'border-brand bg-brand-soft' : 'border-borderline'}`}>
                  <p className="font-bold uppercase">{e.name}</p>
                  <p className="text-sm text-ink2">{e.basePrice === 0 ? 'Included' : `+$${e.basePrice.toLocaleString()}`}</p>
                </button>
              ))}
            </ConfigSection>

            <ConfigSection title="Finish">
              {CONFIG_OPTIONS.chassisFinishes.map(f => (
                <button key={f.id} onClick={() => setSelectedFinish(f.id)} className={`w-full p-4 mb-3 border-2 rounded-xl text-left ${selectedFinish === f.id ? 'border-brand bg-brand-soft' : 'border-borderline'}`}>
                  <p className="font-bold uppercase">{f.name}</p>
                </button>
              ))}
            </ConfigSection>

            <ConfigSection title="Accessories">
              <div className="space-y-3">
                {CONFIG_OPTIONS.accessories.map(a => (
                  <button key={a.id} onClick={() => toggleUpgrade(a.id)} className={`w-full p-4 border-2 rounded-xl flex justify-between ${selectedUpgrades.includes(a.id) ? 'border-brand bg-brand-soft' : 'border-borderline'}`}>
                    <span className="font-bold uppercase">{a.name}</span>
                    <span>+${a.price}</span>
                  </button>
                ))}
              </div>
            </ConfigSection>

            <div className="text-4xl font-black">Total: ${totalPrice.toLocaleString()}</div>
            <button onClick={handleAddToCart} className="w-full py-4 bg-brand text-white font-black uppercase rounded-xl">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfigSection({ title, children }) {
  return <div><h2 className="text-2xl font-black mb-6 uppercase">{title}</h2>{children}</div>
}