export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl text-center p-8">
        <h1 className="text-4xl font-black text-brand mb-4">Purchase Successful</h1>
        <p className="text-ink2 mb-6">Thank you! Your payment was processed successfully.</p>
        <a href="/" className="inline-block bg-brand text-white px-6 py-3 rounded-lg">Continue Shopping</a>
      </div>
    </div>
  )
}
