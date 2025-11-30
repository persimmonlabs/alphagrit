import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton for client-side usage
let client: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!client) {
    client = createClient()
  }
  return client
}

// Types for our database
export type UserRole = 'user' | 'admin'

export interface Profile {
  id: string
  full_name: string | null
  role: UserRole
  preferred_language: 'en' | 'pt'
  preferred_currency: 'USD' | 'BRL'
  stripe_customer_id: string | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string
  plan_type: 'monthly' | 'yearly'
  status: 'active' | 'canceled' | 'past_due'
  current_period_end: string
  created_at: string
}

export interface Purchase {
  id: string
  user_id: string
  sanity_ebook_id: string
  stripe_payment_intent_id: string | null
  amount_paid: number
  currency: 'USD' | 'BRL'
  created_at: string
}

export interface ReadingProgress {
  id: string
  user_id: string
  sanity_ebook_id: string
  last_chapter_slug: string | null
  completion_percentage: number
  updated_at: string
}
