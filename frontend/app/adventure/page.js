'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Users } from 'lucide-react'

const adventures = [
  {
    id: 1,
    title: 'Colombian Amazon Expedition',
    location: 'Leticia, Colombia',
    duration: '10 days',
    difficulty: 'Advanced',
    participants: 8,
    description: 'Fly over the world\'s largest rainforest and experience biodiversity like never before. Land on remote strips and connect with indigenous communities.',
    image: '/images/leticia.jpg',
    highlights: [
      'Remote jungle airstrips',
      'Wildlife photography from the sky',
      'Cultural immersion with local pilots',
      'Advanced navigation techniques'
    ]
  },
  {
    id: 2,
    title: 'Alps High-Altitude Challenge',
    location: 'Switzerland & France',
    duration: '7 days',
    difficulty: 'Expert',
    participants: 6,
    description: 'Challenge yourself with high-altitude flying across the European Alps. Experience world-class thermal conditions and breathtaking mountain scenery.',
    image: '/images/suiza.jpg',
    highlights: [
      'Altitude flying (up to 4000m)',
      'Thermal ridge soaring',
      'Cross-border navigation',
      'High-altitude safety protocols'
    ]
  },
  {
    id: 3,
    title: 'Desert Nomad Safari',
    location: 'Namibia, Africa',
    duration: '12 days',
    difficulty: 'Intermediate',
    participants: 10,
    description: 'Explore vast deserts and witness the raw beauty of Africa from above. Land at remote spots and experience true adventure flying.',
    image: '/images/african.jpg',
    highlights: [
      'Vast desert landscapes',
      'Wildlife observation flights',
      'Off-grid camping experience',
      'Emergency landing procedures'
    ]
  },
  {
    id: 4,
    title: 'Tropical Paradise Tour',
    location: 'Costa Rica',
    duration: '5 days',
    difficulty: 'Beginner',
    participants: 12,
    description: 'Perfect for new pilots. Fly over rainforests, beaches, and volcanoes in a paradise setting with ideal flying conditions year-round.',
    image: '/images/costarica.jpg',
    highlights: [
      'Scenic coastal flights',
      'Volcano observation',
      'Beach landing practice',
      'Tropical weather mastery'
    ]
  }
]

export default function AdventurePage() {
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
            src="/images/front1.jpg"
            alt="Adventure"
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
              W.C Adventure
            </h1>
            <div className="h-2 w-24 bg-brand mx-auto mb-8" />
            <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-xl">
              Extraordinary Flying Experiences Around the World
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
            Join us on unforgettable paramotor expeditions to the world's most stunning destinations. From tropical rainforests to alpine peaks, every adventure is meticulously planned for safety, education, and pure flying joy.
          </motion.p>
        </div>
      </section>

      {/* Adventures Grid */}
      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16">
            <h2 className="text-5xl font-black uppercase text-ink mb-4">Featured Expeditions</h2>
            <div className="h-1 w-16 bg-brand mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {adventures.map((adventure, i) => (
              <motion.div
                key={adventure.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden border border-borderline hover:shadow-lg hover:border-brand transition-all">
                
                {/* Image */}
                <div className="relative h-64 bg-bg2">
                  <Image
                    src={adventure.image}
                    alt={adventure.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-brand text-white px-4 py-2 rounded-full font-bold text-sm uppercase">
                    {adventure.difficulty}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-black text-ink mb-4 uppercase">{adventure.title}</h3>

                  <div className="space-y-3 mb-6 pb-6 border-b border-borderline">
                    <div className="flex items-center gap-3 text-ink2">
                      <MapPin className="w-4 h-4" />
                      <span>{adventure.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-ink2">
                      <Calendar className="w-4 h-4" />
                      <span>{adventure.duration}</span>
                    </div>
                    <div className="flex items-center gap-3 text-ink2">
                      <Users className="w-4 h-4" />
                      <span>{adventure.participants} participants</span>
                    </div>
                  </div>

                  <p className="text-ink mb-6 leading-relaxed">{adventure.description}</p>

                  <div className="mb-6">
                    <p className="font-bold text-ink mb-3 uppercase text-sm tracking-widest">Highlights:</p>
                    <ul className="space-y-2">
                      {adventure.highlights.map((highlight, j) => (
                        <li key={j} className="flex items-center gap-2 text-ink2 text-sm">
                          <div className="w-1.5 h-1.5 bg-brand rounded-full" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className="w-full bg-brand text-white py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-brand/90 transition">
                    Learn More
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
          <h2 className="text-5xl font-black uppercase mb-8">Ready for Your Next Adventure?</h2>
          <p className="text-xl mb-12">Contact us to book your expedition and start planning your ultimate paramotor journey.</p>
          <Link href="/contact" className="inline-block bg-white text-brand px-12 py-5 font-black uppercase tracking-widest rounded-lg hover:bg-white/90 transition">
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  )
}