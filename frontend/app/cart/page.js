'use client'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-bg px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-ink hover:text-brand transition mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-5xl font-black uppercase mb-8">Shopping Cart</h1>
          <p className="text-ink2 text-lg mb-8">Your cart is empty</p>
          <Link href="/" className="inline-block bg-brand text-white px-8 py-4 font-bold uppercase rounded hover:bg-brand/90">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  const subtotal = total
  const tax = Math.round(subtotal * 0.19)
  const finalTotal = subtotal + tax

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <Link href="/" className="flex items-center gap-2 text-ink hover:text-brand transition mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2">
            
            <div className="bg-white rounded-xl border border-borderline overflow-hidden">
              <div className="p-6 border-b border-borderline">
                <h1 className="text-3xl font-black text-ink">Shopping Cart</h1>
                <p className="text-sm text-ink2 mt-2">{items.length} item{items.length !== 1 ? 's' : ''}</p>
              </div>

              {/* Items */}
              <div className="divide-y divide-borderline">
                {items.map(item => (
                  <div key={item.cartId} className="p-6 flex gap-6">
                    <div className="w-24 h-24 bg-bg2 rounded-lg flex-shrink-0 relative overflow-hidden">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-bg2" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-ink text-lg">{item.name}</h3>
                      <p className="text-sm text-ink2 mb-4">{item.price}</p>
                      
                      <div className="flex items-center gap-3 w-fit bg-bg2 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.cartId, Math.max(1, (item.cantidad || 1) - 1))}
                          className="p-1 hover:bg-white rounded transition">
                          <Minus className="w-4 h-4 text-ink2" />
                        </button>
                        <span className="w-8 text-center font-bold text-ink">{item.cantidad || 1}</span>
                        <button
                          onClick={() => updateQuantity(item.cartId, (item.cantidad || 1) + 1)}
                          className="p-1 hover:bg-white rounded transition">
                          <Plus className="w-4 h-4 text-ink2" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-black text-brand mb-4">
                        ${(parseInt(item.price.replace('$', '').replace(',', '')) * (item.cantidad || 1)).toLocaleString()}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="text-red-600 hover:text-red-700 transition flex items-center gap-1 text-sm font-semibold">
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1">
            <div className="bg-white border border-borderline rounded-xl p-6 sticky top-32">
              <h3 className="font-black text-ink mb-6 uppercase tracking-wide">Order Summary</h3>

              <div className="space-y-3 mb-6 pb-6 border-b border-borderline">
                <div className="flex justify-between text-sm">
                  <span className="text-ink2">Subtotal</span>
                  <span className="text-ink font-semibold">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink2">Tax (19%)</span>
                  <span className="text-ink font-semibold">${tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-black">
                  <span className="text-ink">Total</span>
                  <span className="text-brand">${finalTotal.toLocaleString()}</span>
                </div>
              </div>

              <Link href="/checkout" className="w-full block text-center bg-brand text-white px-8 py-4 font-bold uppercase rounded-lg hover:bg-brand/90 transition">
                Proceed to Checkout
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}