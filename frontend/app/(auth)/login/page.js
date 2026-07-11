'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import { persistAuthSession } from '@/lib/auth'
import { useCart } from '@/hooks/useCart'
import { saveAuthNext, getAuthNext, clearAuthNext, buildAuthUrl } from '@/lib/authFlow'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refetch } = useCart()
  const nextUrl = getAuthNext(searchParams.get('next'), '/')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    saveAuthNext(nextUrl)
  }, [nextUrl])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const completeLogin = async (res) => {
    persistAuthSession({ ...res, expires_in: res.expires_in || 60 * 60 * 24 * 7 })

    try {
      await api.carrito.merge()
      await refetch()
    } catch (err) {
      console.warn('Cart merge failed:', err)
    }

    const destination = res.rol === 'admin' ? '/admin/dashboard' : nextUrl
    clearAuthNext()
    router.push(destination.startsWith('/') ? destination : '/')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.auth.login(formData)
      await completeLogin(res)
    } catch (err) {
      setError(err.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const registerHref = buildAuthUrl('/register', nextUrl)
  const isCheckoutFlow = nextUrl === '/checkout'

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
            <p className="text-ink2 font-semibold tracking-widest text-sm">SIGN IN</p>
            {isCheckoutFlow && (
              <p className="text-sm text-brand font-semibold mt-3">
                Sign in to continue your purchase
              </p>
            )}
            <div className="w-12 h-1 bg-brand mx-auto mt-4" />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded text-sm font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="text-right mt-2">
                <Link href="/forgot-password" className="text-xs font-bold text-ink2 hover:text-brand">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand text-white font-black uppercase tracking-widest rounded hover:bg-brand/90 disabled:opacity-50 transition">
              {loading ? 'Signing in...' : isCheckoutFlow ? 'Sign In & Continue' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-ink2 mt-8">
            Don&apos;t have an account?{' '}
            <Link href={registerHref} className="text-brand font-bold hover:text-brand/80">
              Sign up here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
