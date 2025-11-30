import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPortalSession } from '@/lib/stripe'

// Error codes for client handling
const ERROR_CODES = {
  STRIPE_NOT_CONFIGURED: 'STRIPE_NOT_CONFIGURED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NO_BILLING_ACCOUNT: 'NO_BILLING_ACCOUNT',
  DATABASE_ERROR: 'DATABASE_ERROR',
  STRIPE_ERROR: 'STRIPE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

// User-friendly error messages
const USER_MESSAGES: Record<string, Record<string, string>> = {
  en: {
    STRIPE_NOT_CONFIGURED: 'Billing portal is not available yet.',
    UNAUTHORIZED: 'Please log in to manage your subscription.',
    NO_BILLING_ACCOUNT: 'No billing account found. Please contact support.',
    DATABASE_ERROR: 'Unable to load your billing information.',
    STRIPE_ERROR: 'Billing service error. Please try again.',
    INTERNAL_ERROR: 'Something went wrong. Please try again later.',
  },
  pt: {
    STRIPE_NOT_CONFIGURED: 'Portal de cobrança ainda não está disponível.',
    UNAUTHORIZED: 'Faça login para gerenciar sua assinatura.',
    NO_BILLING_ACCOUNT: 'Conta de cobrança não encontrada. Entre em contato com o suporte.',
    DATABASE_ERROR: 'Não foi possível carregar suas informações de cobrança.',
    STRIPE_ERROR: 'Erro no serviço de cobrança. Tente novamente.',
    INTERNAL_ERROR: 'Algo deu errado. Tente novamente mais tarde.',
  },
}

function createErrorResponse(
  code: keyof typeof ERROR_CODES,
  status: number,
  lang: string = 'en',
  devMessage?: string
) {
  const userMessage = USER_MESSAGES[lang]?.[code] || USER_MESSAGES.en[code]

  return NextResponse.json(
    {
      error: code,
      message: userMessage,
      ...(process.env.NODE_ENV === 'development' && devMessage ? { dev: devMessage } : {}),
    },
    { status }
  )
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID()
  let lang = 'en'

  try {
    // Parse body for language and return URL
    let body: { returnUrl?: string; lang?: string } = {}
    try {
      body = await request.json()
      lang = body.lang || 'en'
    } catch {
      // Body is optional for this endpoint
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn(`[Portal ${requestId}] Stripe not configured`)
      return createErrorResponse('STRIPE_NOT_CONFIGURED', 503, lang)
    }

    // Authenticate user
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error(`[Portal ${requestId}] Auth error:`, authError.message)
      return createErrorResponse('UNAUTHORIZED', 401, lang, authError.message)
    }

    if (!user) {
      console.info(`[Portal ${requestId}] Unauthenticated portal access attempt`)
      return createErrorResponse('UNAUTHORIZED', 401, lang)
    }

    // Get user profile with Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error(`[Portal ${requestId}] Profile fetch error:`, profileError)
      return createErrorResponse('DATABASE_ERROR', 500, lang, profileError.message)
    }

    if (!profile?.stripe_customer_id) {
      console.warn(`[Portal ${requestId}] No Stripe customer ID for user ${user.id}`)
      return createErrorResponse('NO_BILLING_ACCOUNT', 400, lang)
    }

    // Create portal session
    try {
      const returnUrl = body.returnUrl || request.headers.get('origin') || ''
      const session = await createPortalSession(profile.stripe_customer_id, returnUrl)

      console.info(`[Portal ${requestId}] Portal session created for user ${user.id}`)
      return NextResponse.json({ url: session.url })
    } catch (error: any) {
      console.error(`[Portal ${requestId}] Stripe portal error:`, error)
      return createErrorResponse('STRIPE_ERROR', 500, lang, error.message)
    }
  } catch (error: any) {
    console.error(`[Portal ${requestId}] Unhandled error:`, error)
    return createErrorResponse('INTERNAL_ERROR', 500, lang, error.message)
  }
}
