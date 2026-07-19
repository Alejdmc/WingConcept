'use client'
import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, ArrowLeft, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Invalid or missing reset link.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await api.auth.resetPassword({ token, nueva_password: password })
      router.push('/login?reset=success')
    } catch (err) {
      setError(err?.detail || 'Error updating password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg2 px-4">
      <Link href="/login" className="absolute top-8 left-8 flex items-center gap-2 text-ink hover:text-brand transition">
        <ArrowLeft className="w-4 h-4" /> Back to Login
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white p-10 rounded-lg shadow-xl border border-borderline">
        <h1 className="text-3xl font-black uppercase mb-6">New Password</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex gap-3 p-4 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-ink2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
              required
              minLength={8}
              className="w-full pl-12 py-3 border border-borderline rounded bg-bg2 focus:ring-1 focus:ring-brand"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-ink2" />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm Password"
              required
              minLength={8}
              className="w-full pl-12 py-3 border border-borderline rounded bg-bg2 focus:ring-1 focus:ring-brand"
            />
          </div>
          <button
            disabled={loading}
            className="w-full py-3 bg-brand text-white font-black uppercase rounded hover:bg-brand/90 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-bg2 text-ink">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
