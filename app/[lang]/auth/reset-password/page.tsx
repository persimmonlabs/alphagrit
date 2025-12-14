'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function ResetPasswordPage() {
  const params = useParams()
  const lang = (params?.lang as string) || 'en'
  const isPt = lang === 'pt'

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/${lang}/auth/update-password`,
    })

    setLoading(false)

    if (error) {
      setError(isPt ? 'Erro ao enviar email. Tente novamente.' : 'Failed to send email. Please try again.')
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">{isPt ? 'Email enviado!' : 'Email sent!'}</h1>
          <p className="text-muted-foreground">
            {isPt
              ? 'Verifique sua caixa de entrada e clique no link para redefinir sua senha.'
              : 'Check your inbox and click the link to reset your password.'}
          </p>
          <Link href={`/${lang}/auth/login`} className="text-primary hover:underline">
            {isPt ? 'Voltar para login' : 'Back to login'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href={`/${lang}`} className="inline-block mb-6 font-heading font-bold text-xl tracking-tighter hover:opacity-70 transition-opacity">
            ALPHAGRIT
          </Link>
          <h1 className="text-3xl font-bold">{isPt ? 'Redefinir senha' : 'Reset password'}</h1>
          <p className="text-muted-foreground mt-2">
            {isPt
              ? 'Digite seu email para receber um link de redefinição.'
              : 'Enter your email to receive a reset link.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={isPt ? 'seu@email.com' : 'your@email.com'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading
              ? (isPt ? 'Enviando...' : 'Sending...')
              : (isPt ? 'Enviar link' : 'Send reset link')}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link href={`/${lang}/auth/login`} className="text-primary hover:underline">
            {isPt ? 'Voltar para login' : 'Back to login'}
          </Link>
        </p>
      </div>
    </div>
  )
}
