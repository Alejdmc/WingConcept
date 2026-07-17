// components/layout/TopBar.jsx
import { Mail, Phone, Instagram, Facebook, Youtube } from 'lucide-react'

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[15px] h-[15px]">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
  </svg>
)

export default function TopBar() {
  return (
    <div className="bg-bg2 border-b border-borderline h-12 flex items-center justify-between px-4 sm:px-6 md:px-8">
      <div className="hidden md:flex items-center gap-5">
        <a href="mailto:andres@wingconcept.com"
          className="flex items-center gap-1.5 text-[11.5px] font-medium text-ink2 tracking-wide hover:text-brand transition-colors">
          <Mail className="w-3.5 h-3.5" />
          andres@wingconcept.com
        </a>
        <a href="tel:+1 (818) 749-4545"
          className="flex items-center gap-1.5 text-[11.5px] font-medium text-ink2 tracking-wide hover:text-brand transition-colors">
          <Phone className="w-3.5 h-3.5" />
          +1 (818) 749-4545
        </a>
      </div>
      <a href="tel:+1 (818) 749-4545"
        className="flex md:hidden items-center gap-1.5 text-[11.5px] font-medium text-ink2 tracking-wide hover:text-brand transition-colors">
        <Phone className="w-3.5 h-3.5" />
        +1 (818) 749-4545
      </a>
      <div className="flex items-center gap-1">
        {[
          { Icon: Instagram, href: 'https://www.instagram.com/wing_concepts?igsh=aW0yMWU3M2c2Y3d0' },
          { Icon: Facebook,  href: 'https://www.facebook.com/share/17htSFE4gR/?mibextid=wwXIfr' },
          { Icon: Youtube,   href: 'https://www.youtube.com/@wingconcept' },
        ].map(({ Icon, href }, i) => (
          <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="p-2 -m-2 text-ink2 hover:text-brand transition-colors">
            <Icon className="w-5 h-5" />
          </a>
        ))}
      </div>
    </div>
  )
}