'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import SafeImage from '@/components/ui/SafeImage'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Settings, Zap } from 'lucide-react'

const fallbackProducts = [
  { 
    id: 1,
    name: 'Vanguard V8.0', 
    image: '/images/vanguard/1.png',
    price: '$5,950', 
    desc: 'Ultimate High-Performance Trike', 
    specs: 'Premium Aluminum | Advanced Aerodynamics',
    badge: 'Premium',
    href: '/paratrike/vanguard'
  },
  { 
    id: 2,
    name: 'Nomadic Trike', 
    image: '/images/nomadic/1.jpg',
    price: '$8,950', 
    desc: 'The Ultimate Off-Grid Adventure Machine', 
    specs: 'Stainless Steel | All-Terrain Capability',
    badge: 'Expedition Ready',
    href: '/paratrike/nomadic'
  },
  { 
    id: 3,
    name: 'I-Pro', 
    image: '/images/ipro_ejemplo.PNG', 
    price: '$5,950', 
    desc: 'Next-gen lightweight design', 
    specs: '26kg | 90kg thrust',
    badge: 'New',
    href: '/paramotors'
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
}

export default function FeaturedProducts() {
  const [selectedId, setSelectedId] = useState(null)
  const [products, setProducts] = useState(fallbackProducts)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const featured = await api.productos.destacados()
        if (featured && featured.length > 0) {
          setProducts(featured)
        }
      } catch (err) {
        console.error('Error loading featured products:', err)
        setError('Could not load featured products.')
      } finally {
        setLoading(false)
      }
    }

    loadFeatured()
  }, [])

  const items = products.length > 0 ? products : fallbackProducts

  return (
    <section 
      id="featured-products" 
      className="py-32 px-6 scroll-mt-24 relative bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: 'url(/images/cloudfeatured.png)' }}>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}>
            <p className="text-brand font-bold uppercase tracking-[0.3em] text-sm mb-4">Premium Selection</p>
          </motion.div>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase text-white mb-6 tracking-tight">Featured Products</h2>
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-1 bg-gradient-to-r from-transparent via-brand to-transparent max-w-md mx-auto" />
        </div>
        
        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}>

          {items.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className={`relative group cursor-pointer transition-all duration-500`}
              onClick={() => setSelectedId(selectedId === product.id ? null : product.id)}
            >
              {/* Card Container */}
              <motion.div
                className={`relative overflow-hidden rounded-xl border-2 backdrop-blur-sm transition-all duration-500
                  ${selectedId === product.id 
                    ? 'border-brand shadow-[0_0_40px_rgba(192,57,43,0.6)] bg-neutral-900/80' 
                    : 'border-white/20 bg-neutral-900/60 hover:border-brand/50 group-hover:shadow-[0_0_30px_rgba(192,57,43,0.3)]'}`}>
                
                {/* Badge */}
                <div className="absolute top-4 right-4 z-20">
                  <motion.span 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-brand text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                    {product.badge}
                  </motion.span>
                </div>

                {/* Image */}
                <div className="relative h-72 w-full bg-gradient-to-b from-neutral-800 to-neutral-900 overflow-hidden">
                  <SafeImage
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-7">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div>
                      <h3 className="text-2xl font-black uppercase text-white tracking-tight">{product.name}</h3>
                      <p className="text-white/50 text-xs uppercase tracking-[0.2em] mt-1">{product.desc}</p>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <motion.div 
                    layout
                    className="py-3 border-t border-white/10">
                    <span className="text-brand font-black text-2xl">{product.price}</span>
                  </motion.div>
                </div>

                {/* Expansion */}
                <AnimatePresence>
                  {selectedId === product.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden border-t border-brand/50 bg-gradient-to-b from-neutral-900 to-black">
                      <div className="p-7 space-y-4">
                        {/* Specs */}
                        <div>
                          <p className="text-white/40 text-xs uppercase tracking-[0.15em] mb-2">Specifications</p>
                          <div className="flex items-center gap-2 text-white font-mono text-sm">
                            <Zap className="w-4 h-4 text-brand" />
                            {product.specs}
                          </div>
                        </div>

                        {/* Button */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}>
                          <Link
                            href={product.href ? `${product.href}/configuration` : '#'}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full py-3 bg-gradient-to-r from-brand to-brand/80 hover:from-brand/90 hover:to-brand/70 text-white font-black uppercase tracking-widest text-sm rounded-lg flex items-center justify-center gap-2 transition-all duration-300 group/btn hover:shadow-[0_0_20px_rgba(192,57,43,0.5)]">
                            <Settings className="w-4 h-4" />
                            Configure
                          </Link>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}