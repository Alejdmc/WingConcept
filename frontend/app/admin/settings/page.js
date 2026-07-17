'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { getStoredUser } from '@/lib/auth'
import { persistAuthSession } from '@/lib/auth'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [profile, setProfile] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    rol: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    password_actual: '',
    nueva_password: '',
    confirmar: '',
  })

  const [inviteEmail, setInviteEmail] = useState('')
  const [sendingInvite, setSendingInvite] = useState(false)
  const [invitations, setInvitations] = useState([])
  const [loadingInvites, setLoadingInvites] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await api.usuarios.perfil()
        setProfile({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          email: data.email || '',
          telefono: data.telefono || '',
          rol: data.rol || '',
        })
      } catch {
        const stored = getStoredUser()
        if (stored) {
          setProfile((p) => ({ ...p, nombre: stored.nombre || '', rol: stored.rol || '' }))
        }
        setError('Could not load full profile.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const loadInvitations = async () => {
    setLoadingInvites(true)
    try {
      const data = await api.admin.listarInvitaciones({ por_pagina: 20 })
      setInvitations(data.items || [])
    } catch {
      setInvitations([])
    } finally {
      setLoadingInvites(false)
    }
  }

  useEffect(() => {
    loadInvitations()
  }, [])

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setError('')
    setMessage('')
    try {
      const updated = await api.usuarios.actualizarPerfil({
        nombre: profile.nombre,
        apellido: profile.apellido,
        telefono: profile.telefono || null,
      })
      const stored = getStoredUser()
      if (stored) {
        persistAuthSession({
          access_token: localStorage.getItem('access_token'),
          refresh_token: localStorage.getItem('refresh_token'),
          nombre: updated.nombre,
          rol: updated.rol,
          expires_in: 60 * 60 * 24 * 7,
        })
      }
      setMessage('Profile updated successfully.')
    } catch (err) {
      setError(err.detail || 'Error saving profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (passwordForm.nueva_password !== passwordForm.confirmar) {
      setError('New passwords do not match.')
      return
    }
    if (passwordForm.nueva_password.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }

    setSavingPassword(true)
    try {
      await api.usuarios.cambiarPassword({
        password_actual: passwordForm.password_actual,
        nueva_password: passwordForm.nueva_password,
      })
      setPasswordForm({ password_actual: '', nueva_password: '', confirmar: '' })
      setMessage('Password updated successfully.')
    } catch (err) {
      setError(err.detail || 'Error changing password.')
    } finally {
      setSavingPassword(false)
    }
  }

  const sendInvite = async (e) => {
    e.preventDefault()
    setSendingInvite(true)
    setError('')
    setMessage('')
    try {
      await api.admin.crearInvitacion(inviteEmail.trim())
      setInviteEmail('')
      setMessage('Admin invitation sent successfully.')
      await loadInvitations()
    } catch (err) {
      setError(err.detail || 'Could not send invitation.')
    } finally {
      setSendingInvite(false)
    }
  }

  const revokeInvite = async (invitacionId) => {
    setError('')
    setMessage('')
    try {
      await api.admin.revocarInvitacion(invitacionId)
      setMessage('Invitation revoked.')
      await loadInvitations()
    } catch (err) {
      setError(err.detail || 'Could not revoke invitation.')
    }
  }

  if (loading) {
    return <p className="text-ink2">Loading settings...</p>
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-black text-ink mb-2">Settings</h1>
      <p className="text-ink2 mb-8">Personal information and account security.</p>

      {message && <div className="mb-6 p-4 rounded bg-green-100 text-green-700">{message}</div>}
      {error && <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>}

      <form onSubmit={saveProfile} className="bg-white border border-borderline rounded-lg p-6 space-y-4 mb-8">
        <h2 className="font-black text-lg text-ink">Personal information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">First name</label>
            <input name="nombre" value={profile.nombre} onChange={handleProfileChange} required className="w-full p-3 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Last name</label>
            <input name="apellido" value={profile.apellido} onChange={handleProfileChange} required className="w-full p-3 border rounded" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input value={profile.email} disabled className="w-full p-3 border rounded bg-bg2 text-ink2" />
          <p className="text-xs text-ink2 mt-1">Email cannot be changed here.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Phone</label>
          <input name="telefono" value={profile.telefono} onChange={handleProfileChange} className="w-full p-3 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Role</label>
          <input value={profile.rol} disabled className="w-full p-3 border rounded bg-bg2 text-ink2 capitalize" />
        </div>

        <button disabled={savingProfile} className="px-6 py-3 bg-brand text-white rounded font-bold hover:bg-brand/90 disabled:opacity-50">
          {savingProfile ? 'Saving...' : 'Save profile'}
        </button>
      </form>

      <section className="bg-white border border-borderline rounded-lg p-6 space-y-4 mb-8">
        <h2 className="font-black text-lg text-ink">Admin invitations</h2>
        <p className="text-sm text-ink2">
          Invite a new administrator by email. They will receive a link to register or sign in.
        </p>

        <form onSubmit={sendInvite} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="admin@example.com"
            required
            className="flex-1 p-3 border rounded"
          />
          <button
            type="submit"
            disabled={sendingInvite}
            className="px-6 py-3 bg-brand text-white rounded font-bold hover:bg-brand/90 disabled:opacity-50"
          >
            {sendingInvite ? 'Sending...' : 'Send invite'}
          </button>
        </form>

        <div className="border-t border-borderline pt-4">
          <h3 className="text-sm font-bold uppercase text-ink2 mb-3">Recent invitations</h3>
          {loadingInvites ? (
            <p className="text-ink2 text-sm">Loading invitations...</p>
          ) : invitations.length === 0 ? (
            <p className="text-ink2 text-sm">No invitations yet.</p>
          ) : (
            <ul className="space-y-3">
              {invitations.map((inv) => {
                const pending = !inv.used_at && new Date(inv.expires_at) > new Date()
                return (
                  <li
                    key={inv.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border border-borderline rounded"
                  >
                    <div>
                      <p className="font-semibold text-ink">{inv.email}</p>
                      <p className="text-xs text-ink2">
                        Expires {formatDate(inv.expires_at)}
                        {inv.used_at ? ' · Used' : pending ? ' · Pending' : ' · Expired'}
                      </p>
                    </div>
                    {pending && (
                      <button
                        type="button"
                        onClick={() => revokeInvite(inv.id)}
                        className="text-sm font-bold text-red-600 hover:underline self-start sm:self-auto"
                      >
                        Revoke
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>

      <form onSubmit={savePassword} className="bg-white border border-borderline rounded-lg p-6 space-y-4">
        <h2 className="font-black text-lg text-ink">Change password</h2>

        <div>
          <label className="block text-sm font-semibold mb-1">Current password</label>
          <input type="password" name="password_actual" value={passwordForm.password_actual} onChange={handlePasswordChange} required className="w-full p-3 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">New password</label>
          <input type="password" name="nueva_password" value={passwordForm.nueva_password} onChange={handlePasswordChange} required minLength={8} className="w-full p-3 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Confirm new password</label>
          <input type="password" name="confirmar" value={passwordForm.confirmar} onChange={handlePasswordChange} required minLength={8} className="w-full p-3 border rounded" />
        </div>

        <button disabled={savingPassword} className="px-6 py-3 bg-brand text-white rounded font-bold hover:bg-brand/90 disabled:opacity-50">
          {savingPassword ? 'Updating...' : 'Change password'}
        </button>
      </form>
    </div>
  )
}
