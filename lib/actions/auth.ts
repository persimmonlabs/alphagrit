'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirect') as string | null

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // In production, you'd want to handle this error better
    console.error('Sign in error:', error.message)
    redirect('/auth/signin?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect(redirectTo || '/account')
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  const supabase = await createClient()

  // Sign up user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (authError) {
    console.error('Sign up error:', authError.message)
    redirect('/auth/signup?error=' + encodeURIComponent(authError.message))
  }

  if (!authData.user) {
    redirect('/auth/signup?error=Failed to create user')
  }

  // Create profile
  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    email,
    full_name: fullName,
    role: 'customer',
  })

  if (profileError) {
    console.error('Profile creation error:', profileError)
    // Don't fail the signup if profile creation fails
    // The user can still use the app
  }

  revalidatePath('/', 'layout')
  redirect('/account')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error('Google OAuth error:', error.message)
    redirect('/auth/signin?error=' + encodeURIComponent(error.message))
  }

  if (data.url) {
    redirect(data.url)
  }

  redirect('/auth/signin')
}
