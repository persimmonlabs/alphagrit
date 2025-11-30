'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function LangError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const params = useParams()
  const lang = (params?.lang as string) || 'en'
  const isPt = lang === 'pt'

  useEffect(() => {
    console.error('[Page Error]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold">
          {isPt ? 'Algo deu errado' : 'Something went wrong'}
        </h1>

        <p className="text-gray-400">
          {isPt
            ? 'Encontramos um erro inesperado. Por favor, tente novamente ou volte para a página inicial.'
            : 'We encountered an unexpected error. Please try again or return to the home page.'}
        </p>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-left">
            <p className="text-sm text-red-400 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            {isPt ? 'Tentar novamente' : 'Try again'}
          </button>

          <Link
            href={`/${lang}`}
            className="px-6 py-3 border border-gray-700 hover:border-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            {isPt ? 'Ir para início' : 'Go home'}
          </Link>
        </div>
      </div>
    </div>
  )
}
