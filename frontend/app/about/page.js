'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      

      {/* Hero Section - Con imagen de fondo tipo Parajet */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Imagen de fondo */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/front1.jpg"
            alt="WINGCONCEPT Paramotor"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay oscuro para mejorar legibilidad */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Contenido sobre la imagen */}
        <div className="relative z-10 max-w-7xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>
            <div className="mb-8 flex justify-center">
              <Image
                src="/images/logo.png"
                alt="Wing Concept"
                width={500}
                height={200}
                className="drop-shadow-lg brightness-0 invert"
              />
            </div>
            <h1 className="text-7xl md:text-8xl font-black uppercase text-white tracking-tighter mb-4 drop-shadow-2xl">
              About Us
            </h1>
            <div className="h-2 w-24 bg-brand mx-auto" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-4xl font-black text-white max-w-3xl mx-auto leading-tight mt-8 drop-shadow-xl">
            Where passion meets the sky,<br />and freedom finds its wings
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
              Around the globe, paramotoring creates bonds that go beyond borders, languages, and cultures. 
              It's a shared language of freedom, adventure, and pure emotion that unites pilots from every 
              corner of the world. At WINGCONCEPT, we don't just build machines - we fuel dreams, ignite 
              spirits, and empower those who dare to look up and take flight.
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
            <p className="text-brand font-bold uppercase tracking-widest text-sm mb-4">From Humble Beginnings</p>
            <h2 className="text-5xl font-black uppercase text-ink mb-8">To Global Recognition</h2>
            <div className="h-1 w-16 bg-brand mb-8" />
            <p className="text-lg text-ink leading-relaxed">
              Every great story starts somewhere, and ours began in a modest workshop where Andrés Arango 
              devoted countless hours to perfecting his craft. With little more than determination and an 
              unwavering belief in his vision, he built the very first WINGCONCEPT paramotor - a machine 
              born from passion and built with precision.
            </p>
            <p className="text-lg text-ink leading-relaxed mt-6">
              Today, what started as a one-man dream has grown into a brand recognized across continents. 
              Andrés' relentless pursuit of innovation has positioned WINGCONCEPT at the forefront of 
              paramotor engineering, with designs that continue to inspire pilots and shape the future 
              of personal aviation.
            </p>
            <div className="mt-8 p-6 border-l-4 border-brand bg-white/50 rounded-r-lg">
              <p className="text-xl font-bold text-ink italic">
                "Excellence is not a goal - it's the standard we live by every single day."
              </p>
              <p className="text-ink2 font-semibold mt-2">Andrés Arango, Founder & Chief Engineer</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative aspect-square bg-white rounded-2xl shadow-lg overflow-hidden">
            <Image
              src="/images/front1.jpg"
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
              Despite our growth and global reach, every WINGCONCEPT paramotor is still built with the 
              same dedication and attention to detail that defined our very first model. Our philosophy 
              is simple: create equipment that makes every flight unforgettable.
            </p>
            <p className="text-lg text-ink leading-relaxed mt-6">
              We are guided by five core principles that shape everything we do - from the drawing board 
              to the final assembly. These are the pillars that define our identity and ensure that every 
              pilot who chooses WINGCONCEPT experiences the very best that aviation has to offer.
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
                desc: 'We believe that great engineering is also great art. Every curve, every component, and every detail is carefully crafted to be as visually stunning as it is functionally superior.'
              },
              {
                title: 'Meticulous Craftsmanship',
                desc: 'From the smallest screw to the largest frame, we build with obsessive precision. Only the finest materials and most rigorous manufacturing standards are good enough for WINGCONCEPT.'
              },
              {
                title: 'Effortless Performance',
                desc: 'Our engineering philosophy centers on delivering smooth, responsive, and intuitive flight dynamics that make piloting feel like second nature - pure, unadulterated joy.'
              },
              {
                title: 'Unrivalled Support',
                desc: "We don't just sell paramotors - we build lasting relationships. Our commitment to customer care extends far beyond the purchase, ensuring every pilot feels supported and valued."
              },
              {
                title: 'Elevated Experiences',
                desc: 'For us, flying is not just a sport - it is a way of life. We are dedicated to creating moments of pure magic in the sky, turning every flight into a cherished memory.'
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
              src="/images/motor.png"
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
              Every WINGCONCEPT paramotor is proudly manufactured in Colombia, combining local talent 
              with global standards of excellence. Through our carefully selected network of distributors 
              and authorized dealers, we bring our passion for flight to pilots around the world.
            </p>
            <p className="text-lg text-ink leading-relaxed mt-6">
              Our community includes over 40 certified training centers across 15 countries, staffed by 
              passionate instructors who share our commitment to safety and quality. These dedicated 
              professionals are the heart of the WINGCONCEPT family - they don't just sell our products; 
              they live our values and create connections that last a lifetime.
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
            Flying is more<br />than a sport
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white/90">
            It's where passion, engineering, and freedom become one.
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
                src="/images/founder-portrait.jpg"
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
                Born on August 24, 1973, in the vibrant city of Medellín, Colombia, Andrés Arango has 
                always been driven by a deep curiosity for how things work. He earned his degree in 
                Industrial Engineering from the Universidad Libre de Colombia, later completing advanced 
                studies in Production Management at the Universidad Jorge Tadeo Lozano and earning a 
                Master's in Productivity Management from Spain.
              </p>
              <p className="text-ink leading-relaxed">
                His fascination with flight and mechanics began early - at just 9 years old, he was 
                already building scale models, and by 12, he was deeply immersed in aeromodeling. His 
                competitive spirit also led him to excel in motocross, where he became district champion 
                at 17 and national champion at 22.
              </p>
              <p className="text-ink leading-relaxed">
                It was his passion for flight that eventually introduced him to the world of paragliding 
                and paramotoring. After his first paramotor flight alongside renowned pilot Carlos 
                Maldonado, Andrés knew he had found his life's calling - to design and build aircraft 
                that would push the boundaries of what's possible.
              </p>
              <p className="text-ink leading-relaxed">
                In 2007, he designed and constructed his first motorized chassis, a project that laid 
                the foundation for future innovations in aluminum and steel. Some of those early designs 
                were exported to Europe and are still flying today - a testament to their enduring quality 
                and timeless engineering.
              </p>
              <p className="text-ink leading-relaxed font-bold">
                Today, Andrés continues to pursue his mission: creating aircraft that are safer, more 
                efficient, and more reliable than anything that came before. His work allows pilots 
                around the world to experience the ultimate freedom of flight with absolute confidence 
                and peace of mind.
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