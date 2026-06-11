'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, Globe, MapPin, Hash, Building } from 'lucide-react'
import { api } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', age: '',
    country: '', address: '', state: '', city: '', zipCode: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (parseInt(formData.age) < 18) {
      setError('You must be at least 18 years old.')
      return
    }
    setLoading(true)
    try {
      await api.auth.register(formData)
      router.push('/login')
    } catch (err) {
      setError(err.detail || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg2 to-bg3 flex items-center justify-center px-4 py-12">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-ink hover:text-brand transition">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="bg-white border border-borderline rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-black uppercase text-center mb-8">Wing Concept</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input name="firstName" placeholder="First Name" onChange={handleChange} required className="w-full p-3 border rounded bg-bg2" />
              <input name="lastName" placeholder="Last Name" onChange={handleChange} required className="w-full p-3 border rounded bg-bg2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select name="country" onChange={handleChange} required className="w-full p-3 border rounded bg-bg2">
                <option value="">Select Country</option>
                <option value="USA">USA</option>
                <option value="Colombia">Colombia</option>
              </select>
              <input type="number" name="age" placeholder="Age" onChange={handleChange} required className="w-full p-3 border rounded bg-bg2" />
            </div>

            <input name="address" placeholder="Street Address" onChange={handleChange} required className="w-full p-3 border rounded bg-bg2" />

            <div className="grid grid-cols-3 gap-4">
              <input name="city" placeholder="City" onChange={handleChange} required className="col-span-1 p-3 border rounded bg-bg2" />
              <input name="state" placeholder={formData.country === 'USA' ? 'State' : 'Dept'} onChange={handleChange} required className="col-span-1 p-3 border rounded bg-bg2" />
              <input name="zipCode" placeholder={formData.country === 'USA' ? 'Zip Code' : 'Postal Code'} onChange={handleChange} required className="col-span-1 p-3 border rounded bg-bg2" />
            </div>

            <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required className="w-full p-3 border rounded bg-bg2" />

            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" onChange={handleChange} required className="w-full p-3 border rounded bg-bg2" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-ink2">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button disabled={loading} className="w-full py-4 bg-brand text-white font-black uppercase rounded mt-4">
              {loading ? 'Processing...' : 'Create Account'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}