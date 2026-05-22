import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0d0d0e]">
      {/* Video de fondo — descomenta cuando tengas el asset */}
      {/*
      <video autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover z-0">
        <source src="/videos/hero-reel.mp4" type="video/mp4" />
      </video>
      */}

      {/* Placeholder de video */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d0e] via-[#16213e] to-[#0f3460]" />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/45 to-black/65 z-10" />

      {/* Content */}
      <div className="relative z-20 text-center px-5 max-w-4xl mx-auto animate-[fadeUp_1s_ease_both]">
        <p className="flex items-center justify-center gap-3 text-[11px] font-bold tracking-[0.28em]
                      uppercase text-white/70 mb-5">
          <span className="w-8 h-px bg-brand" />
          WING CONCEPT PARAMOTORS
          <span className="w-8 h-px bg-brand" />
        </p>

        <h1 className="font-['Barlow_Condensed'] font-black italic uppercase leading-[0.92]
                       text-[clamp(52px,9vw,110px)] tracking-tight text-white
                       [text-shadow:0_4px_40px_rgba(0,0,0,0.5)] mb-7">
          EXPERIENCE THE<br />
          <span className="text-brand">FREEDOM</span><br />
          OF FLIGHT
        </h1>

        <p className="text-[clamp(14px,1.6vw,17px)] leading-relaxed text-white/72 max-w-[560px]
                      mx-auto mb-11 [text-shadow:0_2px_12px_rgba(0,0,0,0.4)]">
          Paramotoring unlocks a world of airborne adventure, freedom, and unforgettable moments.
          Soar above landscapes, discover new horizons, and join a passionate community of pilots.
        </p>

        <div className="flex items-center justify-center gap-3.5 flex-wrap">
          <Link href="/paramotors"
            className="inline-flex items-center gap-2 bg-brand text-white border-2 border-brand
                       px-8 py-3.5 rounded-[3px] font-['Barlow_Condensed'] text-[13px] font-bold
                       tracking-[0.12em] uppercase hover:bg-[#a93226] hover:border-[#a93226]
                       transition-all hover:-translate-y-px">
            <ArrowRight className="w-3.5 h-3.5" />
            Explore Paramotors
          </Link>
          <Link href="/about"
            className="inline-flex items-center gap-2 bg-transparent text-white border-2
                       border-white/40 px-8 py-3.5 rounded-[3px] font-['Barlow_Condensed']
                       text-[13px] font-bold tracking-[0.12em] uppercase
                       hover:border-white hover:bg-white/[0.08] transition-all hover:-translate-y-px">
            Our Story
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center
                      gap-2 text-white/45 text-[10px] font-semibold tracking-[0.18em] uppercase
                      animate-bounce">
        <ChevronDown className="w-4 h-4" />
        Scroll
      </div>
    </section>
  )
}