'use client'
import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import { persistAuthSession } from '@/lib/auth'
import { useCart } from '@/hooks/useCart'
import { saveAuthNext, getAuthNext, clearAuthNext, buildAuthUrl, resolveInviteToken, saveInviteToken, clearInviteToken } from '@/lib/authFlow'
import { isValidEmail, buildVerifyPendingUrl, shouldRequireEmailVerification } from '@/lib/validation'
import TurnstileWidget, { isCaptchaEnabled } from '@/components/ui/TurnstileWidget'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refetch } = useCart()
  const nextUrl = getAuthNext(searchParams.get('next'), '/')
  const inviteToken = resolveInviteToken(searchParams)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaKey, setCaptchaKey] = useState(0)

  useEffect(() => {
    saveAuthNext(nextUrl)
    if (inviteToken) saveInviteToken(inviteToken)
  }, [nextUrl, inviteToken])

  useEffect(() => {
    if (searchParams.get('session_expired') === 'true') {
      setError('Your session has expired. Please sign in again.')
    }
  }, [searchParams])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const completeLogin = async (res) => {
    if (shouldRequireEmailVerification(res)) {
      clearAuthNext()
      window.location.assign(buildVerifyPendingUrl(res.email, nextUrl))
      return
    }

    try {
      await api.carrito.merge()
      await refetch()
    } catch (err) {
      console.warn('Cart merge failed:', err)
    }

    const activeInvite = resolveInviteToken(searchParams)
    if (activeInvite) {
      try {
        await api.auth.acceptAdminInvite({ token: activeInvite })
        clearInviteToken()
        clearAuthNext()
        window.location.assign('/admin/dashboard')
        return
      } catch (err) {
        setError(err?.detail || 'Could not activate admin access. Check that the invite matches your email.')
        console.warn('Admin invite acceptance failed:', err)
      }
    }

    const destination = res.rol === 'admin'
      ? (nextUrl.startsWith('/admin') ? nextUrl : '/admin/dashboard')
      : nextUrl
    clearAuthNext()
    window.location.assign(destination.startsWith('/') ? destination : '/')
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address.')
      setLoading(false)
      return
    }

    if (isCaptchaEnabled() && !captchaToken) {
      setError('Please complete the captcha verification.')
      setLoading(false)
      return
    }

    try {
      const res = await api.auth.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        captchaToken,
      })
      persistAuthSession({ ...res, expires_in: res.expires_in || 60 * 60 * 24 * 7 })
      await completeLogin(res)
    } catch (err) {
      setError(err.detail || err.message || 'Login failed. Check that the backend is running.')
      setCaptchaKey((k) => k + 1)
      setCaptchaToken('')
    } finally {
      setLoading(false)
    }
  }

  const registerHref = buildAuthUrl('/register', nextUrl, inviteToken)
  const isCheckoutFlow = nextUrl === '/checkout'

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-bg via-bg2 to-bg3 flex items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="group absolute top-8 left-8 inline-flex items-center gap-2 pl-2 pr-4 py-2 rounded-full border border-borderline bg-white text-ink text-sm font-bold uppercase tracking-wide hover:border-brand hover:text-brand hover:bg-brand-soft transition-all">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-bg2 group-hover:bg-brand transition-colors">
          <ArrowLeft className="w-4 h-4 text-ink2 group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
        </span>
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
            {inviteToken && (
              <p className="text-sm text-brand font-semibold mt-3">
                Sign in to accept your admin invitation
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

            <TurnstileWidget
              resetKey={captchaKey}
              onToken={setCaptchaToken}
              onExpire={() => setCaptchaToken('')}
              className="flex justify-center"
            />

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
