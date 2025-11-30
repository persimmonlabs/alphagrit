'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const params = useParams()
  const lang = (params?.lang as string) || 'en'
  const isPt = lang === 'pt'

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError(isPt ? 'A senha deve ter pelo menos 6 caracteres.' : 'Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError(isPt ? 'As senhas não coincidem.' : 'Passwords do not match.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      setError(isPt ? 'Erro ao atualizar senha. Tente novamente.' : 'Failed to update password. Please try again.')
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push(`/${lang}/dashboard`)
      }, 2000)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">{isPt ? 'Senha atualizada!' : 'Password updated!'}</h1>
          <p className="text-muted-foreground">
            {isPt ? 'Redirecionando para o dashboard...' : 'Redirecting to dashboard...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{isPt ? 'Nova senha' : 'New password'}</h1>
          <p className="text-muted-foreground mt-2">
            {isPt ? 'Digite sua nova senha.' : 'Enter your new password.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              {isPt ? 'Nova senha' : 'New password'}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              {isPt ? 'Confirmar senha' : 'Confirm password'}
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading
              ? (isPt ? 'Atualizando...' : 'Updating...')
              : (isPt ? 'Atualizar senha' : 'Update password')}
          </button>
        </form>
      </div>
    </div>
  )
}
