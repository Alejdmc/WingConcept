'use client'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CartPage() {
  const { items, removeFromCart, total } = useCart()

  return (
    <div className="min-h-screen bg-bg px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-brand mb-8 hover:text-brand/80">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <h1 className="text-5xl font-black uppercase mb-12">Shopping Cart</h1>

        {items.length === 0 ? (
          <p className="text-ink2 text-lg">Your cart is empty</p>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {items.map(item => (
                <div key={item.cartId} className="flex justify-between items-center border-b border-borderline pb-4">
                  <div>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-ink2">{item.price}</p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.cartId)}
                    className="text-red-500 hover:text-red-700 font-bold">
                    Remove
                  </button>
                </div>
              ))}
            </div>
            
            <div className="text-2xl font-bold mb-8">
              Total: ${total.toLocaleString()}
            </div>
            
            <Link href="/checkout" className="inline-block bg-brand text-white px-8 py-4 font-bold uppercase rounded hover:bg-brand/90 transition-all">
              Proceed to Checkout
            </Link>
          </>
        )}
      </div>
    </div>
  )
}