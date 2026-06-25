'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header with Back Button */}
      <div className="border-b border-borderline py-6 px-6 sticky top-0 z-40 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-ink hover:text-brand transition">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </div>

      {/* Hero Section - Evoke Excitement */}
      <section className="py-32 px-6 bg-gradient-to-b from-bg2 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}>
            <div className="mb-12 flex justify-center">
              <Image
                src="/images/logo.png"
                alt="Wing Concept"
                width={200}
                height={80}
                className="drop-shadow-lg"
              />
            </div>
            <h1 className="text-7xl font-black uppercase text-ink tracking-tighter mb-4">About Us</h1>
            <div className="h-2 w-24 bg-brand mx-auto" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-black text-ink max-w-3xl mx-auto leading-tight mt-12">
            Evoke excitement and the ultimate sensation of freedom and adventure
          </motion.p>
        </div>
      </section>

      {/* Passion Section - United by Flight */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>
            <p className="text-lg text-ink leading-relaxed">
              Throughout the world, paramotoring unites people deeply, passionately and authentically. 
              From country to country, the ideals of freedom and self-expression that paramotoring 
              embodies transcend cultures, gender and age. Being recognised as a leading brand is 
              gratifying, but igniting the fire within people that fly the many skies above us is what 
              drives WINGCONCEPT to continually push the boundaries – all in an effort to find the 
              next great adventure.
            </p>
          </motion.div>
        </div>
      </section>

      {/* From Shed to Success Section */}
      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}>
            <p className="text-brand font-bold uppercase tracking-widest text-sm mb-4">From Shed</p>
            <h2 className="text-5xl font-black uppercase text-ink mb-8">To Success</h2>
            <div className="h-1 w-16 bg-brand mb-8" />
            <p className="text-lg text-ink leading-relaxed">
              There really isn't a humbler place to begin than a converted shed, tucked away on a quiet, 
              leafy country lane. It was in this small workshop that our founder Andrés Arango first 
              pursued an endeavour to advance personal aviation, where every WINGCONCEPT paramotor 
              built was a point of pride.
            </p>
            <p className="text-lg text-ink leading-relaxed mt-6">
              With our roots going back to the sport's earliest days, WINGCONCEPT has now become a 
              leader in paramotor design and manufacture. Andrés has been an ongoing pioneer in the 
              sport and our company has been credited with creating some of the most influential 
              designs and innovations within the paramotoring industry.
            </p>
            <div className="mt-8 p-6 border-l-4 border-brand bg-white/50 rounded-r-lg">
              <p className="text-xl font-bold text-ink italic">
                "It is our passion and determination that defines what we do as a company."
              </p>
              <p className="text-ink2 font-semibold mt-2">Andrés Arango, Founder</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative aspect-square bg-white rounded-2xl shadow-lg overflow-hidden">
            <Image
              src="/images/vanguard_hero.png"
              alt="Wing Concept Workshop"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16">
            <p className="text-brand font-bold uppercase tracking-widest text-sm mb-4">Our Passion is reflected in</p>
            <h2 className="text-5xl font-black uppercase text-ink">Our Approach</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-ink leading-relaxed">
              To this day, though we've grown far beyond our roots, every WINGCONCEPT paramotor we 
              manufacture is a testament to Andrés' founding principles. Everything we do is designed 
              to make every moment in the air exceptional.
            </p>
            <p className="text-lg text-ink leading-relaxed mt-6">
              We have a strong ideology made up of five basic tenets that guide everything we do. 
              From inspired design and meticulous craftsmanship, to effortless performance, unrivalled 
              support and elevated experiences, every WINGCONCEPT paramotor must abide by these principles.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Values - 5 Tenets */}
      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Inspired Design',
                desc: 'Every product is born from a vision of excellence, combining aesthetics and functionality to create paramotors that are as beautiful as they are capable.'
              },
              {
                title: 'Meticulous Craftsmanship',
                desc: 'We build each paramotor with precision and care, using the finest materials and manufacturing techniques to ensure durability and reliability.'
              },
              {
                title: 'Effortless Performance',
                desc: 'Our engineering focuses on delivering smooth, powerful, and intuitive flight experiences that make every journey feel natural and exhilarating.'
              },
              {
                title: 'Unrivalled Support',
                desc: 'We stand behind every product we make, providing world-class customer service and technical support to keep you flying with confidence.'
              },
              {
                title: 'Elevated Experiences',
                desc: 'Beyond the equipment, we are committed to creating memorable adventures that connect pilots with the true spirit of flight and freedom.'
              },
            ].map((tenet, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-8 bg-white border border-borderline rounded-xl hover:shadow-lg hover:border-brand transition-all">
                <h3 className="text-xl font-black text-ink mb-3 uppercase">{tenet.title}</h3>
                <p className="text-ink2">{tenet.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Go to Market Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative aspect-square bg-bg2 rounded-2xl shadow-lg overflow-hidden order-2 lg:order-1">
            <Image
              src="/images/vanguard_hero.png"
              alt="Global Network"
              fill
              className="object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2">
            <p className="text-brand font-bold uppercase tracking-widest text-sm mb-4">How We go</p>
            <h2 className="text-5xl font-black uppercase text-ink mb-8">to market</h2>
            <div className="h-1 w-16 bg-brand mb-8" />
            <p className="text-lg text-ink leading-relaxed">
              Our paramotors are exclusively built in Colombia and distributed through a global network 
              of independent distributors and dealers, most of which exclusively carry WINGCONCEPT products 
              and provide the same world class customer service and experience you would get from our team 
              here at WINGCONCEPT HQ.
            </p>
            <p className="text-lg text-ink leading-relaxed mt-6">
              We have more than 40 independently owned accredited paramotor training schools in nearly 
              15 countries. These are the people who show up every day to deliver unrivalled experiences 
              for our amazing customers. Our dealers are ambassadors of the brand and create experiences 
              and bonds that can last a lifetime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tagline Section - Freedom */}
      <section className="py-32 px-6 bg-gradient-to-r from-brand to-brand/80">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.h2
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-7xl font-black uppercase mb-8 leading-tight">
            Flying is not just<br />an activity
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white/90">
            It's the perfect union of passion, science, and freedom.
          </motion.p>
        </div>
      </section>

      {/* Founder Section - Simplified and Integrated */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-20">
            <p className="text-brand font-bold uppercase tracking-widest text-sm mb-4">The Visionary</p>
            <h2 className="text-6xl font-black uppercase text-ink">Andrés Arango</h2>
            <p className="text-ink2 font-semibold uppercase tracking-widest text-sm mt-4">Founder & Chief Engineer</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square bg-bg2 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/vanguard_hero.png"
                alt="Andrés Arango"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6">
              <p className="text-ink leading-relaxed">
                Andrés Arango was born on August 24, 1973, in Medellín, Colombia. He is an Industrial 
                Engineer graduated from the Universidad Libre de Colombia, with postgraduate studies 
                in Production Management and Productivity from the Universidad Jorge Tadeo Lozano, 
                and a Master's Degree in Productivity Management from Spain.
              </p>
              <p className="text-ink leading-relaxed">
                His passion for aviation and engineering began at a very early age. At 9 years old, 
                he was building scale models. By 12, he was actively practicing aeromodeling. He also 
                developed an outstanding career in motocross, becoming district champion at 17 and 
                national champion at 22.
              </p>
              <p className="text-ink leading-relaxed">
                It was precisely this passion for flight that led him to discover the world of 
                paragliding and later paramotoring. After his first paramotor flight with experienced 
                pilot Carlos Maldonado, he decided to dedicate much of his life to the development 
                and perfection of these aircraft.
              </p>
              <p className="text-ink leading-relaxed">
                In 2007, he designed and built his first motorized chassis. The experience gained 
                from this project led to new developments in aluminum and steel, some of which were 
                exported to Europe and continue in operation today.
              </p>
              <p className="text-ink leading-relaxed font-bold">
                Today, his work is focused on providing increasingly safe, efficient, and reliable 
                aircraft, allowing pilots around the world to enjoy the freedom of flight with the 
                highest quality standards.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-black uppercase text-ink mb-8">Ready to Experience Freedom?</h2>
          <p className="text-xl text-ink2 mb-12">Discover our premium paramotor and trike collection.</p>
          <Link href="/paratrike" className="inline-block bg-brand text-white px-12 py-5 font-black uppercase tracking-widest rounded-lg hover:bg-brand/90 transition text-lg">
            Explore Products
          </Link>
        </div>
      </section>
    </div>
  )
}