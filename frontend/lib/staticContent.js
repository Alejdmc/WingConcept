/** Static CMS fallbacks when the API backend is unavailable (dev without Docker, etc.). */

export const HOMEPAGE_BLOCKS = {
  'homepage.hero.eyebrow': 'WING CONCEPT PARAMOTORS',
  'homepage.hero.line1': 'WHERE',
  'homepage.hero.line2': 'FREEDOM TAKES',
  'homepage.hero.line3': 'WINGS',
  'homepage.hero.cta_primary': 'Explore Paramotors',
  'homepage.hero.cta_secondary': 'Our Story',
  'homepage.hero.images': '/images/paramotor_image.jpg\n/images/paramotor_image2.jpg\n/images/image1.jpg',
}

export const ADVENTURE_FALLBACK = {
  hero: {
    titulo: 'W.C Adventure',
    descripcion: 'Extraordinary Flying Experiences Around the World',
    imagen: '/images/front1.jpg',
  },
  intro: {
    descripcion: 'Join us on unforgettable paramotor expeditions to the world\'s most stunning destinations — from tropical coastlines to mountain ranges.',
  },
  expediciones: [
    {
      id: 'exp-colombia',
      titulo: 'Colombia Expedition',
      descripcion: 'Fly over lush landscapes and coastal cliffs in one of the world\'s premier paramotor destinations.',
      imagen: '/images/colombia.jpg',
      ubicacion: 'Colombia',
      duracion: '7 days',
      dificultad: 'Intermediate',
      participantes: 8,
      highlights: ['Coastal ridge soaring', 'Local guide support', 'Equipment included'],
    },
    {
      id: 'exp-costa-rica',
      titulo: 'Costa Rica Adventure',
      descripcion: 'Explore volcanic terrain and Pacific coastlines from the sky on this guided expedition.',
      imagen: '/images/costarica.jpg',
      ubicacion: 'Costa Rica',
      duracion: '5 days',
      dificultad: 'Beginner',
      participantes: 10,
      highlights: ['Volcano views', 'Beach landings', 'Group training sessions'],
    },
    {
      id: 'exp-santamarta',
      titulo: 'Santa Marta Coastal Flight',
      descripcion: 'Soar above the Caribbean coast with stunning views of Sierra Nevada de Santa Marta.',
      imagen: '/images/santamarta.jpg',
      ubicacion: 'Santa Marta, Colombia',
      duracion: '4 days',
      dificultad: 'Intermediate',
      participantes: 6,
      highlights: ['Caribbean coastline', 'Sunrise flights', 'Local culture tours'],
    },
    {
      id: 'exp-amazon',
      titulo: 'Amazon Rainforest Expedition',
      descripcion: 'A once-in-a-lifetime paramotor journey over the Amazon basin with expert pilots.',
      imagen: '/images/leticia.jpg',
      ubicacion: 'Leticia, Colombia',
      duracion: '10 days',
      dificultad: 'Advanced',
      participantes: 4,
      highlights: ['Rainforest overflights', 'River landings', 'Expedition camping'],
    },
  ],
}

export const SHOWS_FALLBACK = {
  hero: { titulo: 'W.C Shows', descripcion: 'Witness the Art of Paramotor Flight', imagen: '/images/acrobatic.jpg' },
  intro: { descripcion: 'Experience the thrill of elite paramotor competitions and world-class aerial demonstrations.' },
  shows: [
    {
      id: 'show-acrobatic',
      titulo: 'Acrobatic Paramotor Show',
      descripcion: 'World-class pilots perform precision aerobatics and formation flying.',
      imagen: '/images/acrobatic.jpg',
      fecha: 'Coming soon',
      ubicacion: 'USA',
      highlights: ['Formation flying', 'Night glow display', 'Pilot meet & greet'],
    },
    {
      id: 'show-european',
      titulo: 'European Air Games',
      descripcion: 'International paramotor competition featuring the best pilots from around the world.',
      imagen: '/images/european.jpg',
      fecha: 'Coming soon',
      ubicacion: 'Europe',
      highlights: ['International competition', 'Equipment expo', 'Workshops'],
    },
  ],
}

