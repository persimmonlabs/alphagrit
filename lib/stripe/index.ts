import Stripe from 'stripe'

// Lazy-loaded Stripe client to avoid build-time env var errors
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
    })
  }
  return _stripe
}

// Legacy export for backwards compatibility
export const stripe = {
  get customers() { return getStripe().customers },
  get checkout() { return getStripe().checkout },
  get subscriptions() { return getStripe().subscriptions },
  get billingPortal() { return getStripe().billingPortal },
  get webhooks() { return getStripe().webhooks },
}

// Price IDs for subscriptions (you'll set these in Stripe Dashboard)
// Monthly: $15/month, Yearly: $120/year ($10/month)
export const SUBSCRIPTION_PRICES = {
  monthly: {
    USD: process.env.STRIPE_MONTHLY_PRICE_USD, // $15/month
    BRL: process.env.STRIPE_MONTHLY_PRICE_BRL,
  },
  yearly: {
    USD: process.env.STRIPE_YEARLY_PRICE_USD, // $120/year
    BRL: process.env.STRIPE_YEARLY_PRICE_BRL,
  },
}

// Get or create Stripe customer for a user
export async function getOrCreateCustomer(
  userId: string,
  email: string,
  existingCustomerId?: string | null
): Promise<string> {
  if (existingCustomerId) {
    return existingCustomerId
  }

  const customer = await stripe.customers.create({
    email,
    metadata: {
      supabase_user_id: userId,
    },
  })

  return customer.id
}

// Create checkout session for subscription
export async function createSubscriptionCheckoutSession({
  planType,
  userId,
  customerId,
  currency,
  successUrl,
  cancelUrl,
}: {
  planType: 'monthly' | 'yearly'
  userId: string
  customerId: string
  currency: 'USD' | 'BRL'
  successUrl: string
  cancelUrl: string
}) {
  const priceId = SUBSCRIPTION_PRICES[planType][currency]

  if (!priceId) {
    throw new Error(`No price ID configured for ${planType} ${currency}`)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      user_id: userId,
      type: 'subscription',
      plan_type: planType,
      currency,
    },
  })

  return session
}

// Create customer portal session
export async function createPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}
