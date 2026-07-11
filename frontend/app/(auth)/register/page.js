'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, Globe, MapPin, AlertCircle, CheckCircle, Phone } from 'lucide-react'
import { api } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    country: '',
    address: '',
    state: '',
    city: '',
    zipCode: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validations
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.password) {
      setError('Please fill in all required fields.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    setLoading(true)

    try {
      await api.auth.register({
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono,
        password: formData.password,
      })

      setSuccess('Account created! Check your email to verify your address.')
      
      const userEmail = formData.email
      // Limpiar formulario
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        password: '',
        confirmPassword: '',
        country: '',
        address: '',
        state: '',
        city: '',
        zipCode: ''
      })

      // Redirigir a página de verificación después de 2 segundos
      setTimeout(() => {
        router.push(`/verify-email-pending?email=${encodeURIComponent(userEmail)}`)
      }, 2000)
    } catch (err) {
      setError(err.detail || 'Error creating account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg2 to-bg3 flex items-center justify-center px-4 py-12">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-ink hover:text-brand transition">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg">
        
        <div className="bg-white border border-borderline rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-black uppercase text-center mb-2">Create Account</h1>
          <p className="text-center text-ink2 mb-8">Join Wing Concept today</p>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 p-4 bg-red-100 text-red-700 rounded-lg text-sm font-semibold mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Success Alert */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 p-4 bg-green-100 text-green-700 rounded-lg text-sm font-semibold mb-6">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-ink mb-2">First Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-ink2 pointer-events-none" />
                  <input 
                    name="nombre" 
                    placeholder="John" 
                    onChange={handleChange} 
                    value={formData.nombre}
                    required 
                    className="w-full pl-10 pr-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand bg-bg2" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-ink mb-2">Last Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-ink2 pointer-events-none" />
                  <input 
                    name="apellido" 
                    placeholder="Doe" 
                    onChange={handleChange} 
                    value={formData.apellido}
                    required 
                    className="w-full pl-10 pr-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand bg-bg2" 
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase text-ink mb-2">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-ink2 pointer-events-none" />
                <input 
                  type="email" 
                  name="email" 
                  placeholder="your@email.com" 
                  onChange={handleChange} 
                  value={formData.email}
                  required 
                  className="w-full pl-10 pr-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand bg-bg2" 
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold uppercase text-ink mb-2">Phone (Optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-4 h-4 text-ink2 pointer-events-none" />
                <input 
                  type="tel" 
                  name="telefono" 
                  placeholder="+1 (555) 000-0000" 
                  onChange={handleChange} 
                  value={formData.telefono}
                  className="w-full pl-10 pr-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand bg-bg2" 
                />
              </div>
            </div>

            {/* Country & State */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-ink mb-2">Country</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3.5 w-4 h-4 text-ink2 pointer-events-none" />
                  <select 
                    name="country" 
                    onChange={handleChange} 
                    value={formData.country}
                    className="w-full pl-10 pr-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand bg-bg2 appearance-none">
                    <option value="">Select Country</option>
                    <option value="USA">USA</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-ink mb-2">State/Dept</label>
                <input 
                  name="state" 
                  placeholder={formData.country === 'USA' ? 'State' : 'Dept'} 
                  onChange={handleChange} 
                  value={formData.state}
                  className="w-full px-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand bg-bg2" 
                />
              </div>
            </div>

            {/* City & Zip */}
            <div className="grid grid-cols-2 gap-4">
              <input 
                name="city" 
                placeholder="City" 
                onChange={handleChange} 
                value={formData.city}
                className="w-full px-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand bg-bg2" 
              />
              <input 
                name="zipCode" 
                placeholder={formData.country === 'USA' ? 'Zip Code' : 'Postal Code'} 
                onChange={handleChange} 
                value={formData.zipCode}
                className="w-full px-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand bg-bg2" 
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold uppercase text-ink mb-2">Street Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-ink2 pointer-events-none" />
                <input 
                  name="address" 
                  placeholder="123 Main Street" 
                  onChange={handleChange} 
                  value={formData.address}
                  className="w-full pl-10 pr-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand bg-bg2" 
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase text-ink mb-2">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-ink2 pointer-events-none" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password" 
                  placeholder="••••••••" 
                  onChange={handleChange} 
                  value={formData.password}
                  required 
                  className="w-full pl-10 pr-12 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand bg-bg2" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-3.5 text-ink2 hover:text-brand transition">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-ink2 mt-1">At least 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold uppercase text-ink mb-2">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-ink2 pointer-events-none" />
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  name="confirmPassword" 
                  placeholder="••••••••" 
                  onChange={handleChange} 
                  value={formData.confirmPassword}
                  required 
                  className="w-full pl-10 pr-12 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand bg-bg2" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  className="absolute right-3 top-3.5 text-ink2 hover:text-brand transition">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              disabled={loading} 
              className="w-full py-4 bg-brand text-white font-black uppercase tracking-widest rounded-lg hover:bg-brand/90 disabled:opacity-50 transition mt-6">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-ink2 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand font-bold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}