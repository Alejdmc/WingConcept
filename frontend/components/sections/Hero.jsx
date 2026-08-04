'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useSiteBlocks } from '@/hooks/useCms'

const DEFAULT_IMAGES = ['/images/paramotor_image.jpg', '/images/paramotor_image2.jpg', '/images/image1.jpg']

const titleLine = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const titleWord = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
}

function HeroSlide({ src, alt, isFirst }) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setCurrentSrc(src)
    setFailed(false)
  }, [src])

  const handleError = () => {
    const fallback = DEFAULT_IMAGES.find((img) => img !== currentSrc) || DEFAULT_IMAGES[0]
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback)
      return
    }
    setFailed(true)
  }

  if (failed) {
    return <div className="absolute w-full h-full bg-neutral-900" aria-hidden />
  }

  return (
    <motion.img
      key={currentSrc}
      src={currentSrc}
      alt={alt}
      initial={isFirst ? { x: '0%' } : { x: '100%' }}
      animate={{ x: '0%' }}
      exit={{ x: '-100%' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="absolute w-full h-full object-cover"
      onError={handleError}
    />
  )
}

export default function Hero() {
  const { get } = useSiteBlocks('homepage')
  const imagesRaw = get('homepage.hero.images', DEFAULT_IMAGES.join('\n'))
  const images = imagesRaw.split('\n').map((s) => s.trim()).filter(Boolean)
  const displayImages = images.length ? images : DEFAULT_IMAGES
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % displayImages.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [displayImages.length])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <HeroSlide
            key={displayImages[index]}
            src={displayImages[index]}
            alt=""
            isFirst={index === 0}
          />
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 bg-black/60 z-10" />

      <div className="relative z-20 text-center px-5 max-w-4xl mx-auto">
        <p className="flex items-center justify-center gap-3 text-[11px] font-bold tracking-[0.3em] uppercase text-white/80 mb-6">
          <span className="w-8 h-px bg-brand" /> {get('homepage.hero.eyebrow', 'WING CONCEPT PARAMOTORS')} <span className="w-8 h-px bg-brand" />
        </p>

        <motion.h1
          variants={titleLine}
          initial="hidden"
          animate="visible"
          className="font-sans font-black uppercase leading-[0.95] text-[clamp(50px,8vw,100px)] tracking-[-0.03em] text-white [text-shadow:0_4px_20px_rgba(0,0,0,0.6)] mb-8">
          <motion.span variants={titleWord} className="block">{get('homepage.hero.line1', 'WHERE')}</motion.span>
          <motion.span variants={titleWord} className="block text-brand">{get('homepage.hero.line2', 'FREEDOM TAKES')}</motion.span>
          <motion.span variants={titleWord} className="block">{get('homepage.hero.line3', 'WINGS')}</motion.span>
        </motion.h1>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/paramotors" className="inline-flex items-center gap-2 bg-brand text-white border-2 border-brand px-8 py-4 rounded-none font-bold text-[12px] tracking-[0.2em] uppercase hover:bg-transparent hover:border-white transition-all">
            <ArrowRight className="w-3.5 h-3.5" /> {get('homepage.hero.cta_primary', 'Explore Paramotors')}
          </Link>
          <Link href="/about" className="inline-flex items-center gap-2 bg-transparent text-white border-2 border-white/40 px-8 py-4 rounded-none font-bold text-[12px] tracking-[0.2em] uppercase hover:border-white hover:bg-white/10 transition-all">
            {get('homepage.hero.cta_secondary', 'Our Story')}
          </Link>
        </div>
      </div>
    </section>
  )
}
