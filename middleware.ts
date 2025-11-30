import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n } from './i18n-config'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { updateSession, checkAdminAccess } from '@/lib/supabase/middleware'

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  // @ts-ignore
  let languages = new Negotiator({ headers: negotiatorHeaders }).languages()

  // Filter out invalid locales and wildcards
  languages = languages.filter((lang: string) => lang !== '*' && /^[a-z]{2}(-[A-Z]{2})?$/.test(lang))

  // If no valid languages, return default
  if (languages.length === 0) {
    return i18n.defaultLocale
  }

  try {
    return matchLocale(languages, i18n.locales, i18n.defaultLocale)
  } catch (error) {
    return i18n.defaultLocale
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip Supabase for static assets
  const isStaticAsset = pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    return checkAdminAccess(request)
  }

  // Update Supabase session for all other routes
  if (!isStaticAsset) {
    const { response } = await updateSession(request)

    // Handle locale redirect
    const pathnameIsMissingLocale = i18n.locales.every(
      (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    )

    if (pathnameIsMissingLocale) {
      const locale = getLocale(request)
      return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url))
    }

    return response
  }

  // Locale redirect for paths without locale
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url))
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
