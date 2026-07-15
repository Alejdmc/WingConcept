'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronRight, ArrowLeft, Trash2, Plus, Minus, Tag, X } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { getStoredUser } from '@/lib/auth'
import { saveAuthNext } from '@/lib/authFlow'
import { api } from '@/lib/api'

const COUPON_ERROR_EN = {
  'Cupón no encontrado': 'Coupon not found',
  'Este cupón no está asignado a tu cuenta': 'This coupon is not assigned to your account',
  'Este cupón ya fue utilizado': 'This coupon has already been used',
  'Este cupón ha expirado': 'This coupon has expired',
}

function couponErrorEn(message) {
  return COUPON_ERROR_EN[message] || message || 'Invalid coupon'
}

const CHECKOUT_STEPS = [
  { id: 1, name: 'Cart', path: '/checkout' },
  { id: 2, name: 'Shipping', path: '/checkout/shipping' },
  { id: 3, name: 'Payment', path: '/checkout/payment' },
  { id: 4, name: 'Confirmation', path: '/checkout/confirmation' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total: cartTotal, updateQuantity: updateCartQty, removeFromCart, refetch } = useCart()
  const [cartError, setCartError] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [ready, setReady] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    const user = getStoredUser()
    if (!token || !user) {
      saveAuthNext('/checkout')
      router.replace('/login?next=/checkout')
      return
    }
    setReady(true)
    refetch()
  }, [router, refetch])

  if (!ready) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-ink2">Verifying session...</p>
      </div>
    )
  }

  const cart = { items, total: cartTotal, cantidad_items: items.reduce((s, i) => s + (i.cantidad || 1), 0) }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-bg px-8 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-black mb-4">Your cart is empty</h1>
          <p className="text-ink2 mb-8">Add products before continuing to checkout.</p>
          <Link href="/" className="inline-block bg-brand text-white px-8 py-4 font-bold uppercase rounded">
            Go to store
          </Link>
        </div>
      </div>
    )
  }

  const subtotal = cartTotal
  const discount = appliedCoupon?.descuento_estimado || 0
  const taxable = Math.max(subtotal - discount, 0)
  const tax = Math.round(taxable * 0.19)
  const orderTotal = taxable + tax

  const applyCoupon = async () => {
    const code = couponCode.trim()
    if (!code) return

    setCouponLoading(true)
    setCouponError('')
    try {
      const result = await api.cupones.validar(code, subtotal)
      if (!result.valido) {
        setCouponError(couponErrorEn(result.mensaje))
        setAppliedCoupon(null)
        return
      }
      setAppliedCoupon(result)
      setCouponCode(result.codigo)
      sessionStorage.setItem('checkout_coupon', result.codigo)
    } catch (err) {
      setCouponError(couponErrorEn(err.detail) || 'Could not validate coupon')
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
    sessionStorage.removeItem('checkout_coupon')
  }

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return
    updateCartQty(itemId, newQuantity)
  }

  const removeItem = (itemId) => {
    removeFromCart(itemId)
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-white border-b border-borderline sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/" className="flex items-center gap-2 text-ink hover:text-brand transition mb-6">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>

          {/* Steps */}
          <div className="flex items-center justify-between">
            {CHECKOUT_STEPS.map((step, i) => (
              <div key={step.id} className="flex items-center flex-1">
                <motion.div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all
                    ${currentStep >= step.id
                      ? 'bg-brand text-white'
                      : 'bg-borderline text-ink2'
                    }`}>
                  {step.id}
                </motion.div>
                <p className={`ml-3 text-sm font-semibold ${
                  currentStep >= step.id ? 'text-ink' : 'text-ink2'
                }`}>
                  {step.name}
                </p>
                {i < CHECKOUT_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 transition-all ${
                    currentStep > step.id ? 'bg-brand' : 'bg-borderline'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            {cartError && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                {cartError}
              </div>
            )}
            {currentStep === 1 && <CartStep cart={cart} updateQuantity={updateQuantity} removeItem={removeItem} setStep={setCurrentStep} />}
            {currentStep === 2 && (
              <ShippingStep
                setStep={setCurrentStep}
                appliedCoupon={appliedCoupon}
                setCartError={setCartError}
              />
            )}
            {currentStep === 3 && <PaymentStep setStep={setCurrentStep} />}
            {currentStep === 4 && <ConfirmationStep />}
          </div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1">
            <div className="bg-white border border-borderline rounded-xl p-6 sticky top-32">
              <h3 className="font-black text-ink mb-6 uppercase tracking-wide">Order Summary</h3>

              {/* Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-borderline">
                {cart.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-semibold text-ink">{item.producto_nombre}</p>
                      <p className="text-xs text-ink2">Qty: {item.cantidad}</p>
                    </div>
                    <p className="font-bold text-ink">${(item.precio_unitario * item.cantidad).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-ink2">Subtotal</span>
                  <span className="text-ink font-semibold">${subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Discount ({appliedCoupon?.codigo})</span>
                    <span className="font-semibold">-${discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-ink2">Tax (19%)</span>
                  <span className="text-ink font-semibold">${tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-black border-t border-borderline pt-3">
                  <span className="text-ink">Total</span>
                  <span className="text-brand">${orderTotal.toLocaleString()}</span>
                </div>

                {/* Coupon */}
                <div className="border-t border-borderline pt-4 mt-4">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-ink2 mb-2">
                    Coupon code
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 text-sm text-green-800">
                        <Tag className="w-4 h-4" />
                        <span className="font-bold tracking-wider">{appliedCoupon.codigo}</span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="p-1 text-green-700 hover:text-green-900"
                        title="Remove coupon"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyCoupon())}
                          placeholder="Enter your coupon here"
                          className="flex-1 px-3 py-2 border border-borderline rounded-lg text-sm uppercase focus:outline-none focus:border-brand"
                        />
                        <button
                          type="button"
                          onClick={applyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-4 py-2 bg-ink text-white rounded-lg text-sm font-bold hover:bg-ink/90 disabled:opacity-50"
                        >
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-red-600 font-semibold">{couponError}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function CartStep({ cart, updateQuantity, removeItem, setStep }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}>
      <div className="bg-white rounded-xl border border-borderline overflow-hidden">
        <div className="p-6 border-b border-borderline">
          <h2 className="text-2xl font-black text-ink">Your Cart</h2>
        </div>

        {/* Cart Items */}
        <div className="divide-y divide-borderline">
          {cart.items.map(item => (
            <div key={item.id} className="p-6 flex gap-6">
              {/* Image */}
              <div className="relative w-24 h-24 bg-bg2 rounded-lg flex-shrink-0 overflow-hidden">
                {item.producto_imagen && (
                  <Image src={item.producto_imagen} alt={item.producto_nombre || ''} fill className="object-cover" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1">
                <h3 className="font-bold text-ink text-lg">{item.producto_nombre}</h3>
                <p className="text-sm text-ink2 mb-4">{item.variante_nombre}</p>

                {/* Quantity Control */}
                <div className="flex items-center gap-3 w-fit bg-bg2 rounded-lg p-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                    className="p-1 hover:bg-white rounded transition">
                    <Minus className="w-4 h-4 text-ink2" />
                  </button>
                  <span className="w-8 text-center font-bold text-ink">{item.cantidad}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                    className="p-1 hover:bg-white rounded transition">
                    <Plus className="w-4 h-4 text-ink2" />
                  </button>
                </div>
              </div>

              {/* Price & Remove */}
              <div className="text-right">
                <p className="text-2xl font-black text-brand mb-4">
                  ${(item.precio_unitario * item.cantidad).toLocaleString()}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-700 transition flex items-center gap-1 text-sm font-semibold">
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="p-6 bg-bg2 flex justify-between items-center">
          <p className="text-sm text-ink2">
            {cart.cantidad_items} item{cart.cantidad_items !== 1 ? 's' : ''} in cart
          </p>
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-brand/90 transition">
            Continue to Shipping
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

const PHONE_REGEX = /^\+?[\d\s\-()]{7,20}$/
const POSTAL_CODE_REGEX = /^[a-zA-Z0-9\s-]{3,10}$/

function ShippingStep({ setStep, appliedCoupon, setCartError }) {
  const [formData, setFormData] = useState({
    nombre_destinatario: '',
    telefono: '',
    linea1: '',
    linea2: '',
    departamento_estado: '',
    ciudad: '',
    pais: '',
    codigo_postal: '',
    notas: ''
  })
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validate = (data) => {
    const errors = {}
    if (!PHONE_REGEX.test(data.telefono)) {
      errors.telefono = 'Please enter a valid phone number.'
    }
    if (!data.codigo_postal || !POSTAL_CODE_REGEX.test(data.codigo_postal)) {
      errors.codigo_postal = 'Please enter a valid postal code.'
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCartError('')

    const errors = validate(formData)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setCartError('Please correct the highlighted fields.')
      return
    }

    sessionStorage.setItem('shipping_address', JSON.stringify(formData))
    try {
      const direccion = await api.usuarios.crearDireccion({
        nombre_destinatario: formData.nombre_destinatario,
        telefono: formData.telefono || null,
        linea1: formData.linea1,
        linea2: formData.linea2 || null,
        ciudad: formData.ciudad,
        departamento_estado: formData.departamento_estado,
        codigo_postal: formData.codigo_postal || null,
        pais: formData.pais || 'US',
        es_principal: false,
      })

      const res = await api.ordenes.crear({
        direccion_envio_id: direccion.id,
        notas_cliente: formData.notas || null,
        moneda: 'USD',
        codigo_cupon: appliedCoupon?.codigo || null,
      })

      sessionStorage.setItem('current_order_id', res.id)
      setStep(3)
    } catch (err) {
      console.error('Error creating order:', err)
      setCartError(err.detail || 'Error creating order. Please try again.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}>
      <div className="bg-white rounded-xl border border-borderline p-6">
        <h2 className="text-2xl font-black text-ink mb-6">Shipping Address</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Recipient Name</label>
              <input
                type="text"
                name="nombre_destinatario"
                value={formData.nombre_destinatario}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">Phone</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-brand ${fieldErrors.telefono ? 'border-red-500' : 'border-borderline'}`}
            />
            {fieldErrors.telefono && <p className="text-xs text-red-600 font-semibold mt-1">{fieldErrors.telefono}</p>}
          </div>

          {/* Street */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Address Line 1</label>
              <input
                type="text"
                name="linea1"
                value={formData.linea1}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Address Line 2 (Optional)</label>
              <input
                type="text"
                name="linea2"
                value={formData.linea2}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Department / State</label>
              <input
                type="text"
                name="departamento_estado"
                value={formData.departamento_estado}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* City */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">City</label>
              <input
                type="text"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Country & Postal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Country</label>
              <input
                type="text"
                name="pais"
                value={formData.pais}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Postal Code</label>
              <input
                type="text"
                name="codigo_postal"
                value={formData.codigo_postal}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-brand ${fieldErrors.codigo_postal ? 'border-red-500' : 'border-borderline'}`}
              />
              {fieldErrors.codigo_postal && <p className="text-xs text-red-600 font-semibold mt-1">{fieldErrors.codigo_postal}</p>}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">Additional Notes (Optional)</label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 px-6 py-3 border-2 border-borderline text-ink rounded-lg font-bold uppercase hover:border-brand transition">
              Back
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-brand text-white px-6 py-3 rounded-lg font-bold uppercase hover:bg-brand/90 transition">
              Continue to Payment
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

function PaymentStep({ setStep }) {
  const [paymentMethod, setPaymentMethod] = useState('wompi')
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      if (!token) {
        // require login
        window.location.href = '/login'
        return
      }
      const ordenId = sessionStorage.getItem('current_order_id')
      if (!ordenId) throw new Error('Orden ID missing')

      const res = await api.pagos.checkout({ orden_id: ordenId })
      // If Stripe returned a checkout redirect URL, go there
      if (res && res.checkout_url) {
        window.location.href = res.checkout_url
        return
      }
      // If immediate success
      if (res && res.estado === 'approved') {
        window.location.href = '/checkout/exito'
        return
      }
      // fallback to result page
      window.location.href = '/checkout/resultado'
    } catch (err) {
      console.error('Payment error:', err)
      alert('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}>
      <div className="bg-white rounded-xl border border-borderline p-6">
        <h2 className="text-2xl font-black text-ink mb-6">Payment Method</h2>

        <div className="space-y-4 mb-8">
          {[
            { id: 'wompi', name: 'Wompi', desc: 'Credit/Debit Card' },
            { id: 'transfer', name: 'Bank Transfer', desc: 'Direct transfer' },
          ].map(method => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`w-full p-6 rounded-lg border-2 transition-all text-left
                ${paymentMethod === method.id
                  ? 'border-brand bg-brand-soft'
                  : 'border-borderline hover:border-brand/50'
                }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-ink">{method.name}</p>
                  <p className="text-sm text-ink2">{method.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${paymentMethod === method.id ? 'border-brand bg-brand' : 'border-borderline'}`}>
                  {paymentMethod === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Payment Info */}
        <div className="bg-bg2 rounded-lg p-6 mb-8">
          <p className="text-sm text-ink2 mb-4">
            {paymentMethod === 'wompi'
              ? 'You will be redirected to Wompi to complete your payment securely.'
              : 'Bank transfer details will be provided after order confirmation.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => window.history.back()}
            className="flex-1 px-6 py-3 border-2 border-borderline text-ink rounded-lg font-bold uppercase hover:border-brand transition">
            Back
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-brand text-white px-6 py-3 rounded-lg font-bold uppercase hover:bg-brand/90 disabled:opacity-50 transition">
            {loading ? 'Processing...' : 'Confirm & Pay'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function ConfirmationStep() {
  const [orderNumber, setOrderNumber] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const orderId = typeof window !== 'undefined' ? sessionStorage.getItem('current_order_id') : null
    if (!orderId) {
      setLoading(false)
      return
    }
    api.ordenes.detalle(orderId)
      .then((orden) => {
        setOrderNumber(orden?.numero_orden || orden?.id || orderId)
      })
      .catch((err) => {
        console.error('Error fetching order:', err)
        setOrderNumber(orderId)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}>
      <div className="bg-white rounded-xl border border-borderline p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
          </svg>
        </div>

        <h2 className="text-3xl font-black text-ink mb-2">Order Confirmed!</h2>
        <p className="text-ink2 mb-6">Thank you for your purchase. Your order has been received.</p>

        <div className="bg-bg2 rounded-lg p-6 mb-8">
          <p className="text-sm text-ink2 mb-2">Order Number</p>
          <p className="text-3xl font-black text-brand">{loading ? '...' : (orderNumber || 'N/A')}</p>
        </div>

        <p className="text-sm text-ink2 mb-8">
          A confirmation email has been sent to your email address with tracking information and estimated delivery date.
        </p>

        <div className="flex gap-4">
          <Link href="/" className="flex-1 px-6 py-3 border-2 border-borderline text-ink rounded-lg font-bold uppercase hover:border-brand transition">
            Continue Shopping
          </Link>
          <Link href="/orders" className="flex-1 px-6 py-3 bg-brand text-white rounded-lg font-bold uppercase hover:bg-brand/90 transition">
            View Orders
          </Link>
        </div>
      </div>
    </motion.div>
  )
}