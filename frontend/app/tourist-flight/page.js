'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Clock, MapPin, Navigation } from 'lucide-react'
import {
  TOURISTIC_FLIGHT_RATES,
  TOURISTIC_FLIGHT_SCHEDULE,
  CLUB_AEROSPORT_LOCATION,
  formatUSD,
} from '@/lib/touristFlight'
import { INDUCTION_PILLARS, INDUCTION_PREFLIGHT_CHECKLIST } from '@/lib/inductionCourse'

export default function TouristFlightPage() {
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
          <Image src="/images/colombia.jpg" alt="Tourist Flight" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase text-white tracking-tighter mb-4 drop-shadow-2xl">
              Tourist Flight
            </h1>
            <div className="h-2 w-24 bg-brand mx-auto mb-8" />
            <p className="text-xl md:text-2xl font-bold text-white drop-shadow-xl">
              Experience the freedom of flight with a certified pilot
            </p>
          </motion.div>
        </div>
      </section>

      {/* Schedule & Rates */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink mb-4">Schedule & Rates</h2>
            <div className="h-1 w-16 bg-brand mx-auto" />
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-10 text-ink2">
            <Clock className="w-5 h-5 text-brand shrink-0" />
            {TOURISTIC_FLIGHT_SCHEDULE.map((slot, i) => (
              <span key={slot.label} className="flex items-center gap-3">
                <span className="font-bold">{slot.label}</span>
                {i < TOURISTIC_FLIGHT_SCHEDULE.length - 1 && <span className="text-borderline">|</span>}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {TOURISTIC_FLIGHT_RATES.map((rate) => (
              <div key={rate.duration} className="bg-bg2 border border-borderline rounded-xl p-6 text-center hover:border-brand transition">
                <p className="font-black uppercase text-ink text-lg mb-2">{rate.duration}</p>
                <p className="text-2xl font-black text-brand">{formatUSD(rate.cop)}</p>
                <p className="text-ink2 text-sm mt-1">${rate.cop.toLocaleString('es-CO')} COP</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink mb-4">Location</h2>
            <div className="h-1 w-16 bg-brand mx-auto" />
          </motion.div>

          <div className="bg-white border border-borderline rounded-2xl overflow-hidden">
            <div className="relative w-full h-[380px]">
              <iframe
                src={CLUB_AEROSPORT_LOCATION.embedUrl}
                title="Club AeroSport location"
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <div>
                  <p className="font-black uppercase text-ink">{CLUB_AEROSPORT_LOCATION.name}</p>
                  <p className="text-ink2 text-sm">{CLUB_AEROSPORT_LOCATION.address}</p>
                </div>
              </div>
              <a
                href={CLUB_AEROSPORT_LOCATION.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand text-white font-bold uppercase tracking-wide text-sm hover:bg-brand/90 transition-all shrink-0">
                <Navigation className="w-4 h-4" />
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Induction Course */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink mb-4">Induction Course</h2>
            <div className="h-1 w-16 bg-brand mx-auto mb-6" />
            <p className="text-lg text-ink2 max-w-2xl mx-auto">
              Before every tourist flight, every pilot and trike goes through our safety induction process.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {INDUCTION_PILLARS.map((p, i) => {
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

          <div className="max-w-5xl mx-auto">
            <h3 className="text-2xl font-black uppercase text-ink text-center mb-10">Pre-Flight Procedures</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {INDUCTION_PREFLIGHT_CHECKLIST.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="bg-bg2 border border-borderline rounded-xl p-6 flex gap-4 hover:border-brand transition">
                    <Icon className="w-6 h-6 text-brand shrink-0 mt-1" />
                    <div>
                      <h4 className="font-black uppercase text-ink mb-1">{item.title}</h4>
                      <p className="text-ink2 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-r from-brand to-brand/80">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-5xl font-black uppercase mb-8">Ready to take off?</h2>
          <p className="text-xl mb-12">Contact us to book your tourist flight and pick your preferred time slot.</p>
          <Link href="/contact" className="inline-block bg-white text-brand px-12 py-5 font-black uppercase tracking-widest rounded-lg hover:bg-white/90 transition">
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  )
}
