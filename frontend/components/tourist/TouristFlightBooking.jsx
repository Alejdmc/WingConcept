'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { PRODUCT_IDS } from '@/lib/products'
import {
  TOURISTIC_FLIGHT_RATES,
  TOURIST_FLIGHT_LOCATIONS,
  TOURIST_FLIGHT_DEPOSIT_COP,
  TOURIST_FLIGHT_TERMS_PATH,
  formatUSD,
} from '@/lib/touristFlight'

const ALL_LOCATIONS = [
  ...TOURIST_FLIGHT_LOCATIONS.colombia.map((l) => ({ ...l, region: 'Colombia' })),
  ...TOURIST_FLIGHT_LOCATIONS.usa.map((l) => ({ ...l, region: 'United States' })),
]

export default function TouristFlightBooking() {
  const router = useRouter()
  const { addToCart } = useCart()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    age: '',
    locationId: ALL_LOCATIONS[0]?.id || '',
    duration: TOURISTIC_FLIGHT_RATES[0]?.duration || '15 min',
    termsAccepted: false,
  })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const location = ALL_LOCATIONS.find((l) => l.id === form.locationId)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim() || !form.age.trim()) {
      setError('Please fill in all personal details.')
      return
    }
    if (!form.termsAccepted) {
      setError('You must accept the conditions and restrictions to continue.')
      return
    }

    setStatus('loading')
    try {
      await addToCart({
        producto_id: PRODUCT_IDS.touristFlight,
        cantidad: 1,
        configuracion: {
          bookingType: 'tourist-flight',
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
          age: Number(form.age),
          locationId: form.locationId,
          locationName: location ? `${location.name}, ${location.region}` : form.locationId,
          duration: form.duration,
          termsAccepted: true,
        },
      })
      router.push('/cart')
    } catch (err) {
      setError(err?.detail || err?.message || 'Could not add reservation to cart.')
      setStatus('idle')
    }
  }

  return (
    <section className="py-24 px-6 bg-white border-t border-borderline">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-ink mb-3">Book Your Flight</h2>
          <div className="h-1 w-16 bg-brand mx-auto mb-4" />
          <p className="text-ink2">
            Reserve your spot with a deposit of{' '}
            <span className="font-black text-brand">{formatUSD(TOURIST_FLIGHT_DEPOSIT_COP)}</span>
            {' '}({TOURIST_FLIGHT_DEPOSIT_COP.toLocaleString('es-CO')} COP). Final flight price depends on duration selected.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-bg2 border border-borderline rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold uppercase text-ink mb-1">First name *</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-borderline bg-white" />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase text-ink mb-1">Last name *</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-borderline bg-white" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold uppercase text-ink mb-1">Phone *</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-borderline bg-white" />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase text-ink mb-1">Age *</label>
              <input name="age" type="number" min="1" max="120" value={form.age} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-borderline bg-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase text-ink mb-1">Location *</label>
            <select name="locationId" value={form.locationId} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-borderline bg-white">
              {ALL_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name} — {loc.region}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase text-ink mb-1">Preferred duration *</label>
            <select name="duration" value={form.duration} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-borderline bg-white">
              {TOURISTIC_FLIGHT_RATES.map((rate) => (
                <option key={rate.duration} value={rate.duration}>
                  {rate.duration} — {formatUSD(rate.cop)} ({rate.cop.toLocaleString('es-CO')} COP)
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={form.termsAccepted}
              onChange={handleChange}
              className="mt-1 shrink-0"
            />
            <span className="text-sm text-ink2 leading-relaxed">
              I accept the{' '}
              <Link href={TOURIST_FLIGHT_TERMS_PATH} target="_blank" className="text-brand font-bold hover:underline">
                conditions and restrictions
              </Link>
              {' '}for tourist flights. (Legal document pending — placeholder link.)
            </span>
          </label>

          {error && (
            <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-lg bg-brand text-white font-black uppercase tracking-widest hover:bg-brand/90 disabled:opacity-50 transition">
            {status === 'loading' ? (
              'Adding to cart...'
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                Reserve — {formatUSD(TOURIST_FLIGHT_DEPOSIT_COP)}
              </>
            )}
          </button>

          <p className="text-xs text-ink2 text-center">
            After checkout our team will contact you to confirm your time slot and flight details.
          </p>
        </form>
      </div>
    </section>
  )
}
