export default function CancelledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl text-center p-8">
        <h1 className="text-4xl font-black text-red-600 mb-4">Payment Cancelled</h1>
        <p className="text-ink2 mb-6">Your payment was cancelled. You can try again or contact support.</p>
        <a href="/checkout" className="inline-block bg-borderline text-ink px-6 py-3 rounded-lg">Back to Checkout</a>
      </div>
    </div>
  )
}
