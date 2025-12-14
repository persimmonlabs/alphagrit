'use client'

import { useState } from 'react'
import { Crown, Loader2, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BuyButtonProps {
  lang: string
  hasSubscription?: boolean
}

const PLANS = {
  monthly: {
    en: { price: '$15', period: '/month', label: 'Monthly' },
    pt: { price: 'R$75', period: '/mês', label: 'Mensal' },
  },
  yearly: {
    en: { price: '$120', period: '/year', label: 'Yearly', savings: 'Save $60' },
    pt: { price: 'R$600', period: '/ano', label: 'Anual', savings: 'Economize R$300' },
  },
}

export function BuyButton({
  lang,
  hasSubscription = false,
}: BuyButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [error, setError] = useState<string | null>(null)

  const currency = lang === 'pt' ? 'BRL' : 'USD'
  const locale = lang === 'pt' ? 'pt' : 'en'

  const handleSubscribe = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subscription',
          planType: selectedPlan,
          currency,
          lang: locale,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          // User not logged in - redirect to login with return URL
          const returnUrl = encodeURIComponent(window.location.pathname)
          router.push(`/${lang}/auth/login?redirect=${returnUrl}`)
          return
        }
        throw new Error(data.message || 'Checkout failed')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err: any) {
      setError(err.message || (lang === 'pt' ? 'Erro ao processar. Tente novamente.' : 'Error processing. Please try again.'))
      setLoading(false)
    }
  }

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

  const monthlyPlan = PLANS.monthly[locale]
  const yearlyPlan = PLANS.yearly[locale]

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setSelectedPlan('yearly')}
          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
            selectedPlan === 'yearly'
              ? 'border-orange-500 bg-orange-500/10'
              : 'border-border hover:border-muted-foreground/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{yearlyPlan.label}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">
                  {yearlyPlan.savings}
                </span>
              </div>
              <div className="text-lg font-bold text-foreground">
                {yearlyPlan.price}<span className="text-sm font-normal text-muted-foreground">{yearlyPlan.period}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {lang === 'pt' ? '= R$50/mês' : '= $10/month'}
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selectedPlan === 'yearly' ? 'border-orange-500 bg-orange-500' : 'border-muted-foreground'
            }`}>
              {selectedPlan === 'yearly' && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedPlan('monthly')}
          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
            selectedPlan === 'monthly'
              ? 'border-orange-500 bg-orange-500/10'
              : 'border-border hover:border-muted-foreground/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-foreground">{monthlyPlan.label}</span>
              <div className="text-lg font-bold text-foreground">
                {monthlyPlan.price}<span className="text-sm font-normal text-muted-foreground">{monthlyPlan.period}</span>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selectedPlan === 'monthly' ? 'border-orange-500 bg-orange-500' : 'border-muted-foreground'
            }`}>
              {selectedPlan === 'monthly' && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Crown className="w-5 h-5" />
        )}
        {lang === 'pt' ? 'Assinar Agora' : 'Subscribe Now'}
      </button>

      <p className="text-xs text-center text-muted-foreground">
        {lang === 'pt'
          ? 'Acesso ilimitado a todos os e-books. Cancele quando quiser.'
          : 'Unlimited access to all ebooks. Cancel anytime.'}
      </p>
    </div>
  )
}
