'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Code2, Zap, Globe, BarChart3, ShoppingCart, FileText, Users, Award } from 'lucide-react'

const services = [
  {
    icon: ShoppingCart,
    title: 'E-Commerce Solutions',
    description: 'High-performance online stores with intuitive UX, secure payments, and inventory management systems that scale with your business.'
  },
  {
    icon: FileText,
    title: 'Billing Systems',
    description: 'Automated invoicing platforms with real-time reporting, multi-currency support, and compliance with local tax regulations.'
  },
  {
    icon: BarChart3,
    title: 'Inventory Management',
    description: 'Intelligent stock tracking systems with predictive analytics, automated reordering, and multi-location support.'
  },
  {
    icon: Globe,
    title: 'Web Applications',
    description: 'Custom web apps built with modern technologies. Fast, secure, and designed for user engagement and conversion.'
  },
  {
    icon: Code2,
    title: 'Mobile Apps',
    description: 'Native and cross-platform mobile solutions that bring your vision to life on iOS and Android devices.'
  },
  {
    icon: Zap,
    title: 'Performance Optimization',
    description: 'Speed and efficiency optimization services. We ensure your applications perform at peak capacity, every time.'
  }
]

const stats = [
  { number: '50+', label: 'Projects Delivered' },
  { number: '30+', label: 'Happy Clients' },
  { number: '5+', label: 'Years Experience' },
  { number: '24/7', label: 'Support Available' }
]

const team = [
  {
    name: 'Creative Direction',
    role: 'UI/UX & Design',
    specialty: 'Creating beautiful, intuitive interfaces that users love'
  },
  {
    name: 'Full-Stack Development',
    role: 'Frontend & Backend',
    specialty: 'Building scalable systems from database to user interface'
  },
  {
    name: 'DevOps & Infrastructure',
    role: 'Deployment & Optimization',
    specialty: 'Ensuring reliability, security, and performance at scale'
  },
  {
    name: 'Project Management',
    role: 'Agile & Communication',
    specialty: 'Delivering on time, within budget, with excellence'
  }
]

