'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, X } from 'lucide-react'

export default function SignupPage({
  params: { lang },
}: {
  params: { lang: string }
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const isPt = lang === 'pt'

  // Password validation
  const passwordChecks = useMemo(() => ({
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'`~]/.test(password),
  }), [password])

  const isPasswordValid = Object.values(passwordChecks).every(Boolean)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!isPasswordValid) {
      setError(isPt ? 'Por favor, atenda todos os requisitos da senha.' : 'Please meet all password requirements.')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          preferred_language: lang,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Auto sign-in after signup (no email confirmation required)
    if (data.user) {
      router.push(`/${lang}/dashboard`)
      router.refresh()
    }
  }

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-xs ${met ? 'text-green-500' : 'text-gray-500'}`}>
      {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      <span>{text}</span>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">
            {isPt ? 'Criar Conta' : 'Create Account'}
          </h1>
          <p className="mt-2 text-gray-400">
            {isPt
              ? 'Crie sua conta para começar'
              : 'Create your account to get started'}
          </p>
        </div>

        <form onSubmit={handleSignup} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">
                {isPt ? 'Nome completo' : 'Full name'}
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1"
                placeholder={isPt ? 'Seu nome' : 'Your name'}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <Label htmlFor="password">
                {isPt ? 'Senha' : 'Password'}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="••••••••"
              />
              <div className="mt-3 space-y-1.5 p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                <p className="text-xs text-gray-400 mb-2">
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
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !isPasswordValid}
          >
            {loading
              ? (isPt ? 'Criando conta...' : 'Creating account...')
              : (isPt ? 'Criar Conta' : 'Create Account')}
          </Button>
        </form>

        <p className="text-center text-gray-400">
          {isPt ? 'Já tem uma conta?' : 'Already have an account?'}{' '}
          <Link
            href={`/${lang}/auth/login`}
            className="text-orange-500 hover:text-orange-400"
          >
            {isPt ? 'Entrar' : 'Sign In'}
          </Link>
        </p>
      </div>
    </div>
  )
}
