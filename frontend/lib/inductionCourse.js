import { ShieldCheck, Award, Users, Cpu, BadgeCheck, ClipboardCheck, Radio, HeartHandshake } from 'lucide-react'

export const INDUCTION_PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Safety',
    desc: 'Safety is the foundation of every flight. Each trike goes through an engine, wing/lines, harness and emergency parachute inspection before being handed to a pilot.',
  },
  {
    icon: BadgeCheck,
    title: 'Reliability',
    desc: 'We work with engines and structures from industry-recognized manufacturers, with documented preventive maintenance on every unit.',
  },
  {
    icon: Award,
    title: 'Certified Pilots',
    desc: 'Our instructors follow certification programs recognized in the paramotor industry (progressive levels such as PPG1 to PPG3: ground handling, safe takeoff/landing, independent flight, and advanced conditions).',
  },
  {
    icon: Cpu,
    title: 'Latest-Generation Equipment',
    desc: 'Chassis, engines and instrumentation constantly updated for better performance, less weight and greater flight control.',
  },
  {
    icon: ShieldCheck,
    title: 'Certified Trikes',
    desc: 'Every paratrike we operate meets structural and safety specifications verified before flight.',
  },
  {
    icon: Cpu,
    title: 'Technology Used',
    desc: 'Flight instrumentation, active suspension systems and high-strength carbon fiber / steel components for maximum precision and durability.',
  },
  {
    icon: HeartHandshake,
    title: 'Commitment to Our Clients',
    desc: 'Support before, during and after the flight. Your safety and confidence are the priority in every Wing Concept experience.',
  },
]

export const INDUCTION_PREFLIGHT_CHECKLIST = [
  { icon: Radio, title: 'Engine & Fuel', desc: 'Verification of fuel level, throttle cable and overall engine operation.' },
  { icon: ClipboardCheck, title: 'Wing & Lines', desc: 'Inspection of the wing fabric and lines/risers for knots, wear or damage.' },
  { icon: Users, title: 'Harness & Safety Gear', desc: 'Inspection of harness straps, helmet and communication equipment.' },
  { icon: ShieldCheck, title: 'Emergency Parachute', desc: 'Confirmation that the reserve parachute is properly packed and up to date.' },
]
