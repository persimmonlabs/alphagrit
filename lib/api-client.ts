/**
 * @deprecated This API client is deprecated.
 *
 * The application now uses:
 * - Sanity CMS for content (ebooks, blog posts)
 * - Supabase for auth, purchases, and subscriptions
 * - Stripe for payments
 *
 * Do not use this client in new code.
 */

'use client'

export const apiClient = {
  get: async <T>(_endpoint: string): Promise<T> => {
    throw new Error('apiClient is deprecated. Use Sanity or Supabase instead.')
  },
  post: async <T>(_endpoint: string, _data: unknown): Promise<T> => {
    throw new Error('apiClient is deprecated. Use Sanity or Supabase instead.')
  },
  put: async <T>(_endpoint: string, _data: unknown): Promise<T> => {
    throw new Error('apiClient is deprecated. Use Sanity or Supabase instead.')
  },
  patch: async <T>(_endpoint: string, _data: unknown): Promise<T> => {
    throw new Error('apiClient is deprecated. Use Sanity or Supabase instead.')
  },
  delete: async <T>(_endpoint: string): Promise<T> => {
    throw new Error('apiClient is deprecated. Use Sanity or Supabase instead.')
  },
}
