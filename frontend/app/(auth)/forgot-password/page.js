'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.auth.forgotPassword(email)
      setSuccess(true)
    } catch (err) {
      const detail = err?.detail
      if (err?.status === 403) {
        setError(detail || 'Too many attempts. Please wait an hour and try again.')
      } else if (err?.status === 503 || err?.status === 500) {
        setError('Service temporarily unavailable. Please try again in a few minutes.')
      } else {
        setError(detail || 'Error sending recovery email. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-bg via-bg2 to-bg3 flex items-center justify-center px-4">
      <Link
        href="/login"
        className="group absolute top-8 left-8 inline-flex items-center gap-2 pl-2 pr-4 py-2 rounded-full border border-borderline bg-white text-ink text-sm font-bold uppercase tracking-wide hover:border-brand hover:text-brand hover:bg-brand-soft transition-all">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-bg2 group-hover:bg-brand transition-colors">
          <ArrowLeft className="w-4 h-4 text-ink2 group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
        </span>
        Back to Login
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white p-10 rounded-lg shadow-xl border border-borderline">
        <h1 className="text-3xl font-black uppercase text-ink mb-2">Recover Access</h1>
        <p className="text-ink2 text-sm mb-8">Enter your email to receive recovery instructions.</p>

        {success ? (
          <div className="p-4 bg-green-50 text-green-800 rounded font-bold">Check your inbox!</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex gap-3 p-4 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-ink2" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="w-full pl-12 py-3 border border-borderline rounded bg-bg2 focus:ring-1 focus:ring-brand" />
            </div>
            <button disabled={loading} className="w-full py-3 bg-brand text-white font-black uppercase tracking-widest rounded hover:bg-brand/90 transition disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Instructions'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}