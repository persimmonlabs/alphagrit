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

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/${lang}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-black px-2 text-gray-400">
                {isPt ? 'Ou continue com' : 'Or continue with'}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="w-full border border-gray-700"
            onClick={handleGoogleSignup}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
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
