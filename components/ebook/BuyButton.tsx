'use client'

import { useState } from 'react'
import { Crown, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BuyButtonProps {
  lang: string
  hasSubscription?: boolean
}

export function BuyButton({
  lang,
  hasSubscription = false,
}: BuyButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = () => {
    setLoading(true)
    // Redirect to subscription page or pricing page
    router.push(`/${lang}/ebooks#subscribe`)
  }

  // If user already has subscription
  if (hasSubscription) {
    return (
      <div className="inline-flex flex-col items-start gap-2">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 text-green-400 font-semibold rounded-lg border border-green-500/30">
          <Crown className="w-5 h-5" />
          {lang === 'pt' ? 'Você tem acesso completo' : 'You have full access'}
        </div>
      </div>
    )
  }

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Crown className="w-5 h-5" />
        )}
        {lang === 'pt' ? 'Assinar para Ler' : 'Subscribe to Read'}
      </button>
      <p className="text-sm text-muted-foreground">
        {lang === 'pt'
          ? 'A partir de $10/mês - Acesso a todos os e-books'
          : 'From $10/month - Access all ebooks'}
      </p>
    </div>
  )
}
