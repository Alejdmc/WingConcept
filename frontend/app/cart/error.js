'use client'

import { useEffect } from 'react'

export default function CartError({ error, reset }) {
  useEffect(() => {
    console.error('Cart page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-bg px-8 py-12 flex items-center justify-center">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-black text-ink mb-3">Could not load cart</h1>
        <p className="text-ink2 mb-8">
          Something went wrong displaying your cart. Your items may still be saved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="bg-brand text-white px-6 py-3 font-bold uppercase rounded-lg hover:bg-brand/90 transition"
          >
            Try again
          </button>
          <a
            href="/"
            className="border border-borderline text-ink px-6 py-3 font-bold uppercase rounded-lg hover:bg-bg2 transition"
          >
            Continue shopping
          </a>
        </div>
      </div>
    </div>
  )
}
