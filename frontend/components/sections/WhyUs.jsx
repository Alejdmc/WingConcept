'use client'
import { motion } from 'framer-motion'
import { Zap, Shield, Users, Truck } from 'lucide-react'

const features = [
  { icon: Zap, label: 'High Performance', desc: 'Motors engineered for speed and reliability' },
  { icon: Shield, label: 'Safety First', desc: 'Certified equipment with rigorous testing' },
  { icon: Users, label: 'Expert Support', desc: '24/7 customer service and technical help' },
  { icon: Truck, label: 'Fast Shipping', desc: 'Worldwide delivery in 5-7 business days' },
]

export default function WhyUs() {
  return (
    <section className="py-16 sm:py-24 bg-bg px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink mb-4 tracking-tighter">Why Choose Wing Concept</h2>
          <p className="text-ink2 text-base sm:text-lg max-w-2xl mx-auto">We combine cutting-edge technology with exceptional service to deliver the ultimate paramotor experience</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-white border border-borderline rounded-lg p-6 sm:p-8 text-center hover:shadow-lg hover:border-brand transition-all">
              <div className="w-16 h-16 bg-brand-soft rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8 text-brand" />
              </div>
              <h3 className="font-black text-ink mb-2 uppercase tracking-wide">{label}</h3>
              <p className="text-ink2 text-sm">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}