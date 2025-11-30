/**
 * @deprecated This server API client is deprecated.
 *
 * The application now uses:
 * - Sanity CMS for content (ebooks, blog posts) via lib/sanity/queries.ts
 * - Supabase for auth, purchases, and subscriptions
 * - Stripe for payments
 *
 * Do not use this client in new code.
 */

'use server'

export const serverApiClient = async <T>(_endpoint: string): Promise<T> => {
  throw new Error('serverApiClient is deprecated. Use Sanity queries or Supabase instead.')
}
