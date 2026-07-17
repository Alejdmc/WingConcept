'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Wind } from 'lucide-react'

export default function ParamotorsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-borderline py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 pl-2 pr-4 py-2 rounded-full border border-borderline bg-white text-ink text-sm font-bold uppercase tracking-wide hover:border-brand hover:text-brand hover:bg-brand-soft transition-all">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-bg2 group-hover:bg-brand transition-colors">
              <ArrowLeft className="w-4 h-4 text-ink2 group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
            </span>
            Back
          </Link>
        </div>
      </div>

      {/* Coming Soon Section */}
      <section className="min-h-[80vh] flex items-center justify-center px-6 bg-gradient-to-b from-bg2 to-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl text-center">
          <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-brand-soft flex items-center justify-center">
            <Wind className="w-8 h-8 text-brand" />
          </div>

          <p className="text-brand font-bold uppercase tracking-[0.3em] text-sm mb-4">Coming Soon</p>
          <h1 className="text-3xl sm:text-5xl font-black uppercase text-ink mb-6 leading-tight">Paramotors</h1>
          <p className="text-lg text-ink2 leading-relaxed mb-10">
            We're still working on our paramotor lineup. In the meantime, check out our paratrikes —
            built with the same passion, science, and freedom.
          </p>

          <Link
            href="/paratrike"
            className="inline-flex items-center gap-3 bg-brand text-white px-8 py-4 rounded-lg font-black uppercase tracking-widest hover:bg-brand/90 transition">
            Explore Paratrikes
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
