'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Ticket } from 'lucide-react'

const shows = [
  {
    id: 1,
    title: 'Dubai Air Festival',
    date: 'March 15-17, 2025',
    location: 'Dubai, UAE',
    description: 'Wing Concept presents breathtaking aerial formations and acrobatic demonstrations over the Arabian Gulf. Experience the future of personal aviation.',
    image: '/images/nomadic1.png',
    highlights: ['Formation flying', 'Acrobatic routines', 'Night light show', 'Product showcase']
  },
  {
    id: 2,
    title: 'European Paramotor Championship',
    date: 'July 8-14, 2025',
    location: 'Alps, Switzerland',
    description: 'The pinnacle of paramotor competition featuring precision flying, cross-country racing, and technical challenges. Watch elite pilots push the boundaries.',
    image: '/images/motor.png',
    highlights: ['Speed racing', 'Precision landing', 'Cross-country navigation', 'Freestyle competition']
  },
  {
    id: 3,
    title: 'Americas Paramotor Expo',
    date: 'September 22-24, 2025',
    location: 'Miami, USA',
    description: 'The largest paramotor gathering in North America. Wing Concept showcases latest innovations, conducts live demonstrations, and hosts workshops.',
    image: '/images/front1.jpg',
    highlights: ['Live demonstrations', 'Product launches', 'Pilot workshops', 'Community gathering']
  },
  {
    id: 4,
    title: 'Medellín Sky Parade',
    date: 'December 1-3, 2025',
    location: 'Medellín, Colombia',
    description: 'A celebration of paramotor culture with hundreds of paramotors creating aerial spectacles above Colombia\'s Valley of Aburrá. A true festival of flight.',
    image: '/images/vanguard_hero.png',
    highlights: ['Mass formations', 'Cultural celebrations', 'Colombian heritage flight', 'Community events']
  }
]

export default function ShowsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-borderline py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-ink hover:text-brand transition">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/nomadic1.png"
            alt="Shows"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>
            <h1 className="text-7xl md:text-8xl font-black uppercase text-white tracking-tighter mb-4 drop-shadow-2xl">
              W.C Shows
            </h1>
            <div className="h-2 w-24 bg-brand mx-auto mb-8" />
            <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-xl">
              Witness the Art of Paramotor Flight
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-lg text-ink leading-relaxed">
            Experience the thrill of elite paramotor competitions and world-class aerial demonstrations. From precision flying to acrobatic routines, our shows showcase the incredible capabilities of modern paramotor technology.
          </motion.p>
        </div>
      </section>

      {/* Shows Grid */}
      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16">
            <h2 className="text-5xl font-black uppercase text-ink mb-4">Upcoming Shows</h2>
            <div className="h-1 w-16 bg-brand mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {shows.map((show, i) => (
              <motion.div
                key={show.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden border border-borderline hover:shadow-lg hover:border-brand transition-all">
                
                {/* Image */}
                <div className="relative h-64 bg-bg2">
                  <Image
                    src={show.image}
                    alt={show.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-black text-ink mb-4 uppercase">{show.title}</h3>

                  <div className="space-y-3 mb-6 pb-6 border-b border-borderline">
                    <div className="flex items-center gap-3 text-ink2">
                      <Calendar className="w-4 h-4" />
                      <span>{show.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-ink2">
                      <MapPin className="w-4 h-4" />
                      <span>{show.location}</span>
                    </div>
                  </div>

                  <p className="text-ink mb-6 leading-relaxed">{show.description}</p>

                  <div className="mb-6">
                    <p className="font-bold text-ink mb-3 uppercase text-sm tracking-widest">Program:</p>
                    <ul className="space-y-2">
                      {show.highlights.map((highlight, j) => (
                        <li key={j} className="flex items-center gap-2 text-ink2 text-sm">
                          <div className="w-1.5 h-1.5 bg-brand rounded-full" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className="w-full bg-brand text-white py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-brand/90 transition flex items-center justify-center gap-2">
                    <Ticket className="w-4 h-4" />
                    Get Tickets
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-r from-brand to-brand/80">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-5xl font-black uppercase mb-8">Don't Miss Our Next Show</h2>
          <p className="text-xl mb-12">Subscribe to our newsletter to receive exclusive updates on upcoming shows, demonstrations, and special events.</p>
          <input
            type="email"
            placeholder="your@email.com"
            className="w-full max-w-md px-6 py-4 rounded-lg text-ink mb-4 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button className="block mx-auto bg-white text-brand px-12 py-4 font-black uppercase tracking-widest rounded-lg hover:bg-white/90 transition">
            Subscribe Now
          </button>
        </div>
      </section>
    </div>
  )
}