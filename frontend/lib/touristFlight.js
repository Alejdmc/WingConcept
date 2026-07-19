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

export const CLUB_AEROSPORT_LOCATION = {
  name: 'Club AeroSport',
  address: 'Aerosport, Flandes, Tolima',
  lat: 4.2339081,
  lng: -74.8359822,
  mapsUrl: 'https://www.google.com/maps/place/Club+AeroSport/@4.2402671,-74.8392002,4611m/data=!3m1!1e3!4m6!3m5!1s0x8e3ed76f3bc99b1b:0xd35e72144e2b518d!8m2!3d4.2339081!4d-74.8359822!16s%2Fg%2F11t29tlbp5',
  embedUrl: 'https://www.google.com/maps?q=Club+AeroSport,4.2339081,-74.8359822&z=15&output=embed',
}

export const formatUSD = (cop) => (cop / COP_TO_USD_RATE).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
