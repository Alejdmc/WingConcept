'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Award, Users, Cpu, BadgeCheck, ClipboardCheck, Radio, HeartHandshake } from 'lucide-react'

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Seguridad',
    desc: 'La seguridad es el eje de cada vuelo. Cada trike pasa por inspección de motor, ala/cordaje, arnés y sistema de paracaídas de emergencia antes de ser entregado a un piloto.',
  },
  {
    icon: BadgeCheck,
    title: 'Confiabilidad',
    desc: 'Trabajamos con motores y estructuras de fabricantes reconocidos en la industria, con mantenimiento preventivo documentado en cada equipo.',
  },
  {
    icon: Award,
    title: 'Pilotos Certificados',
    desc: 'Nuestros instructores siguen programas de certificación reconocidos en la industria del paramotor (niveles progresivos tipo PPG1 a PPG3: manejo en tierra, despegue/aterrizaje seguro, vuelo independiente y condiciones avanzadas).',
  },
  {
    icon: Cpu,
    title: 'Equipos de Última Generación',
    desc: 'Chasis, motores e instrumentación actualizados constantemente para ofrecer mejor rendimiento, menor peso y mayor control en vuelo.',
  },
  {
    icon: ShieldCheck,
    title: 'Trikes Certificados',
    desc: 'Cada paratrike que operamos cumple especificaciones estructurales y de seguridad verificadas antes de salir a vuelo.',
  },
  {
    icon: Cpu,
    title: 'Tecnología Utilizada',
    desc: 'Instrumentación de vuelo, sistemas de suspensión activa y componentes en fibra de carbono / acero de alta resistencia para máxima precisión y durabilidad.',
  },
  {
    icon: HeartHandshake,
    title: 'Compromiso con el Cliente',
    desc: 'Acompañamiento antes, durante y después del vuelo. Tu seguridad y confianza son la prioridad en cada experiencia con Wing Concept.',
  },
]

const PREFLIGHT_CHECKLIST = [
  { icon: Radio, title: 'Motor y Combustible', desc: 'Verificación de nivel de combustible, cableado del acelerador y funcionamiento general del motor.' },
  { icon: ClipboardCheck, title: 'Ala y Líneas', desc: 'Revisión del tejido del ala y las líneas/riser en busca de nudos, desgaste o daños.' },
  { icon: Users, title: 'Arnés y Equipo de Seguridad', desc: 'Inspección de correas del arnés, casco y equipo de comunicación.' },
  { icon: ShieldCheck, title: 'Paracaídas de Emergencia', desc: 'Confirmación de que el paracaídas de reserva está correctamente empacado y vigente.' },
]

export default function CursoInductivoPage() {
  return (
    <div className="min-h-screen bg-white">
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
      <section className="relative h-[60vh] min-h-[420px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/images/bootcamp.jpg" alt="Curso Inductivo" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/55" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase text-white tracking-tighter mb-4 drop-shadow-2xl">
              Curso Inductivo
            </h1>
            <div className="h-2 w-24 bg-brand mx-auto mb-8" />
            <p className="text-xl md:text-2xl font-bold text-white drop-shadow-xl">
              Seguridad, confiabilidad y profesionalismo antes de cada vuelo
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PILLARS.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                  className="bg-bg2 border border-borderline rounded-xl p-8 hover:border-brand transition-all">
                  <Icon className="w-10 h-10 text-brand mb-4" />
                  <h3 className="font-black uppercase text-ink text-lg mb-3 tracking-wide">{p.title}</h3>
                  <p className="text-ink2 text-sm leading-relaxed">{p.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pre-flight checklist */}
      <section className="py-24 px-6 bg-bg2">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-ink mb-4">Procedimientos Antes del Vuelo</h2>
            <div className="h-1 w-16 bg-brand mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PREFLIGHT_CHECKLIST.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="bg-white border border-borderline rounded-xl p-6 flex gap-4 hover:border-brand transition">
                  <Icon className="w-6 h-6 text-brand shrink-0 mt-1" />
                  <div>
                    <h3 className="font-black uppercase text-ink mb-1">{item.title}</h3>
                    <p className="text-ink2 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-r from-brand to-brand/80">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-5xl font-black uppercase mb-8">¿Listo para volar con confianza?</h2>
          <p className="text-xl mb-12">Conoce más sobre nuestro programa de inducción y agenda tu primer vuelo.</p>
          <Link href="/contact" className="inline-block bg-white text-brand px-12 py-5 font-black uppercase tracking-widest rounded-lg hover:bg-white/90 transition">
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  )
}
