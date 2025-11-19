'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    const fullName = formData.get('fullName') as string

    if (!fullName || fullName.trim().length < 2) {
      return { success: false, error: 'Full name is required' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id)

    if (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: 'Failed to update profile' }
    }

    revalidatePath('/account')
    revalidatePath('/account/settings')
    
    return { success: true }
  } catch (error) {
    console.error('Update profile error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getProfile() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}
