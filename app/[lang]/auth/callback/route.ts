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
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get user to create profile if needed
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        // Create profile if it doesn't exist
        if (!profile) {
          await supabase.from('profiles').insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            role: 'user',
            preferred_language: lang,
            preferred_currency: 'USD',
          })
        }
      }
    }
  }

  // Redirect to original destination or dashboard
  const redirectTo = redirect || `/${lang}/dashboard`
  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
}
