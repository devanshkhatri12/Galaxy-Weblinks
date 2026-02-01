/**
 * Auth Callback Route
 * 
 * This route handles the callback from Supabase Auth after:
 * - Email verification
 * - Password reset
 * - OAuth sign in (if you add social login later)
 * 
 * Supabase redirects here with a code that we exchange for a session.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Get the URL and extract the code parameter
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redirect to the intended destination
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // If there's an error or no code, redirect to error page
  return NextResponse.redirect(new URL('/auth/error', requestUrl.origin))
}
