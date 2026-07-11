'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, RotateCcw } from 'lucide-react'
import { api } from '@/lib/api'
import { saveAuthNext, getAuthNext, buildAuthUrl } from '@/lib/authFlow'

export default function VerifyEmailPendingPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const nextUrl = getAuthNext(searchParams.get('next'), '/')
  const loginHref = buildAuthUrl('/login', nextUrl)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  useEffect(() => {
    saveAuthNext(nextUrl)
  }, [nextUrl])

  const handleResendEmail = async () => {
    if (!email) return

    setResendLoading(true)
    setResendMessage('')

    try {
      await api.auth.resendVerificationEmail(email)
      setResendMessage('Verification email sent! Check your inbox.')
    } catch (err) {
      setResendMessage(err.detail || 'Error sending email. Please try again.')
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

        <div className="bg-white rounded-2xl border-2 border-brand p-8 text-center">
          {/* Icon */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-brand-soft rounded-full flex items-center justify-center">
              <Mail className="w-12 h-12 text-brand" />
            </div>
          </motion.div>

          {/* Heading */}
          <h1 className="text-3xl font-black text-ink mb-4">Check Your Email</h1>
          
          {/* Email Address */}
          {email && (
            <p className="text-lg font-bold text-brand mb-6 break-all">
              {email}
            </p>
          )}

          {/* Instructions */}
          <div className="bg-bg2 rounded-lg p-6 mb-8 text-left space-y-4">
            <p className="text-ink font-bold">We've sent a verification link to your email.</p>
            <ol className="text-ink2 space-y-3 text-sm list-decimal list-inside">
              <li>Open your email inbox</li>
              <li>Find the email from Wing Concept</li>
              <li>Click the "Verify email" button</li>
              <li>You'll be redirected to complete verification</li>
            </ol>
          </div>

          {/* Resend Message */}
          {resendMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg mb-6 text-sm font-semibold ${
                resendMessage.includes('sent')
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
              {resendMessage}
            </motion.div>
          )}

          {/* Resend Button */}
          <button
            onClick={handleResendEmail}
            disabled={resendLoading}
            className="w-full flex items-center justify-center gap-2 bg-brand text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-brand/90 disabled:opacity-50 transition mb-6">
            <RotateCcw className="w-4 h-4" />
            {resendLoading ? 'Sending...' : 'Resend Email'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-borderline" />
            <span className="text-ink2 text-sm">or</span>
            <div className="flex-1 h-px bg-borderline" />
          </div>

          {/* Tips */}
          <div className="space-y-3 text-sm text-ink2 mb-8">
            <p>
              <strong>Tip:</strong> Check your spam folder if you don't see the email
            </p>
            <p>
              The verification link expires in 24 hours
            </p>
          </div>

          {/* Back to Login */}
          <Link href={loginHref} className="inline-block text-brand font-bold hover:underline">
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  )
}