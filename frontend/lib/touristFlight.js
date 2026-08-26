// COP -> USD exchange rate. Update here whenever it changes.
export const COP_TO_USD_RATE = 3218.44

export const TOURISTIC_FLIGHT_RATES = [
  { duration: '15 min', cop: 250000 },
  { duration: '30 min', cop: 450000 },
  { duration: '45 min', cop: 650000 },
  { duration: '60 min', cop: 800000 },
  { duration: '120 min', cop: 1500000 },
]

export const TOURISTIC_FLIGHT_SCHEDULE = [
  { label: '7:00 AM – 10:00 AM' },
  { label: '3:00 PM – 6:30 PM' },
]

export const TOURIST_FLIGHT_LOCATIONS = {
  colombia: [
    {
      id: 'club-aerosport',
      name: 'Club AeroSport',
      address: 'Aerosport, Flandes, Tolima',
      mapsUrl: 'https://www.google.com/maps/place/Club+AeroSport/@4.2402671,-74.8392002,4611m/data=!3m1!1e3!4m6!3m5!1s0x8e3ed76f3bc99b1b:0xd35e72144e2b518d!8m2!3d4.2339081!4d-74.8359822!16s%2Fg%2F11t29tlbp5',
      embedUrl: 'https://www.google.com/maps?q=Club+AeroSport,4.2339081,-74.8359822&z=15&output=embed',
    },
    {
      id: 'la-cabana',
      name: 'La Cabaña',
      address: 'Casanare, Colombia',
      mapsUrl: 'https://maps.app.goo.gl/fbRrxuz16Tu7miTr7',
      embedUrl: 'https://www.google.com/maps?q=La+Caba%C3%B1a+Hacienda,+Casanare,+Colombia&output=embed',
    },
  ],
  usa: [
    {
      id: 'miami',
      name: 'Miami',
      address: '451 S Airport Rd, Lake Wales, FL 33859, USA',
      mapsUrl: 'https://share.google/3HDY7RI0iW5CEBTB5',
      embedUrl: 'https://www.google.com/maps?q=451+S+Airport+Rd,+Lake+Wales,+FL+33859&output=embed',
    },
  ],
}

export const formatUSD = (cop) => (cop / COP_TO_USD_RATE).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

/** Reservation deposit (COP) — editable via admin product variant price. */
export const TOURIST_FLIGHT_DEPOSIT_COP = 20000

export const TOURIST_FLIGHT_DEPOSIT_USD = TOURIST_FLIGHT_DEPOSIT_COP / COP_TO_USD_RATE

/** Placeholder until legal document is provided. */
export const TOURIST_FLIGHT_TERMS_PATH = '/terms'

/** Site photos for each flying location (3–4 per site). */
export const TOURIST_FLIGHT_GALLERY = {
  'club-aerosport': [
    { src: '/images/colombia.jpg', alt: 'Club AeroSport — aerial view', caption: 'Flying over Flandes, Tolima' },
    { src: '/images/santamarta.jpg', alt: 'Coastal landscape', caption: 'Colombian countryside from above' },
    { src: '/images/front1.jpg', alt: 'Paramotor in flight', caption: 'Tandem tourist flight experience' },
  ],
  'la-cabana': [
    { src: '/images/leticia.jpg', alt: 'La Cabaña region', caption: 'Casanare landscapes' },
    { src: '/images/costarica.jpg', alt: 'Open fields', caption: 'Ideal takeoff conditions' },
    { src: '/images/front1.jpg', alt: 'Sunset flight', caption: 'Evening flight slot' },
  ],
  miami: [
    { src: '/images/colombia.jpg', alt: 'Florida airfield', caption: 'Lake Wales airfield' },
    { src: '/images/acrobatic.jpg', alt: 'Paramotor show', caption: 'Professional pilot demonstration' },
    { src: '/images/front1.jpg', alt: 'Tourist flight', caption: 'Experience paramotor flight in Florida' },
  ],
}
