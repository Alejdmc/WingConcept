'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MapPin, Instagram, Facebook, MessageCircle } from 'lucide-react'
import { useState } from 'react'

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'andres@wingconcept.com',
    link: 'mailto:andres@wingconcept.com'
  },
  {
    icon: Phone,
    label: 'WhatsApp',
    value: '+1 (818) 749-4545',
    link: 'https://wa.me/18187494545'
  },
  
]

const socialMedia = [
  {
    name: 'Instagram',
    icon: Instagram,
    url: 'https://www.instagram.com/wing_concepts?igsh=aW0yMWU3M2c2Y3d0',
    color: 'hover:text-pink-500'
  },
  {
    name: 'Facebook',
    icon: Facebook,
    url: 'https://www.facebook.com/share/17htSFE4gR/?mibextid=wwXIfr',
    color: 'hover:text-blue-600'
  },
  {
    name: 'WhatsApp',
    icon: MessageCircle,
    url: 'https://wa.me/18187494545',
    color: 'hover:text-green-500'
  }
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' })
      setSubmitted(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-bg2 to-white">
        <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase text-ink tracking-tighter mb-4">
              Get In Touch
            </h1>
            <div className="h-2 w-24 bg-brand mx-auto mb-8" />
            <p className="text-xl text-ink2">We're here to help. Reach out with any questions or to book your next adventure.</p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            {contactInfo.map((info, i) => {
              const Icon = info.icon
              return (
                <motion.a
                  key={i}
                  href={info.link}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-bg2 rounded-xl p-8 text-center hover:shadow-lg hover:border-brand border border-borderline transition-all cursor-pointer">
                  <Icon className="w-12 h-12 text-brand mx-auto mb-4" />
                  <p className="text-sm uppercase tracking-widest text-ink2 font-bold mb-2">{info.label}</p>
                  <p className="text-lg font-black text-ink">{info.value}</p>
                </motion.a>
              )
            })}
          </div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-24">
            <h2 className="text-3xl font-black uppercase text-ink mb-8">Follow Us</h2>
            <div className="flex items-center justify-center gap-8">
              {socialMedia.map((social, i) => {
                const Icon = social.icon
                return (
                  <motion.a
                    key={i}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.2 }}
                    className={`w-16 h-16 bg-bg2 rounded-full flex items-center justify-center text-ink2 transition-all ${social.color} hover:bg-white hover:shadow-lg border border-borderline`}>
                    <Icon className="w-7 h-7" />
                  </motion.a>
                )
              })}
            </div>
          </motion.div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-bg2 rounded-2xl p-12 border border-borderline">
              <h2 className="text-3xl font-black uppercase text-ink mb-8">Send us a Message</h2>

              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-100 text-green-700 rounded-lg mb-6 font-bold">
                  Thank you! We'll get back to you soon.
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold uppercase text-ink mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand bg-white"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase text-ink mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand bg-white"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase text-ink mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand bg-white"
                    placeholder="Message subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase text-ink mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-6 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand bg-white resize-none"
                    placeholder="Your message..."></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand text-white py-4 rounded-lg font-black uppercase tracking-widest hover:bg-brand/90 transition">
                  Send Message
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      
      
    </div>
  )
}