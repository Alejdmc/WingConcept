'use client'
import { useEffect, useState } from 'react'
import { Search, Mail, ShieldOff, UserCheck, UserX, Send, X } from 'lucide-react'
import { api } from '@/lib/api'
import { getStoredUser } from '@/lib/auth'

const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  { value: 'client', label: 'Client' },
  { value: 'admin', label: 'Admin' },
]

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return value
  }
}

export default function AdminUsersPage() {
  const currentUser = getStoredUser()

  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [paginas, setPaginas] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)

  const [invitations, setInvitations] = useState([])
  const [loadingInvites, setLoadingInvites] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [sendingInvite, setSendingInvite] = useState(false)
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviteError, setInviteError] = useState('')

  const loadUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.admin.usuarios({
        pagina,
        por_pagina: 20,
        buscar: search.trim() || undefined,
        rol: roleFilter || undefined,
      })
      setUsers(data.items || [])
      setTotal(data.total || 0)
      setPaginas(data.paginas || 0)
    } catch (err) {
      console.error('Error loading admin users:', err)
      setError('Could not load users.')
    } finally {
      setLoading(false)
    }
  }

  const loadInvitations = async () => {
    setLoadingInvites(true)
    try {
      const data = await api.admin.listarInvitaciones({ por_pagina: 20 })
      setInvitations(data.items || [])
    } catch (err) {
      console.error('Error loading admin invitations:', err)
    } finally {
      setLoadingInvites(false)
    }
  }

  useEffect(() => {
    loadInvitations()
  }, [])

  useEffect(() => {
    setPagina(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers()
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter, pagina])

  const toggleActive = async (user) => {
    setSavingId(user.id)
    setError('')
    try {
      const updated = await api.admin.actualizarUsuario(user.id, { activo: !user.activo })
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...updated } : u)))
    } catch (err) {
      setError(err.detail || 'Could not update user.')
    } finally {
      setSavingId(null)
    }
  }

  const demoteToClient = async (user) => {
    setSavingId(user.id)
    setError('')
    try {
      const updated = await api.admin.cambiarRolUsuario(user.id, 'client')
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...updated } : u)))
    } catch (err) {
      setError(err.detail || 'Could not change role.')
    } finally {
      setSavingId(null)
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviteError('')
    setInviteMessage('')
    if (!inviteEmail.trim()) return

    setSendingInvite(true)
    try {
      await api.admin.crearInvitacion(inviteEmail.trim())
      setInviteMessage(`Invitation sent to ${inviteEmail.trim()}.`)
      setInviteEmail('')
      loadInvitations()
    } catch (err) {
      setInviteError(err.detail || 'Could not send invitation.')
    } finally {
      setSendingInvite(false)
    }
  }

  const revokeInvite = async (invitationId) => {
    setInviteError('')
    try {
      await api.admin.revocarInvitacion(invitationId)
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId))
    } catch (err) {
      setInviteError(err.detail || 'Could not revoke invitation.')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink">Users</h1>
        <p className="text-ink2 mt-2">Manage customer accounts and invite new admins.</p>
      </div>

      {error && <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-ink2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 p-3 border border-borderline rounded bg-bg2 focus:outline-none focus:border-brand"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="p-3 border border-borderline rounded bg-bg2 focus:outline-none focus:border-brand sm:w-48"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Users table */}
      <div className="bg-white border border-borderline rounded-lg overflow-x-auto mb-12">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-bg2">
            <tr className="border-b border-borderline">
              <th className="text-left py-4 px-6 font-semibold text-ink">Name</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Email</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Role</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Status</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Joined</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="py-8 text-center text-ink2">Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="6" className="py-8 text-center text-ink2">No users found.</td></tr>
            ) : (
              users.map((user) => {
                const isSelf = user.id === currentUser?.id
                return (
                  <tr key={user.id} className="border-b border-borderline hover:bg-bg2 transition">
                    <td className="py-4 px-6 font-semibold text-ink">
                      {user.nombre} {user.apellido}
                      {isSelf && <span className="ml-2 text-[10px] font-bold uppercase text-brand">You</span>}
                    </td>
                    <td className="py-4 px-6 text-ink2">
                      {user.email}
                      {!user.email_verificado && (
                        <span className="ml-2 text-[10px] font-bold uppercase text-yellow-700">Unverified</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                        user.rol === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.rol}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded text-xs font-bold ${
                        user.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.activo ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-ink2">{formatDate(user.created_at)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActive(user)}
                          disabled={isSelf || savingId === user.id}
                          title={user.activo ? 'Deactivate' : 'Activate'}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-borderline rounded hover:border-brand hover:text-brand transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {user.activo ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                          {user.activo ? 'Deactivate' : 'Activate'}
                        </button>
                        {user.rol === 'admin' && (
                          <button
                            onClick={() => demoteToClient(user)}
                            disabled={isSelf || savingId === user.id}
                            title="Demote to client"
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-borderline rounded hover:border-brand hover:text-brand transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <ShieldOff className="w-3 h-3" />
                            Demote
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {paginas > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-borderline text-sm text-ink2">
            <span>{total} user{total === 1 ? '' : 's'} total</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina <= 1}
                className="px-3 py-1.5 border border-borderline rounded font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand"
              >
                Previous
              </button>
              <span className="font-semibold text-ink">Page {pagina} / {paginas}</span>
              <button
                onClick={() => setPagina((p) => Math.min(paginas, p + 1))}
                disabled={pagina >= paginas}
                className="px-3 py-1.5 border border-borderline rounded font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin invitations */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-ink">Admin Invitations</h2>
        <p className="text-ink2 mt-1">Promoting to admin is only possible by sending an email invitation.</p>
      </div>

      {inviteMessage && <div className="mb-6 p-4 rounded bg-green-100 text-green-700">{inviteMessage}</div>}
      {inviteError && <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{inviteError}</div>}

      <form onSubmit={handleInvite} className="bg-white border border-borderline rounded-lg p-6 flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-3.5 w-4 h-4 text-ink2" />
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="new-admin@email.com"
            required
            className="w-full pl-10 p-3 border border-borderline rounded focus:outline-none focus:border-brand"
          />
        </div>
        <button
          type="submit"
          disabled={sendingInvite}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white rounded font-bold hover:bg-brand/90 disabled:opacity-50 transition shrink-0"
        >
          <Send className="w-4 h-4" />
          {sendingInvite ? 'Sending...' : 'Send invitation'}
        </button>
      </form>

      <div className="bg-white border border-borderline rounded-lg overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-bg2">
            <tr className="border-b border-borderline">
              <th className="text-left py-4 px-6 font-semibold text-ink">Email</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Status</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Expires</th>
              <th className="text-left py-4 px-6 font-semibold text-ink">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingInvites ? (
              <tr><td colSpan="4" className="py-8 text-center text-ink2">Loading invitations...</td></tr>
            ) : invitations.length === 0 ? (
              <tr><td colSpan="4" className="py-8 text-center text-ink2">No invitations sent yet.</td></tr>
            ) : (
              invitations.map((inv) => {
                const used = !!inv.used_at
                const expired = !used && inv.expires_at && new Date(inv.expires_at) < new Date()
                const status = used ? 'Accepted' : expired ? 'Expired' : 'Pending'
                const statusColor = used
                  ? 'bg-gray-100 text-gray-600'
                  : expired
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                return (
                  <tr key={inv.id} className="border-b border-borderline hover:bg-bg2 transition">
                    <td className="py-4 px-6 font-semibold text-ink">{inv.email}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded text-xs font-bold ${statusColor}`}>{status}</span>
                    </td>
                    <td className="py-4 px-6 text-ink2">{formatDate(inv.expires_at)}</td>
                    <td className="py-4 px-6">
                      {!used && !expired && (
                        <button
                          onClick={() => revokeInvite(inv.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-borderline rounded hover:border-red-500 hover:text-red-600 transition"
                        >
                          <X className="w-3 h-3" />
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
