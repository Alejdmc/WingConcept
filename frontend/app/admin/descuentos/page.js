'use client'
import { useEffect, useState } from 'react'
import { Search, Send, Tag } from 'lucide-react'
import { api } from '@/lib/api'

function formatDiscount(cupon) {
  if (cupon.tipo === 'porcentaje') return `${cupon.valor}%`
  return `$${Number(cupon.valor).toLocaleString()}`
}

export default function AdminDescuentosPage() {
  const [search, setSearch] = useState('')
  const [clients, setClients] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [coupons, setCoupons] = useState([])
  const [loadingCoupons, setLoadingCoupons] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    tipo: 'porcentaje',
    valor: '',
    descripcion: '',
    dias_validez: '30',
  })

  const loadCoupons = async () => {
    setLoadingCoupons(true)
    try {
      const data = await api.admin.cupones({ por_pagina: 50 })
      setCoupons(data.items || [])
    } catch {
      setError('Could not load coupons.')
    } finally {
      setLoadingCoupons(false)
    }
  }

  useEffect(() => {
    loadCoupons()
  }, [])

  useEffect(() => {
    if (search.trim().length < 2) {
      setClients([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const data = await api.admin.usuarios({
          buscar: search.trim(),
          rol: 'client',
          por_pagina: 10,
        })
        setClients(data.items || [])
      } catch {
        setClients([])
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSend = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!selectedUser) {
      setError('Please select a customer.')
      return
    }

    const valor = Number(form.valor)
    if (!valor || valor <= 0) {
      setError('Enter a valid discount value.')
      return
    }
    if (form.tipo === 'porcentaje' && valor > 100) {
      setError('Percentage cannot be greater than 100.')
      return
    }

    setSending(true)
    try {
      const cupon = await api.admin.crearCupon({
        usuario_id: selectedUser.id,
        tipo: form.tipo,
        valor,
        descripcion: form.descripcion || null,
        dias_validez: form.dias_validez ? Number(form.dias_validez) : null,
      })
      setMessage(`Coupon ${cupon.codigo} sent to ${selectedUser.email}.`)
      setForm({ tipo: 'porcentaje', valor: '', descripcion: '', dias_validez: '30' })
      setSelectedUser(null)
      setSearch('')
      setClients([])
      loadCoupons()
    } catch (err) {
      setError(err.detail || 'Error creating coupon.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink">Discounts</h1>
        <p className="text-ink2 mt-2">Assign personalized coupons to customers. They are emailed and single-use.</p>
      </div>

      {message && <div className="mb-6 p-4 rounded bg-green-100 text-green-700">{message}</div>}
      {error && <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>}

      <form onSubmit={handleSend} className="bg-white border border-borderline rounded-lg p-6 space-y-6 mb-8">
        <h2 className="font-black text-lg flex items-center gap-2">
          <Tag className="w-5 h-5" />
          New coupon
        </h2>

        <div>
          <label className="block text-sm font-semibold mb-2">Search customer</label>
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-ink2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="First name, last name or email..."
              className="w-full pl-10 p-3 border rounded"
            />
          </div>
          {searching && <p className="text-xs text-ink2 mt-2">Searching...</p>}
          {clients.length > 0 && (
            <div className="mt-2 border border-borderline rounded overflow-hidden">
              {clients.map((cliente) => (
                <button
                  key={cliente.id}
                  type="button"
                  onClick={() => {
                    setSelectedUser(cliente)
                    setSearch(`${cliente.nombre} ${cliente.apellido}`)
                    setClients([])
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-bg2 border-b border-borderline last:border-b-0 ${
                    selectedUser?.id === cliente.id ? 'bg-brand-soft' : ''
                  }`}
                >
                  <p className="font-semibold">{cliente.nombre} {cliente.apellido}</p>
                  <p className="text-sm text-ink2">{cliente.email}</p>
                </button>
              ))}
            </div>
          )}
          {selectedUser && (
            <p className="text-sm text-green-700 mt-2 font-semibold">
              Selected customer: {selectedUser.nombre} {selectedUser.apellido} ({selectedUser.email})
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Discount type</label>
            <select name="tipo" value={form.tipo} onChange={handleFormChange} className="w-full p-3 border rounded">
              <option value="porcentaje">Percentage (%)</option>
              <option value="fijo">Fixed amount (USD)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              {form.tipo === 'porcentaje' ? 'Percentage' : 'Amount USD'}
            </label>
            <input
              name="valor"
              type="number"
              min="1"
              max={form.tipo === 'porcentaje' ? '100' : undefined}
              step="0.01"
              value={form.valor}
              onChange={handleFormChange}
              required
              className="w-full p-3 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Description (optional)</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleFormChange}
            rows={2}
            placeholder="e.g. Welcome coupon for your first purchase"
            className="w-full p-3 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Validity (days)</label>
          <input
            name="dias_validez"
            type="number"
            min="1"
            max="365"
            value={form.dias_validez}
            onChange={handleFormChange}
            className="w-full p-3 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded font-bold hover:bg-brand/90 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {sending ? 'Sending...' : 'Create and send coupon'}
        </button>
      </form>

      <div className="bg-white border border-borderline rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-borderline">
          <h2 className="font-black text-lg">Issued coupons</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-bg2">
            <tr>
              <th className="text-left py-4 px-6 font-semibold">Code</th>
              <th className="text-left py-4 px-6 font-semibold">Customer</th>
              <th className="text-left py-4 px-6 font-semibold">Discount</th>
              <th className="text-left py-4 px-6 font-semibold">Status</th>
              <th className="text-left py-4 px-6 font-semibold">Email</th>
            </tr>
          </thead>
          <tbody>
            {loadingCoupons ? (
              <tr><td colSpan="5" className="py-8 text-center text-ink2">Loading...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan="5" className="py-8 text-center text-ink2">No coupons issued yet.</td></tr>
            ) : (
              coupons.map((cupon) => (
                <tr key={cupon.id} className="border-t border-borderline hover:bg-bg2">
                  <td className="py-4 px-6 font-black tracking-wider">{cupon.codigo}</td>
                  <td className="py-4 px-6">
                    <p className="font-semibold">{cupon.usuario_nombre}</p>
                    <p className="text-ink2 text-xs">{cupon.usuario_email}</p>
                  </td>
                  <td className="py-4 px-6">{formatDiscount(cupon)}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${cupon.usado ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                      {cupon.usado ? 'Used' : 'Available'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-xs font-bold ${cupon.email_enviado ? 'text-green-700' : 'text-ink2'}`}>
                      {cupon.email_enviado ? 'Sent' : 'Simulated'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
