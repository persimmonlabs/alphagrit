'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage({
  params: { lang },
  searchParams,
}: {
  params: { lang: string }
  searchParams: { redirect?: string }
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Check if user is admin
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      // Redirect admin to admin panel, regular users to dashboard
      if (profile?.role === 'admin') {
        router.push('/admin')
      } else {
        const redirectTo = searchParams.redirect || `/${lang}/dashboard`
        router.push(redirectTo)
      }
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">
            {lang === 'pt' ? 'Entrar' : 'Sign In'}
          </h1>
          <p className="mt-2 text-gray-400">
            {lang === 'pt'
              ? 'Entre na sua conta para continuar'
              : 'Sign in to your account to continue'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
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
                {lang === 'pt' ? 'Senha' : 'Password'}
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
            </div>
            <div className="text-right">
              <Link
                href={`/${lang}/auth/reset-password`}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {lang === 'pt' ? 'Esqueceu a senha?' : 'Forgot password?'}
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading
              ? (lang === 'pt' ? 'Entrando...' : 'Signing in...')
              : (lang === 'pt' ? 'Entrar' : 'Sign In')}
          </Button>
        </form>

        <p className="text-center text-gray-400">
          {lang === 'pt' ? 'Não tem uma conta?' : "Don't have an account?"}{' '}
          <Link
            href={`/${lang}/auth/signup${searchParams.redirect ? `?redirect=${encodeURIComponent(searchParams.redirect)}` : ''}`}
            className="text-orange-500 hover:text-orange-400"
          >
            {lang === 'pt' ? 'Criar conta' : 'Sign Up'}
          </Link>
        </p>
      </div>
    </div>
  )
}
