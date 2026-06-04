'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.auth.register(formData)
      // Tras el registro exitoso, redirigir al login
      router.push('/login')
    } catch (err) {
      setError(err.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg2 to-bg3 flex items-center justify-center px-4 py-12">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-ink hover:text-brand transition">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md">
        
        <div className="bg-white border border-borderline rounded-lg shadow-xl p-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black uppercase text-ink mb-2">Wing Concept</h1>
            <p className="text-ink2 font-semibold tracking-widest text-sm">CREATE YOUR ACCOUNT</p>
            <div className="w-12 h-1 bg-brand mx-auto mt-4" />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded text-sm font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-ink uppercase tracking-wide mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-ink2" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-borderline rounded bg-bg2 text-ink focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink uppercase tracking-wide mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-ink2" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-borderline rounded bg-bg2 text-ink focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-ink uppercase tracking-wide mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-ink2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3 border border-borderline rounded bg-bg2 text-ink focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-ink uppercase tracking-wide mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-ink2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3 border border-borderline rounded bg-bg2 text-ink focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-ink2 hover:text-brand transition">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" required className="w-4 h-4 border border-borderline rounded mt-1" />
              <span className="text-sm text-ink2">
                I agree to the{' '}
                <Link href="/terms" className="text-brand font-semibold hover:text-brand/80">
                  Terms and Conditions
                </Link>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand text-white font-black uppercase tracking-widest rounded hover:bg-brand/90 disabled:opacity-50 transition">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-ink2 mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-brand font-bold hover:text-brand/80">
              Login 
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}