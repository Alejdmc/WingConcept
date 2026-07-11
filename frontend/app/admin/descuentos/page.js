'use client'
import { useEffect, useState } from 'react'
import { Search, Send, Tag } from 'lucide-react'
import { api } from '@/lib/api'

function formatDescuento(cupon) {
  if (cupon.tipo === 'porcentaje') return `${cupon.valor}%`
  return `$${Number(cupon.valor).toLocaleString()}`
}

export default function AdminDescuentosPage() {
  const [buscar, setBuscar] = useState('')
  const [clientes, setClientes] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [cupones, setCupones] = useState([])
  const [loadingCupones, setLoadingCupones] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    tipo: 'porcentaje',
    valor: '',
    descripcion: '',
    dias_validez: '30',
  })

  const loadCupones = async () => {
    setLoadingCupones(true)
    try {
      const data = await api.admin.cupones({ por_pagina: 50 })
      setCupones(data.items || [])
    } catch {
      setError('No se pudieron cargar los cupones.')
    } finally {
      setLoadingCupones(false)
    }
  }

  useEffect(() => {
    loadCupones()
  }, [])

  useEffect(() => {
    if (buscar.trim().length < 2) {
      setClientes([])
      return
    }

    const timer = setTimeout(async () => {
      setBuscando(true)
      try {
        const data = await api.admin.usuarios({
          buscar: buscar.trim(),
          rol: 'client',
          por_pagina: 10,
        })
        setClientes(data.items || [])
      } catch {
        setClientes([])
      } finally {
        setBuscando(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [buscar])

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSend = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!selectedUser) {
      setError('Selecciona un cliente.')
      return
    }

    const valor = Number(form.valor)
    if (!valor || valor <= 0) {
      setError('Ingresa un valor de descuento válido.')
      return
    }
    if (form.tipo === 'porcentaje' && valor > 100) {
      setError('El porcentaje no puede ser mayor a 100.')
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
      setMessage(`Cupón ${cupon.codigo} enviado a ${selectedUser.email}.`)
      setForm({ tipo: 'porcentaje', valor: '', descripcion: '', dias_validez: '30' })
      setSelectedUser(null)
      setBuscar('')
      setClientes([])
      loadCupones()
    } catch (err) {
      setError(err.detail || 'Error al crear el cupón.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink">Descuentos</h1>
        <p className="text-ink2 mt-2">Asigna cupones personalizados a clientes. Se envían por correo y son de un solo uso.</p>
      </div>

      {message && <div className="mb-6 p-4 rounded bg-green-100 text-green-700">{message}</div>}
      {error && <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>}

      <form onSubmit={handleSend} className="bg-white border border-borderline rounded-lg p-6 space-y-6 mb-8">
        <h2 className="font-black text-lg flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Nuevo cupón
        </h2>

        <div>
          <label className="block text-sm font-semibold mb-2">Buscar cliente</label>
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-ink2" />
            <input
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              placeholder="Nombre, apellido o email..."
              className="w-full pl-10 p-3 border rounded"
            />
          </div>
          {buscando && <p className="text-xs text-ink2 mt-2">Buscando...</p>}
          {clientes.length > 0 && (
            <div className="mt-2 border border-borderline rounded overflow-hidden">
              {clientes.map((cliente) => (
                <button
                  key={cliente.id}
                  type="button"
                  onClick={() => {
                    setSelectedUser(cliente)
                    setBuscar(`${cliente.nombre} ${cliente.apellido}`)
                    setClientes([])
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
              Cliente seleccionado: {selectedUser.nombre} {selectedUser.apellido} ({selectedUser.email})
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Tipo de descuento</label>
            <select name="tipo" value={form.tipo} onChange={handleFormChange} className="w-full p-3 border rounded">
              <option value="porcentaje">Porcentaje (%)</option>
              <option value="fijo">Monto fijo (USD)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              {form.tipo === 'porcentaje' ? 'Porcentaje' : 'Monto USD'}
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
          <label className="block text-sm font-semibold mb-1">Descripción (opcional)</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleFormChange}
            rows={2}
            placeholder="Ej: Cupón de bienvenida por tu primera compra"
            className="w-full p-3 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Días de validez</label>
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
          {sending ? 'Enviando...' : 'Crear y enviar cupón'}
        </button>
      </form>

      <div className="bg-white border border-borderline rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-borderline">
          <h2 className="font-black text-lg">Cupones emitidos</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-bg2">
            <tr>
              <th className="text-left py-4 px-6 font-semibold">Código</th>
              <th className="text-left py-4 px-6 font-semibold">Cliente</th>
              <th className="text-left py-4 px-6 font-semibold">Descuento</th>
              <th className="text-left py-4 px-6 font-semibold">Estado</th>
              <th className="text-left py-4 px-6 font-semibold">Email</th>
            </tr>
          </thead>
          <tbody>
            {loadingCupones ? (
              <tr><td colSpan="5" className="py-8 text-center text-ink2">Cargando...</td></tr>
            ) : cupones.length === 0 ? (
              <tr><td colSpan="5" className="py-8 text-center text-ink2">Sin cupones emitidos.</td></tr>
            ) : (
              cupones.map((cupon) => (
                <tr key={cupon.id} className="border-t border-borderline hover:bg-bg2">
                  <td className="py-4 px-6 font-black tracking-wider">{cupon.codigo}</td>
                  <td className="py-4 px-6">
                    <p className="font-semibold">{cupon.usuario_nombre}</p>
                    <p className="text-ink2 text-xs">{cupon.usuario_email}</p>
                  </td>
                  <td className="py-4 px-6">{formatDescuento(cupon)}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${cupon.usado ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                      {cupon.usado ? 'Usado' : 'Disponible'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-xs font-bold ${cupon.email_enviado ? 'text-green-700' : 'text-ink2'}`}>
                      {cupon.email_enviado ? 'Enviado' : 'Simulado'}
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
