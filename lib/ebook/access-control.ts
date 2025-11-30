import { createClient } from '@/lib/supabase/server'

/**
 * Check if a user has access to an ebook through purchase or subscription
 * @param userId - Supabase user ID
 * @param sanityEbookId - Sanity ebook document ID
 * @returns true if user has access
 */
export async function hasEbookAccess(
  userId: string,
  sanityEbookId: string
): Promise<boolean> {
  if (!userId || !sanityEbookId) {
    return false
  }

  try {
    const supabase = createClient()

    // Check for direct purchase
    const { data: purchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('sanity_ebook_id', sanityEbookId)
      .single()

    if (purchase) {
      return true
    }

    // Check for active subscription (provides access to all ebooks)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (subscription) {
      return true
    }

    return false
  } catch (error) {
    console.error('[Access Control] Error checking ebook access:', error)
    return false
  }
}

/**
 * Get all ebook IDs that a user has purchased
 * @param userId - Supabase user ID
 * @returns Array of Sanity ebook IDs
 */
export async function getUserPurchasedEbookIds(userId: string): Promise<string[]> {
  if (!userId) {
    return []
  }

  try {
    const supabase = createClient()

    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('sanity_ebook_id')
      .eq('user_id', userId)

    if (error) {
      console.error('[Access Control] Error fetching purchases:', error)
      return []
    }

    return purchases?.map((p) => p.sanity_ebook_id) || []
  } catch (error) {
    console.error('[Access Control] Error fetching user ebooks:', error)
    return []
  }
}

/**
 * Check if a user has an active subscription
 * @param userId - Supabase user ID
 * @returns true if user has active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  if (!userId) {
    return false
  }

  try {
    const supabase = createClient()

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    return !!subscription
  } catch (error) {
    console.error('[Access Control] Error checking subscription:', error)
    return false
  }
}

// Legacy exports for backwards compatibility
export const checkEbookAccess = hasEbookAccess
export const getUserPurchasedEbooks = getUserPurchasedEbookIds
