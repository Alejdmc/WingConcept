'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Award, Users, Cpu, BadgeCheck, ClipboardCheck, Radio, HeartHandshake } from 'lucide-react'

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Safety',
    desc: 'Safety is the foundation of every flight. Each trike goes through an engine, wing/lines, harness and emergency parachute inspection before being handed to a pilot.',
  },
  {
    icon: BadgeCheck,
    title: 'Reliability',
    desc: 'We work with engines and structures from industry-recognized manufacturers, with documented preventive maintenance on every unit.',
  },
  {
    icon: Award,
    title: 'Certified Pilots',
    desc: 'Our instructors follow certification programs recognized in the paramotor industry (progressive levels such as PPG1 to PPG3: ground handling, safe takeoff/landing, independent flight, and advanced conditions).',
  },
  {
    icon: Cpu,
    title: 'Latest-Generation Equipment',
    desc: 'Chassis, engines and instrumentation constantly updated for better performance, less weight and greater flight control.',
  },
  {
    icon: ShieldCheck,
    title: 'Certified Trikes',
    desc: 'Every paratrike we operate meets structural and safety specifications verified before flight.',
  },
  {
    icon: Cpu,
    title: 'Technology Used',
    desc: 'Flight instrumentation, active suspension systems and high-strength carbon fiber / steel components for maximum precision and durability.',
  },
  {
    icon: HeartHandshake,
    title: 'Commitment to Our Clients',
    desc: 'Support before, during and after the flight. Your safety and confidence are the priority in every Wing Concept experience.',
  },
]

const PREFLIGHT_CHECKLIST = [
  { icon: Radio, title: 'Engine & Fuel', desc: 'Verification of fuel level, throttle cable and overall engine operation.' },
  { icon: ClipboardCheck, title: 'Wing & Lines', desc: 'Inspection of the wing fabric and lines/risers for knots, wear or damage.' },
  { icon: Users, title: 'Harness & Safety Gear', desc: 'Inspection of harness straps, helmet and communication equipment.' },
  { icon: ShieldCheck, title: 'Emergency Parachute', desc: 'Confirmation that the reserve parachute is properly packed and up to date.' },
]

export default function CursoInductivoPage() {
  return (
    <div className="min-h-screen bg-white">
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

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/images/bootcamp.jpg" alt="Induction Course" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/55" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase text-white tracking-tighter mb-4 drop-shadow-2xl">
              Induction Course
            </h1>
            <div className="h-2 w-24 bg-brand mx-auto mb-8" />
            <p className="text-xl md:text-2xl font-bold text-white drop-shadow-xl">
              Safety, reliability and professionalism before every flight
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PILLARS.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                  className="bg-bg2 border border-borderline rounded-xl p-8 hover:border-brand transition-all">
                  <Icon className="w-10 h-10 text-brand mb-4" />
                  <h3 className="font-black uppercase text-ink text-lg mb-3 tracking-wide">{p.title}</h3>
                  <p className="text-ink2 text-sm leading-relaxed">{p.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pre-flight checklist */}
      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink mb-4">Pre-Flight Procedures</h2>
            <div className="h-1 w-16 bg-brand mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PREFLIGHT_CHECKLIST.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="bg-white border border-borderline rounded-xl p-6 flex gap-4 hover:border-brand transition">
                  <Icon className="w-6 h-6 text-brand shrink-0 mt-1" />
                  <div>
                    <h3 className="font-black uppercase text-ink mb-1">{item.title}</h3>
                    <p className="text-ink2 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-r from-brand to-brand/80">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-5xl font-black uppercase mb-8">Ready to fly with confidence?</h2>
          <p className="text-xl mb-12">Learn more about our induction program and book your first flight.</p>
          <Link href="/contact" className="inline-block bg-white text-brand px-12 py-5 font-black uppercase tracking-widest rounded-lg hover:bg-white/90 transition">
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  )
}
