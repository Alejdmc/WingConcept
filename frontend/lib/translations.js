export const translations = {
  en: {
    navbar: {
      paramotors: 'Paramotors',
      paratrike: 'Paratrike',
      adventure: 'Adventure',
      adventureWC: 'W.C Adventure',
      shows: 'W.C Shows',
      events: 'W.C Events',
      more: 'More',
      aboutUs: 'About Us',
      milestones: 'W.C Milestones',
      contactUs: 'Contact Us',
    },
  },
  es: {
    navbar: {
      paramotors: 'Paramotores',
      paratrike: 'Paramotrike',
      adventure: 'Aventura',
      adventureWC: 'Aventura W.C',
      shows: 'Espectáculos W.C',
      events: 'Eventos W.C',
      more: 'Más',
      aboutUs: 'Sobre Nosotros',
      milestones: 'Hitos W.C',
      contactUs: 'Contáctanos',
    },
  },
}

export const getTranslation = (language, key) => {
  const keys = key.split('.')
  let value = translations[language]
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  return value || key
}
