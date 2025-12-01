'use client'

import { useState } from 'react'
import { ShoppingCart, Loader2, Clock } from 'lucide-react'

interface BuyButtonProps {
  ebookId: string
  priceId?: string
  currency: string
  lang: string
  priceFormatted: string
}

export function BuyButton({
  ebookId,
  priceId,
  currency,
  lang,
  priceFormatted,
}: BuyButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // If no priceId, payments are not configured yet
  if (!priceId) {
    return (
      <div className="inline-flex flex-col items-start gap-2">
        <button
          disabled
          className="inline-flex items-center gap-2 px-6 py-3 bg-muted text-muted-foreground font-semibold rounded-lg cursor-not-allowed"
        >
          <Clock className="w-5 h-5" />
          {lang === 'pt' ? 'Em breve' : 'Coming soon'} - {priceFormatted}
        </button>
        <p className="text-sm text-muted-foreground">
          {lang === 'pt'
            ? 'Pagamentos serão habilitados em breve.'
            : 'Payments will be enabled soon.'}
        </p>
      </div>
    )
  }

  const handleBuy = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ebook',
          ebookId,
          priceId,
          currency,
          lang,
        }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        // If not logged in, redirect to login
        if (data.error === 'UNAUTHORIZED') {
          window.location.href = `/${lang}/auth/login?redirect=${window.location.pathname}`
        } else if (data.error === 'Stripe not configured') {
          setError(lang === 'pt'
            ? 'Pagamentos ainda não estão configurados.'
            : 'Payments are not configured yet.')
        } else {
          setError(data.error)
        }
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(lang === 'pt'
        ? 'Algo deu errado. Tente novamente.'
        : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <button
        onClick={handleBuy}
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ShoppingCart className="w-5 h-5" />
        )}
        {lang === 'pt' ? 'Comprar' : 'Buy now'} - {priceFormatted}
      </button>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
