'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const products = [
  { 
    id: 1, 
    name: 'Disruptor', 
    image: '/images/disruptor_ejemplo.png', 
    price: '$5,000', 
    desc: 'Ultimate power & agility', 
    specs: '28kg | 95kg thrust' 
  },
  { 
    id: 2, 
    name: 'I-Pro', 
    image: '/images/ipro_ejemplo.png', 
    price: '$5,200', 
    desc: 'Next-gen lightweight', 
    specs: '26kg | 90kg thrust' 
  },
  { 
    id: 3, 
    name: 'Paramotor Trike', 
    image: '/images/paramotor_trike_ejemplo.png', 
    price: '$1,350', 
    desc: 'Stable ride & long-range', 
    specs: '40kg | 110kg thrust' 
  },
]

export default function Catalog() {
  const [selectedId, setSelectedId] = useState(null)

  return (
    <section id="paramotors-section" className="py-24 bg-black text-white px-6 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-black uppercase text-center mb-16 tracking-tighter">Paramotors</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <motion.div
              key={product.id}
              layout // Clave para la animación suave
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden border border-white/10 bg-neutral-900 cursor-pointer transition-all duration-500 
                ${selectedId === product.id ? 'shadow-[0_0_30px_rgba(59,130,246,0.3)] border-blue-500' : 'hover:border-white/30'}`}
              onClick={() => setSelectedId(selectedId === product.id ? null : product.id)}
            >
              {/* Imagen con Next/Image para mejor performance */}
              <div className="relative h-64 w-full bg-neutral-800">
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  fill 
                  className="object-cover" 
                />
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-2xl font-bold uppercase">{product.name}</h3>
                  <span className="text-blue-400 font-mono font-bold text-lg">{product.price}</span>
                </div>
                <p className="text-white/60 uppercase text-xs tracking-widest">{product.desc}</p>
              </div>

              {/* Expansión de información animada */}
              <AnimatePresence>
                {selectedId === product.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden bg-neutral-950 border-t border-white/10"
                  >
                    <div className="p-6">
                      <p className="text-sm text-gray-300 mb-4 font-mono">{product.specs}</p>
                      <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-sm transition-all">
                        Add to Cart
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}