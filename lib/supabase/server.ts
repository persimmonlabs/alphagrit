import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const cookieStore = cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Server Components have read-only cookies - this is expected behavior
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Server Components have read-only cookies - this is expected behavior
          }
        },
      },
    }
  )
}

// Get current user on the server
export async function getUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

// Get user profile with role
export async function getProfile() {
  const supabase = createClient()
  const user = await getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

// Check if user is admin
export async function isAdmin() {
  const profile = await getProfile()
  return profile?.role === 'admin'
}

// Check if user has an active subscription
export async function hasActiveSubscription() {
  const supabase = createClient()
  const user = await getUser()
  if (!user) return false

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  return !!subscription
}

// Check if user has access to an ebook (SUBSCRIPTION-ONLY MODEL)
// All ebooks are accessible with an active subscription
// Chapter 1 is always free (handled separately in canAccessChapter)
export async function hasEbookAccess(ebookId: string) {
  return hasActiveSubscription()
}
