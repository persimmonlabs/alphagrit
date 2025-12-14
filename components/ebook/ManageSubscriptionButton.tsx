'use client'

import { useState } from 'react'
import { Settings, Loader2 } from 'lucide-react'

interface ManageSubscriptionButtonProps {
  lang: string
  returnUrl?: string
}

export function ManageSubscriptionButton({ lang, returnUrl }: ManageSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleManageSubscription = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang,
          returnUrl: returnUrl || window.location.href,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to open billing portal')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No portal URL received')
      }
    } catch (err: any) {
      setError(err.message || (lang === 'pt' ? 'Erro ao abrir portal.' : 'Error opening portal.'))
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleManageSubscription}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Settings className="w-4 h-4" />
        )}
        {lang === 'pt' ? 'Gerenciar Assinatura' : 'Manage Subscription'}
      </button>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
