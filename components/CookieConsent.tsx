'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface CookieConsentProps {
  lang: string
}

export default function CookieConsent({ lang }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false)
  const isPt = lang === 'pt'

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setShowBanner(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t border-border shadow-lg">
      <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          {isPt
            ? 'Usamos cookies para melhorar sua experiência. Ao continuar, você concorda com nossa '
            : 'We use cookies to improve your experience. By continuing, you agree to our '}
          <Link href={`/${lang}/privacy`} className="text-primary hover:underline">
            {isPt ? 'Política de Privacidade' : 'Privacy Policy'}
          </Link>
          .
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
          >
            {isPt ? 'Recusar' : 'Decline'}
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            {isPt ? 'Aceitar' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  )
}
