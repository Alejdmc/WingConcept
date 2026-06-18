'use client'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { api } from '@/lib/api'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.auth.resetPassword({ token, nueva_password: password })
      router.push('/login')
    } catch (err) {
      alert('Error updating password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg2">
      <motion.div className="w-full max-w-md bg-white p-10 rounded-lg shadow-xl">
        <h1 className="text-3xl font-black uppercase mb-6">New Password</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-ink2" />
            <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="New Password" required className="w-full pl-12 py-3 border rounded" />
          </div>
          <button className="w-full py-3 bg-brand text-white font-black uppercase rounded">Update Password</button>
        </form>
      </motion.div>
    </div>
  )
}