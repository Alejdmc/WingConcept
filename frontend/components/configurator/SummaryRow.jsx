export default function SummaryRow({ label, value, price, priceLabel }) {
  return (
    <div className="flex justify-between items-start gap-3 py-1 border-b border-borderline/60">
      <span className="text-ink2 min-w-0 pr-2 break-words">{value ? `${label} — ${value}` : label}</span>
      {priceLabel ? (
        <span className="font-semibold text-ink">{priceLabel}</span>
      ) : typeof price === 'number' ? (
        <span className="font-semibold text-ink">{price === 0 ? 'Included' : `+$${price.toLocaleString()}`}</span>
      ) : null}
    </div>
  )
}
