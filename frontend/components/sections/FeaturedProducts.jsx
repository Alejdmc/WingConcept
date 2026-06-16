'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'
import { api } from '@/lib/api'
import { ShoppingCart, Zap } from 'lucide-react'

const fallbackProducts = [
  { 
    id: 'fallback-1', 
    name: 'Disruptor', 
    image: '/images/disruptor_ejemplo.png', 
    price: '$5,000', 
    desc: 'Ultimate power & agility', 
    specs: '28kg | 95kg thrust',
    badge: 'Best Seller'
  },
  { 
    id: 'fallback-2', 
    name: 'I-Pro', 
    image: '/images/ipro_ejemplo.png', 
    price: '$5,200', 
    desc: 'Next-gen lightweight', 
    specs: '26kg | 90kg thrust',
    badge: 'Premium'
  },
  { 
    id: 'fallback-3', 
    name: 'Paramotor Trike', 
    image: '/images/paramotor_trike_ejemplo.png', 
    price: '$1,350', 
    desc: 'Stable ride & long-range', 
    specs: '40kg | 110kg thrust',
    badge: 'Value Pack'
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
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { addToCart } = useCart()

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const featured = await api.productos.destacados()
        setProducts(featured || [])
      } catch (err) {
        console.error('Error loading featured products:', err)
        setError('No se pudieron cargar los productos destacados.')
      } finally {
        setLoading(false)
      }
    }

    loadFeatured()
  }, [])

  const handleAddToCart = async (product) => {
    setSelectedId(null)
    if (!product.slug) {
      console.warn('No slug available for this product, cannot add to backend cart.')
      return
    }

    try {
      const detalle = await api.productos.obtener(product.slug)
      const variant = detalle.variantes.find((v) => v.es_principal && v.activo) || detalle.variantes.find((v) => v.activo)

      if (!variant) {
        console.warn('No variant available for product', product.slug)
        return
      }

      await addToCart({ variante_id: variant.id, ...product })
    } catch (err) {
      console.error('Error adding to cart:', err)
    }
  }

  const items = products.length > 0 ? products : fallbackProducts

  return (
    <section 
      id="featured-products" 
      className="py-32 px-6 scroll-mt-24 relative bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: 'url(/images/cloudfeatured.png)' }}>
      
      {/* Overlay mejorado con gradiente */}
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
          <h2 className="text-6xl md:text-7xl font-black uppercase text-white mb-6 tracking-tight">Featured Products</h2>
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-1 bg-gradient-to-r from-transparent via-brand to-transparent max-w-md mx-auto" />
        </div>
        
        {/* Grid con animación */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}>
          
          {items.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              layout
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

                {/* Imagen con overlay */}
                <div className="relative h-72 w-full bg-gradient-to-b from-neutral-800 to-neutral-900 overflow-hidden">
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Gradient overlay */}
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

                {/* Expansion animada */}
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
                        <motion.button 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          onClick={() => handleAddToCart(product)}
                          className="w-full py-3 bg-gradient-to-r from-brand to-brand/80 hover:from-brand/90 hover:to-brand/70 text-white font-black uppercase tracking-widest text-sm rounded-lg flex items-center justify-center gap-2 transition-all duration-300 group/btn hover:shadow-[0_0_20px_rgba(192,57,43,0.5)]">
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </motion.button>
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