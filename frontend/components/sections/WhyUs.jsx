'use client'
import { motion } from 'framer-motion'
import { Zap, Shield, Users, Truck } from 'lucide-react'

const features = [
  { icon: Zap, label: 'High Performance', desc: 'Motors engineered for speed and reliability' },
  { icon: Shield, label: 'Safety First', desc: 'Certified equipment with rigorous testing' },
  { icon: Users, label: 'Expert Support', desc: '24/7 customer service and technical help' },
  { icon: Truck, label: 'Fast Shipping', desc: 'Worldwide delivery in 5-7 business days' },
]

const testimonials = [
  { name: 'Marco Rossi', location: 'USA', text: 'Best paramotor I\'ve ever owned. The build quality is outstanding!', rating: 5 },
  { name: 'Sarah Johnson', location: 'USA', text: 'Incredible customer service and fast delivery. Highly recommended!', rating: 5 },
  { name: 'Lucas Silva', location: 'COL', text: 'Performance exceeds expectations. Worth every penny!', rating: 5 },
]

export default function WhyUs() {
  return (
    <>
      {/* Why Us Section */}
      <section className="py-24 bg-bg px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16">
            <h2 className="text-5xl font-black uppercase text-ink mb-4 tracking-tighter">Why Choose Wing Concept</h2>
            <p className="text-ink2 text-lg max-w-2xl mx-auto">We combine cutting-edge technology with exceptional service to deliver the ultimate paramotor experience</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-white border border-borderline rounded-lg p-8 text-center hover:shadow-lg hover:border-brand transition-all">
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

      {/* Testimonials Section */}
      <section className="py-24 bg-bg2 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16">
            <h2 className="text-5xl font-black uppercase text-ink mb-4 tracking-tighter">Customer Reviews</h2>
            <p className="text-ink2 text-lg">Join thousands of satisfied pilots worldwide</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map(({ name, location, text, rating }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white border border-borderline rounded-lg p-8 hover:shadow-lg transition-all">
                
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(rating)].map((_, j) => (
                    <span key={j} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-ink italic mb-6 leading-relaxed">"{text}"</p>

                {/* Author */}
                <div className="border-t border-borderline pt-4">
                  <p className="font-black text-ink">{name}</p>
                  <p className="text-ink2 text-sm">{location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}