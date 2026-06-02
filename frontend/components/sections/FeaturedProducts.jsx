'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'

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

export default function FeaturedProducts() {
  const [selectedId, setSelectedId] = useState(null)
  const { addToCart } = useCart()

  return (
    <section 
      id="featured-products" 
      className="py-24 px-6 scroll-mt-24 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/images/cloudfeatured.png)' }}>
      
      {/* Overlay para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-5xl font-black uppercase text-center mb-16 tracking-tighter text-white">Featured Products</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <motion.div
              key={product.id}
              layout
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden border bg-neutral-900/95 cursor-pointer transition-all duration-500 
                ${selectedId === product.id ? 'shadow-[0_0_30px_rgba(192,57,43,0.5)] border-brand' : 'border-white/10 hover:border-white/30'}`}
              onClick={() => setSelectedId(selectedId === product.id ? null : product.id)}
            >
              {/* Imagen */}
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
                  <h3 className="text-2xl font-bold uppercase text-white">{product.name}</h3>
                  <span className="text-brand font-mono font-bold text-lg">{product.price}</span>
                </div>
                <p className="text-white/60 uppercase text-xs tracking-widest">{product.desc}</p>
              </div>

              {/* Expansión animada */}
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
                      <button 
                        onClick={() => {
                          addToCart(product)
                          setSelectedId(null)
                        }}
                        className="w-full py-3 bg-brand hover:bg-brand/90 text-white font-bold uppercase tracking-widest text-sm transition-all">
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