'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, ArrowLeft, Trash2, Plus, Minus } from 'lucide-react'

const CHECKOUT_STEPS = [
  { id: 1, name: 'Cart', path: '/checkout' },
  { id: 2, name: 'Shipping', path: '/checkout/shipping' },
  { id: 3, name: 'Payment', path: '/checkout/payment' },
  { id: 4, name: 'Confirmation', path: '/checkout/confirmation' },
]

// Mock carrito data - reemplazar con API después
const MOCK_CART = {
  items: [
    {
      id: '1',
      producto_nombre: 'Vanguard V7.0',
      variante_nombre: 'Rotax 912',
      cantidad: 1,
      precio_unitario: 15000,
      imagen: '/images/vanguard_hero.png'
    },
  ],
  total: 15000,
  cantidad_items: 1
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState(MOCK_CART)
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    // Obtener carrito real del API después
    // const res = await api.carrito.obtener()
    // setCart(res)
  }, [])

  const subtotal = cart.total
  const tax = Math.round(subtotal * 0.19) // 19% IVA
  const total = subtotal + tax

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return
    setCart({
      ...cart,
      items: cart.items.map(item =>
        item.id === itemId
          ? { ...item, cantidad: newQuantity, subtotal: item.precio_unitario * newQuantity }
          : item
      ),
      total: cart.total
    })
  }

  const removeItem = (itemId) => {
    setCart({
      ...cart,
      items: cart.items.filter(item => item.id !== itemId),
      cantidad_items: cart.cantidad_items - 1
    })
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
            {currentStep === 1 && <CartStep cart={cart} updateQuantity={updateQuantity} removeItem={removeItem} setStep={setCurrentStep} />}
            {currentStep === 2 && <ShippingStep setStep={setCurrentStep} />}
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
                <div className="flex justify-between text-sm">
                  <span className="text-ink2">Tax (19%)</span>
                  <span className="text-ink font-semibold">${tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-black border-t border-borderline pt-3">
                  <span className="text-ink">Total</span>
                  <span className="text-brand">${total.toLocaleString()}</span>
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
              <div className="w-24 h-24 bg-bg2 rounded-lg flex-shrink-0" />

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

function ShippingStep({ setStep }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    calle: '',
    numero: '',
    apartamento: '',
    ciudad: '',
    pais: '',
    codigo_postal: '',
    notas: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Guardar dirección en sessionStorage o state
    sessionStorage.setItem('shipping_address', JSON.stringify(formData))
    setStep(3)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}>
      <div className="bg-white rounded-xl border border-borderline p-6">
        <h2 className="text-2xl font-black text-ink mb-6">Shipping Address</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">First Name</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Last Name</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
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
              className="w-full px-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand"
            />
          </div>

          {/* Street */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-ink mb-2">Street</label>
              <input
                type="text"
                name="calle"
                value={formData.calle}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Number</label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Apartment & City */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Apartment (Optional)</label>
              <input
                type="text"
                name="apartamento"
                value={formData.apartamento}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
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
          <div className="grid grid-cols-2 gap-4">
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
                className="w-full px-4 py-3 border border-borderline rounded-lg focus:outline-none focus:border-brand"
              />
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
    // Aquí iría la integración con Wompi
    // const res = await api.pagos.procesar({ ... })
    setTimeout(() => {
      setStep(4)
      setLoading(false)
    }, 1500)
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
  const orderId = Math.random().toString(36).substring(7).toUpperCase()

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
          <p className="text-3xl font-black text-brand">{orderId}</p>
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