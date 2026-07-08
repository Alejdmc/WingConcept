'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Users, Clock } from 'lucide-react'

const events = [
  {
    id: 1,
    title: 'Beginner Pilot Bootcamp',
    date: 'February 10-14, 2025',
    time: '8:00 AM - 5:00 PM',
    location: 'Bogotá, Colombia',
    capacity: '20 participants',
    description: 'Comprehensive training program for aspiring paramotor pilots. Covers theory, safety, flight fundamentals, and hands-on flying experience.',
    image: '/images/bootcamp.jpg',
    price: '$1,200',
    includes: ['Ground school', 'Flight simulator', 'Real flight training', 'Safety equipment', 'Certification']
  },
  {
    id: 2,
    title: 'Advanced Acrobatics Workshop',
    date: 'March 3-5, 2025',
    time: '9:00 AM - 4:00 PM',
    location: 'Medellín, Colombia',
    capacity: '12 participants',
    description: 'Master advanced acrobatic maneuvers with world-class instructors. Perfect for experienced pilots looking to expand their skills.',
    image: '/images/acrobatic.jpg',
    price: '$800',
    includes: ['Expert coaching', 'Video analysis', 'Flight log review', 'Safety briefings', 'Group flights']
  },
  {
    id: 3,
    title: 'Technical Maintenance Course',
    date: 'May 5-9, 2025',
    time: '8:30 AM - 5:00 PM',
    location: 'Bogotá, Colombia',
    capacity: '15 participants',
    description: 'Learn to maintain, troubleshoot, and service your paramotor. Essential knowledge for every pilot who wants engine reliability.',
    image: '/images/motor.png',
    price: '$600',
    includes: ['Engine servicing', 'Parts replacement', 'Troubleshooting guide', 'Tools provided', 'Certification']
  },
  {
    id: 4,
    title: 'Cross-Country Navigation Clinic',
    date: 'June 2-4, 2025',
    time: '7:00 AM - 5:00 PM',
    location: 'Santa Marta, Colombia',
    capacity: '18 participants',
    description: 'Master long-distance flying and navigation techniques. Learn thermal centering, wind management, and route planning.',
    image: '/images/santamarta.jpg',
    price: '$750',
    includes: ['Navigation theory', 'Thermal training', 'Flight planning', 'GPS systems', 'Practical cross-country']
  }
]

export default function EventsPage() {
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
            src="/images/motor.png"
            alt="Events"
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
              W.C Events
            </h1>
            <div className="h-2 w-24 bg-brand mx-auto mb-8" />
            <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-xl">
              Learn, Connect, and Grow with Our Community
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
            Join our exclusive training courses, workshops, and community events. Whether you're just starting your paramotor journey or you're an experienced pilot looking to advance your skills, we have the perfect event for you.
          </motion.p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16">
            <h2 className="text-5xl font-black uppercase text-ink mb-4">Upcoming Events</h2>
            <div className="h-1 w-16 bg-brand mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl overflow-hidden border border-borderline hover:shadow-lg hover:border-brand transition-all">
                
                {/* Image */}
                <div className="relative h-64 bg-bg2">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-brand text-white px-4 py-2 rounded-full font-black text-lg">
                    {event.price}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-black text-ink mb-4 uppercase">{event.title}</h3>

                  <div className="space-y-3 mb-6 pb-6 border-b border-borderline">
                    <div className="flex items-center gap-3 text-ink2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-ink2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-ink2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-ink2">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{event.capacity}</span>
                    </div>
                  </div>

                  <p className="text-ink mb-6 leading-relaxed">{event.description}</p>

                  <div className="mb-6">
                    <p className="font-bold text-ink mb-3 uppercase text-sm tracking-widest">Includes:</p>
                    <ul className="space-y-2">
                      {event.includes.map((item, j) => (
                        <li key={j} className="flex items-center gap-2 text-ink2 text-sm">
                          <div className="w-1.5 h-1.5 bg-brand rounded-full" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className="w-full bg-brand text-white py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-brand/90 transition">
                    Register Now
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
          <h2 className="text-5xl font-black uppercase mb-8">Can't Find Your Event?</h2>
          <p className="text-xl mb-12">Contact us to arrange a custom training session or private event for your group.</p>
          <Link href="/contact" className="inline-block bg-white text-brand px-12 py-5 font-black uppercase tracking-widest rounded-lg hover:bg-white/90 transition">
            Request Custom Event
          </Link>
        </div>
      </section>
    </div>
  )
}