import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect')
  const lang = requestUrl.pathname.split('/')[1] || 'en'

  if (code) {
    const supabase = createClient()

    // Exchange code for session
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error('[Auth Callback] Session exchange failed:', sessionError.message)
      // Redirect to login with error
      return NextResponse.redirect(
        new URL(`/${lang}/auth/login?error=auth_failed`, requestUrl.origin)
      )
    }

    // Get user to create profile if needed
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error('[Auth Callback] Failed to get user:', userError.message)
    }

    if (user) {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('[Auth Callback] Profile check failed:', profileError.message)
      }

      // Create profile if it doesn't exist
      if (!profile) {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          role: 'user',
          preferred_language: lang,
          preferred_currency: 'USD',
        })

        if (insertError) {
          console.error('[Auth Callback] Profile creation failed:', insertError.message)
          // Non-fatal: user can still access the app, profile will be created on next action
        } else {
          console.info('[Auth Callback] Profile created for user:', user.id)
        }
      }
    }
  }

  // Redirect to original destination or dashboard
  const redirectTo = redirect || `/${lang}/dashboard`
  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
}
