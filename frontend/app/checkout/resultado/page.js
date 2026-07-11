export default function ResultPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl text-center p-8">
        <h1 className="text-4xl font-black text-ink mb-4">Payment Result</h1>
        <p className="text-ink2 mb-6">We are processing your payment. Check your email for updates or contact support.</p>
        <a href="/" className="inline-block bg-brand text-white px-6 py-3 rounded-lg">Home</a>
      </div>
    </div>
  )
}
