'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'

export default function Hero() {
  const images = ['/images/paramotor_image.jpg', '/images/paramotor_image2.jpg', '/images/image1.jpg']
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      
      {/* Slider con efecto de deslizamiento a la izquierda */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.img
          key={images[index]}
          src={images[index]}
          initial={index === 0 ? { x: '0%' } : { x: '100%' }}
          animate={{ x: '0%' }}
          exit={{ x: '-100%' }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute w-full h-full object-cover"
        />
        </AnimatePresence>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Contenido */}
      <div className="relative z-20 text-center px-5 max-w-4xl mx-auto">
        <p className="flex items-center justify-center gap-3 text-[11px] font-bold tracking-[0.3em] uppercase text-white/80 mb-6">
          <span className="w-8 h-px bg-brand" /> WING CONCEPT PARAMOTORS <span className="w-8 h-px bg-brand" />
        </p>

        <h1 className="font-sans font-black uppercase leading-[0.95] text-[clamp(50px,8vw,100px)] tracking-[-0.03em] text-white [text-shadow:0_4px_20px_rgba(0,0,0,0.6)] mb-8">
          WHERE<br />
          <span className="text-brand">FREEDOM TAKES</span><br />
          WINGS
        </h1>

        

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/paramotors" className="inline-flex items-center gap-2 bg-brand text-white border-2 border-brand px-8 py-4 rounded-none font-bold text-[12px] tracking-[0.2em] uppercase hover:bg-transparent hover:border-white transition-all">
            <ArrowRight className="w-3.5 h-3.5" /> Explore Paramotors
          </Link>
          <Link href="/about" className="inline-flex items-center gap-2 bg-transparent text-white border-2 border-white/40 px-8 py-4 rounded-none font-bold text-[12px] tracking-[0.2em] uppercase hover:border-white hover:bg-white/10 transition-all">
            Our Story
          </Link>
        </div>
      </div>
    </section>
  )
}