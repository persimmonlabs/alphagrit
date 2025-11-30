import Link from 'next/link'

// Note: Next.js doesn't pass params to not-found pages, so we default to English
// Users will see the correct language-specific content when using the navigation
export default function LangNotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-orange-500/10 rounded-full flex items-center justify-center">
          <span className="text-4xl font-bold text-orange-500">404</span>
        </div>

        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="text-gray-500">Página não encontrada</p>

        <p className="text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/en"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            English Home
          </Link>

          <Link
            href="/pt"
            className="px-6 py-3 border border-gray-700 hover:border-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            Início em Português
          </Link>
        </div>
      </div>
    </div>
  )
}