export default function ZomiDevAboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-borderline py-6 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 pl-2 pr-4 py-2 rounded-full border border-borderline bg-white text-ink text-sm font-bold uppercase tracking-wide hover:border-brand hover:text-brand hover:bg-brand-soft transition-all">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-bg2 group-hover:bg-brand transition-colors">
              <ArrowLeft className="w-4 h-4 text-ink2 group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
            </span>
            Back
          </Link>
          <p className="text-sm text-ink2 font-semibold">Designed & Developed by ZomiDev</p>
        </div>
      </div>

      {/* Hero */}
      <section className="relative py-32 px-6 bg-gradient-to-br from-bg2 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Logo & Title */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8">
              <div className="flex items-center gap-4">
                <Image
                  src="/images/ZomiDev.png"
                  alt="ZomiDev Logo"
                  width={300}
                  height={300}
                  className="drop-shadow-lg"
                />
                <h1 className="text-5xl font-black uppercase text-ink tracking-tight">ZomiDev</h1>
              </div>

              <div className="space-y-4">
                <p className="text-xl text-ink2 leading-relaxed">
                  We are a forward-thinking startup specializing in creating powerful web and mobile applications that drive real business results.
                </p>
                <p className="text-lg text-ink leading-relaxed">
                  From concept to deployment, we craft digital solutions that combine cutting-edge technology with exceptional design, solving complex business challenges with elegant code.
                </p>
              </div>

              <div className="pt-4">
                <p className="text-sm uppercase tracking-widest text-brand font-bold mb-4">Our Expertise</p>
                <div className="flex flex-wrap gap-3">
                  {['React', 'Next.js', 'Node.js', 'Python', 'Mobile', 'Cloud'].map((tech, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-brand-soft text-brand rounded-full font-semibold text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right: Stats */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white border-2 border-brand rounded-xl p-8 text-center hover:shadow-lg transition-all">
                  <p className="text-4xl font-black text-brand mb-2">{stat.number}</p>
                  <p className="text-sm uppercase tracking-widest text-ink2 font-bold">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16">
            <p className="text-brand font-bold uppercase tracking-widest text-sm mb-4">What We Do</p>
            <h2 className="text-5xl font-black uppercase text-ink mb-4">Our Expertise</h2>
            <div className="h-1 w-16 bg-brand mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => {
              const Icon = service.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl p-8 border border-borderline hover:shadow-lg hover:border-brand transition-all">
                  <Icon className="w-12 h-12 text-brand mb-6" />
                  <h3 className="text-2xl font-black text-ink mb-4 uppercase">{service.title}</h3>
                  <p className="text-ink2 leading-relaxed">{service.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16">
            <p className="text-brand font-bold uppercase tracking-widest text-sm mb-4">Why Partners Trust Us</p>
            <h2 className="text-5xl font-black uppercase text-ink mb-4">Our Approach</h2>
            <div className="h-1 w-16 bg-brand mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="space-y-8">
              
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <Award className="w-8 h-8 text-brand mt-1" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-ink mb-2 uppercase">Quality First</h3>
                  <p className="text-ink2 leading-relaxed">
                    Every line of code is written with precision. We follow industry best practices and conduct rigorous testing to ensure reliability.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <Users className="w-8 h-8 text-brand mt-1" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-ink mb-2 uppercase">Client-Focused</h3>
                  <p className="text-ink2 leading-relaxed">
                    Your success is our success. We work closely with you throughout the project to understand your goals and exceed expectations.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <Zap className="w-8 h-8 text-brand mt-1" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-ink mb-2 uppercase">Agile & Fast</h3>
                  <p className="text-ink2 leading-relaxed">
                    We deliver quickly without compromising quality. Adaptive processes mean we respond to changes efficiently.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-brand to-brand/80 rounded-2xl p-12 text-white">
              <h3 className="text-3xl font-black uppercase mb-8">Our Process</h3>
              <ol className="space-y-6">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-white text-brand rounded-full font-black">1</span>
                  <div>
                    <p className="font-bold uppercase tracking-wider mb-1">Discovery</p>
                    <p className="text-white/90">Understanding your needs and defining project scope</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-white text-brand rounded-full font-black">2</span>
                  <div>
                    <p className="font-bold uppercase tracking-wider mb-1">Design</p>
                    <p className="text-white/90">Creating beautiful, functional interfaces and architecture</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-white text-brand rounded-full font-black">3</span>
                  <div>
                    <p className="font-bold uppercase tracking-wider mb-1">Development</p>
                    <p className="text-white/90">Building robust, scalable solutions with clean code</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-white text-brand rounded-full font-black">4</span>
                  <div>
                    <p className="font-bold uppercase tracking-wider mb-1">Launch & Support</p>
                    <p className="text-white/90">Deployment, monitoring, and ongoing maintenance</p>
                  </div>
                </li>
              </ol>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16">
            <p className="text-brand font-bold uppercase tracking-widest text-sm mb-4">Our Team</p>
            <h2 className="text-5xl font-black uppercase text-ink mb-4">Talented & Passionate</h2>
            <div className="h-1 w-16 bg-brand mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl p-8 border border-borderline text-center hover:shadow-lg hover:border-brand transition-all">
                <div className="w-20 h-20 bg-brand-soft rounded-full flex items-center justify-center mx-auto mb-6">
                  <Code2 className="w-10 h-10 text-brand" />
                </div>
                <h3 className="text-lg font-black text-ink mb-2 uppercase">{member.name}</h3>
                <p className="text-sm text-brand font-bold uppercase tracking-widest mb-3">{member.role}</p>
                <p className="text-sm text-ink2">{member.specialty}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16">
            <p className="text-brand font-bold uppercase tracking-widest text-sm mb-4">Technology</p>
            <h2 className="text-5xl font-black uppercase text-ink mb-4">Modern Stack</h2>
            <div className="h-1 w-16 bg-brand mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-bg2 rounded-xl p-8 border border-borderline">
              <h3 className="font-black text-ink uppercase mb-6">Frontend</h3>
              <ul className="space-y-2 text-ink2">
                <li>• React & Next.js</li>
                <li>• TailwindCSS</li>
                <li>• Framer Motion</li>
                <li>• TypeScript</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-bg2 rounded-xl p-8 border border-borderline">
              <h3 className="font-black text-ink uppercase mb-6">Backend</h3>
              <ul className="space-y-2 text-ink2">
                <li>• Node.js & Express</li>
                <li>• Python & FastAPI</li>
                <li>• PostgreSQL</li>
                <li>• MongoDB</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-bg2 rounded-xl p-8 border border-borderline">
              <h3 className="font-black text-ink uppercase mb-6">Infrastructure</h3>
              <ul className="space-y-2 text-ink2">
                <li>• AWS & Google Cloud</li>
                <li>• Docker & Kubernetes</li>
                <li>• CI/CD Pipelines</li>
                <li>• Git & GitHub</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-r from-brand to-brand/80">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}>
            <h2 className="text-5xl font-black uppercase mb-8">Ready to Build Something Amazing?</h2>
            <p className="text-xl mb-12 text-white/90">
              Let's turn your vision into reality. Contact us today to discuss your project.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="mailto:zomidev@zomidev.com"
                className="inline-block bg-white text-brand px-12 py-5 font-black uppercase tracking-widest rounded-lg hover:bg-white/90 transition">
                Get In Touch
              </a>
              <a
                href="tel:+573238125686"
                className="inline-block border-2 border-white text-white px-12 py-5 font-black uppercase tracking-widest rounded-lg hover:bg-white/10 transition">
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-12 px-6 bg-white border-t border-borderline text-center">
        <p className="text-sm text-ink2">
          ZomiDev © 2026 — Creating digital solutions that drive business growth
        </p>
      </section>
    </div>
  )
}