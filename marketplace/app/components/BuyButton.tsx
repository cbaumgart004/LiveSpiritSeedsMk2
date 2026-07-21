'use client'
import { useState } from 'react'

// Starts a Stripe Checkout session for a single product and redirects to it.
export default function BuyButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function buy() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url as string
        return
      }
      setError(data.error || 'Checkout is unavailable right now.')
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div>
      <button onClick={buy} disabled={loading} className="brand-btn px-6 py-3 font-medium">
        {loading ? 'Redirecting…' : 'Buy now'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
