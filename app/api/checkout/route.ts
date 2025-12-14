import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getOrCreateCustomer,
  createSubscriptionCheckoutSession,
} from '@/lib/stripe'

// Error codes for client handling
const ERROR_CODES = {
  STRIPE_NOT_CONFIGURED: 'STRIPE_NOT_CONFIGURED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_REQUEST: 'INVALID_REQUEST',
  STRIPE_ERROR: 'STRIPE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

// User-friendly error messages
const USER_MESSAGES: Record<string, Record<string, string>> = {
  en: {
    STRIPE_NOT_CONFIGURED: 'Payments are not available yet. Please try again later.',
    UNAUTHORIZED: 'Please log in to continue.',
    INVALID_REQUEST: 'Invalid request. Please refresh and try again.',
    STRIPE_ERROR: 'Payment service error. Please try again.',
    DATABASE_ERROR: 'Unable to process request. Please try again.',
    INTERNAL_ERROR: 'Something went wrong. Please try again later.',
  },
  pt: {
    STRIPE_NOT_CONFIGURED: 'Pagamentos ainda não estão disponíveis. Tente novamente mais tarde.',
    UNAUTHORIZED: 'Faça login para continuar.',
    INVALID_REQUEST: 'Requisição inválida. Atualize a página e tente novamente.',
    STRIPE_ERROR: 'Erro no serviço de pagamento. Tente novamente.',
    DATABASE_ERROR: 'Não foi possível processar a requisição. Tente novamente.',
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
    // Parse body first to get language
    let body: any
    try {
      body = await request.json()
      lang = body.lang || 'en'
    } catch {
      console.error(`[${requestId}] Failed to parse request body`)
      return createErrorResponse('INVALID_REQUEST', 400, lang, 'Invalid JSON body')
    }

    const { type, currency = 'USD' } = body

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn(`[${requestId}] Stripe not configured - STRIPE_SECRET_KEY missing`)
      return createErrorResponse('STRIPE_NOT_CONFIGURED', 503, lang)
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error(`[${requestId}] Supabase not configured`)
      return createErrorResponse('INTERNAL_ERROR', 503, lang, 'Supabase not configured')
    }

    // Authenticate user
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error(`[${requestId}] Auth error:`, authError.message)
      return createErrorResponse('UNAUTHORIZED', 401, lang, authError.message)
    }

    if (!user) {
      console.info(`[${requestId}] Unauthenticated checkout attempt`)
      return createErrorResponse('UNAUTHORIZED', 401, lang)
    }

    // Validate request type (subscription-only model)
    if (!type || type !== 'subscription') {
      console.warn(`[${requestId}] Invalid checkout type: ${type}`)
      return createErrorResponse('INVALID_REQUEST', 400, lang, `Invalid type: ${type}. Only subscriptions are supported.`)
    }

    // Validate currency
    if (!['USD', 'BRL'].includes(currency)) {
      console.warn(`[${requestId}] Invalid currency: ${currency}`)
      return createErrorResponse('INVALID_REQUEST', 400, lang, `Invalid currency: ${currency}`)
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error(`[${requestId}] Profile fetch error:`, profileError)
      return createErrorResponse('DATABASE_ERROR', 500, lang, profileError.message)
    }

    // Get or create Stripe customer
    let customerId: string
    try {
      customerId = await getOrCreateCustomer(
        user.id,
        user.email!,
        profile?.stripe_customer_id
      )
    } catch (error: any) {
      console.error(`[${requestId}] Stripe customer error:`, error)
      return createErrorResponse('STRIPE_ERROR', 500, lang, error.message)
    }

    // Update profile with customer ID if new
    if (!profile?.stripe_customer_id && customerId) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)

      if (updateError) {
        console.warn(`[${requestId}] Failed to save customer ID:`, updateError)
        // Non-fatal, continue
      }
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || ''

    // Subscription-only checkout
    const { planType } = body

    if (!planType || !['monthly', 'yearly'].includes(planType)) {
      console.warn(`[${requestId}] Invalid plan type: ${planType}`)
      return createErrorResponse('INVALID_REQUEST', 400, lang, `Invalid planType: ${planType}`)
    }

    try {
      const session = await createSubscriptionCheckoutSession({
        planType,
        userId: user.id,
        customerId,
        currency: currency as 'USD' | 'BRL',
        successUrl: `${origin}/${lang}/dashboard?success=subscription`,
        cancelUrl: `${origin}/${lang}/ebooks?canceled=true`,
      })

      console.info(`[${requestId}] Subscription checkout created for user ${user.id}`)
      return NextResponse.json({ url: session.url })
    } catch (error: any) {
      console.error(`[${requestId}] Subscription checkout error:`, error)
      return createErrorResponse('STRIPE_ERROR', 500, lang, error.message)
    }
  } catch (error: any) {
    console.error(`[${requestId}] Unhandled checkout error:`, error)
    return createErrorResponse('INTERNAL_ERROR', 500, lang, error.message)
  }
}