export const EVENTS_FALLBACK = {
  hero: { titulo: 'W.C Events', descripcion: 'Learn, Connect, and Grow with Our Community', imagen: '/images/bootcamp.jpg' },
  intro: { descripcion: 'Join our exclusive training courses, workshops, and community events.' },
  eventos: [
    {
      id: 'event-bootcamp',
      titulo: 'Paramotor Bootcamp',
      descripcion: 'Intensive multi-day training for pilots of all levels with certified instructors.',
      imagen: '/images/bootcamp.jpg',
      fecha: 'Coming soon',
      hora: '8:00 AM – 5:00 PM',
      ubicacion: 'USA',
      capacidad: '20 participants',
      precio: '$1,200',
      highlights: ['Ground handling', 'Tandem instruction', 'Equipment review'],
    },
    {
      id: 'event-induction',
      titulo: 'Induction Course',
      descripcion: 'Complete introduction to powered paragliding for new pilots.',
      imagen: '/images/bootcamp.jpg',
      fecha: 'Coming soon',
      hora: '9:00 AM – 4:00 PM',
      ubicacion: 'USA',
      capacidad: '15 participants',
      precio: '$850',
      highlights: ['Theory sessions', 'Simulator practice', 'First solo flight prep'],
    },
  ],
}

export const NEWS_FALLBACK = {
  hero: {
    titulo: 'W.C News',
    descripcion: 'Latest from Wing Concept — products, pilots, and the paramotor world',
    imagen: '/images/front1.jpg',
  },
  intro: {
    descripcion: 'Product launches, expedition reports, dealer updates, and stories from the Wing Concept community. Each article links directly to the section it highlights.',
  },
  noticias: [
    {
      id: 'news-disruptor',
      titulo: 'Disruptor Paramotor & Trike Now Available',
      descripcion: 'The Disruptor line is here — paramotor and paratrike platforms built for pilots who evolve with every flight.',
      imagen: '/images/disruptor/paramotor-1.jpg',
      fecha: 'August 2026',
      ubicacion: 'Product Launch',
      href: '/paramotors/disruptor',
      highlights: ['Gravity Control System', 'Online configurator', 'Expedition-ready trike'],
    },
    {
      id: 'news-nomadic',
      titulo: 'Nomadic Trike — Configure Your Expedition Build',
      descripcion: 'The Nomadic Trike is built for adventure paramotoring in remote environments — tundra wheels, telescopic axles, and multi-engine mounts.',
      imagen: '/images/nomadic/2.jpg',
      fecha: 'August 2026',
      ubicacion: 'Paratrike',
      href: '/paratrike/nomadic',
      highlights: ['Stainless steel chassis', '45 kg dry weight', 'Configure online'],
    },
    {
      id: 'news-vanguard',
      titulo: 'Vanguard V8.0 — Three Flight Modes in One Trike',
      descripcion: 'Commercial, Adventure, or Reportage — interchangeable mission pods and in-flight center-of-gravity adjustment on the Vanguard V8.0.',
      imagen: '/images/vanguard/1.png',
      fecha: 'August 2026',
      ubicacion: 'Paratrike',
      href: '/paratrike/vanguard',
      highlights: ['Commercial / Adventure / Reportage', '17-gallon fuel tank', 'Open configurator'],
    },
    {
      id: 'news-tourist-flight',
      titulo: 'Book a Tourist Flight',
      descripcion: 'Experience the freedom of paramotor flight with a certified pilot. Locations in Colombia and the United States.',
      imagen: '/images/colombia.jpg',
      fecha: 'August 2026',
      ubicacion: 'Experiences',
      href: '/tourist-flight',
      highlights: ['Colombia & USA locations', 'Certified pilots', 'Schedule & rates online'],
    },
    {
      id: 'news-parts',
      titulo: 'Parts & Accessories Catalog Updated',
      descripcion: 'Structural parts and optional accessories for Vanguard and Nomadic — now with expandable product photos.',
      imagen: '/images/parts/front-axle.png',
      fecha: 'August 2026',
      ubicacion: 'Shop',
      href: '/parts',
      highlights: ['Vanguard & Nomadic compatible', 'Add to cart', 'Enlarge photos'],
    },
  ],
}
