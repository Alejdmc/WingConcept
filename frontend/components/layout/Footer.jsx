'use client'
import Link from 'next/link'
import { Facebook, Instagram, TikTok, Youtube, Mail, Phone } from 'lucide-react'

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
  </svg>
)

export default function Footer() {
  return (
    <footer className="bg-bg3 text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-black uppercase mb-4">Wing<span className="text-brand"> Concept</span></h3>
            <p className="text-white/60 text-sm leading-relaxed">Experience the freedom of flight with our premium paramotors engineered for performance and safety.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-black uppercase text-sm mb-4 tracking-widest">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/paramotors" className="text-white/60 hover:text-brand transition">Paramotors</Link></li>
              <li><Link href="/paratrike" className="text-white/60 hover:text-brand transition">Paratrike</Link></li>
              <li><Link href="/about" className="text-white/60 hover:text-brand transition">About Us</Link></li>
              <li><Link href="/contact" className="text-white/60 hover:text-brand transition">Contact</Link></li>
            </ul>
          </div>


          {/* Contact */}
          <div>
            <h4 className="font-black uppercase text-sm mb-4 tracking-widest">Get In Touch</h4>
            <div className="space-y-3">
              <a href="mailto:andres@wingconcept.com" className="flex items-center gap-2 text-white/60 hover:text-brand transition text-sm">
                <Mail className="w-4 h-4" />
                andres@wingconcept.com
              </a>
              <a href="tel:+573001234567" className="flex items-center gap-2 text-white/60 hover:text-brand transition text-sm">
                <Phone className="w-4 h-4" />
                +1 (818) 749-4545
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 mb-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Copyright */}
          <div className="text-white/40 text-xs">
            <p>&copy; 2026 Wing Concept. All rights reserved.</p>
            <p className="mt-2">Designed & Developed by <span className="text-brand font-bold">ZomiDev</span></p>
          </div>

          {/* Right: Social */}
          <div className="flex items-center gap-6">
            <a href="https://www.instagram.com/wing_concepts?igsh=aW0yMWU3M2c2Y3d0" className="text-white/60 hover:text-brand transition"><Instagram className="w-5 h-5" /></a>
            <a href="https://www.facebook.com/share/17htSFE4gR/?mibextid=wwXIfr" className="text-white/60 hover:text-brand transition"><Facebook className="w-5 h-5" /></a>
            {/* <a href="#" className="text-white/60 hover:text-brand transition"><TikTokIcon /></a> */}
            {/* <a href="#" className="text-white/60 hover:text-brand transition"><Youtube className="w-5 h-5" /></a> */}
          </div>

          {/* Legal Links */}
          <div className="flex gap-4 text-xs">
            <Link href="/privacy" className="text-white/40 hover:text-brand transition">Privacy</Link>
            <Link href="/terms" className="text-white/40 hover:text-brand transition">Terms</Link>
            <Link href="/cookies" className="text-white/40 hover:text-brand transition">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}