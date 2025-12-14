'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Check, X } from 'lucide-react'

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

  // Password validation
  const passwordChecks = useMemo(() => ({
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'`~]/.test(password),
  }), [password])

  const isPasswordValid = Object.values(passwordChecks).every(Boolean)

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-xs ${met ? 'text-green-500' : 'text-gray-500'}`}>
      {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      <span>{text}</span>
    </div>
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isPasswordValid) {
      setError(isPt ? 'Por favor, atenda todos os requisitos da senha.' : 'Please meet all password requirements.')
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
          <Link href={`/${lang}`} className="inline-block mb-6 font-heading font-bold text-xl tracking-tighter hover:opacity-70 transition-opacity">
            ALPHAGRIT
          </Link>
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
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="mt-3 space-y-1.5 p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-2">
                {isPt ? 'Requisitos da senha:' : 'Password requirements:'}
              </p>
              <PasswordRequirement
                met={passwordChecks.minLength}
                text={isPt ? 'Mínimo 8 caracteres' : 'At least 8 characters'}
              />
              <PasswordRequirement
                met={passwordChecks.hasUppercase}
                text={isPt ? 'Uma letra maiúscula (A-Z)' : 'One uppercase letter (A-Z)'}
              />
              <PasswordRequirement
                met={passwordChecks.hasLowercase}
                text={isPt ? 'Uma letra minúscula (a-z)' : 'One lowercase letter (a-z)'}
              />
              <PasswordRequirement
                met={passwordChecks.hasDigit}
                text={isPt ? 'Um número (0-9)' : 'One number (0-9)'}
              />
              <PasswordRequirement
                met={passwordChecks.hasSpecial}
                text={isPt ? 'Um caractere especial (!@#$%...)' : 'One special character (!@#$%...)'}
              />
            </div>
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
            disabled={loading || !isPasswordValid}
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
