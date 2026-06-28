'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { api } from '@/lib/api'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendEmail, setResendEmail] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid or missing verification token.')
      return
    }

    verifyEmail()
  }, [token])

  const verifyEmail = async () => {
    try {
      setStatus('verifying')
      const res = await api.auth.verifyEmail(token)
      setStatus('success')
      setMessage('Your email has been verified successfully!')
      setEmail(res.email || '')
      
      // Redirigir a login después de 3 segundos
      setTimeout(() => {
        router.push('/login?verified=true')
      }, 3000)
    } catch (err) {
      setStatus('error')
      setMessage(err.detail || 'Error verifying email. The token may have expired.')
      // Extraer email del error si es posible
      if (err.detail && err.detail.includes('@')) {
        const emailMatch = err.detail.match(/[\w\.-]+@[\w\.-]+\.\w+/)
        if (emailMatch) setEmail(emailMatch[0])
      }
    }
  }

  const handleResendEmail = async (e) => {
    e.preventDefault()
    if (!resendEmail) {
      setMessage('Please enter your email address.')
      return
    }

    setResendLoading(true)
    try {
      await api.auth.resendVerificationEmail(resendEmail)
      setMessage(`A new verification email has been sent to ${resendEmail}`)
      setStatus('email_sent')
      setResendEmail('')
    } catch (err) {
      setMessage(err.detail || 'Error sending verification email. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg2 to-white flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md">

        {/* Success State */}
        {status === 'success' && (
          <div className="bg-white rounded-2xl border-2 border-green-500 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-6">
              <CheckCircle className="w-20 h-20 text-green-500" />
            </motion.div>

            <h1 className="text-3xl font-black text-ink mb-4">Email Verified!</h1>
            <p className="text-ink2 mb-2">Your email address has been successfully verified.</p>
            <p className="text-sm text-ink2 mb-8">
              You'll be redirected to login in a few seconds...
            </p>

            <div className="space-y-4">
              <Link href="/login" className="block w-full bg-brand text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-brand/90 transition text-center">
                Go to Login
              </Link>
            </div>
          </div>
        )}

        {/* Verifying State */}
        {status === 'verifying' && (
          <div className="bg-white rounded-2xl border-2 border-borderline p-8 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="flex justify-center mb-6">
              <Loader className="w-20 h-20 text-brand" />
            </motion.div>

            <h1 className="text-3xl font-black text-ink mb-4">Verifying Email</h1>
            <p className="text-ink2">Please wait while we verify your email address...</p>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="bg-white rounded-2xl border-2 border-red-500 p-8">
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-20 h-20 text-red-500" />
            </div>

            <h1 className="text-3xl font-black text-ink mb-4 text-center">Verification Failed</h1>
            <p className="text-ink2 mb-8 text-center">{message}</p>

            {/* Resend Email Form */}
            <form onSubmit={handleResendEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-bold uppercase text-ink mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={resendEmail || email}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand"
                />
              </div>

              <button
                type="submit"
                disabled={resendLoading}
                className="w-full bg-brand text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-brand/90 disabled:opacity-50 transition">
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </form>

            <p className="text-center text-sm text-ink2 mt-6">
              Remember your password?{' '}
              <Link href="/login" className="text-brand font-bold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        )}

        {/* Email Sent State */}
        {status === 'email_sent' && (
          <div className="bg-white rounded-2xl border-2 border-brand p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-6">
              <CheckCircle className="w-20 h-20 text-brand" />
            </motion.div>

            <h1 className="text-3xl font-black text-ink mb-4">Email Sent!</h1>
            <p className="text-ink2 mb-8">{message}</p>

            <p className="text-center text-sm text-ink2">
              Check your inbox and click the verification link to continue.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}