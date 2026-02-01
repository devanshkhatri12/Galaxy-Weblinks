/**
 * Supabase Session Handler for Middleware
 * 
 * This file handles session refresh in middleware.
 * It ensures users stay logged in by refreshing expired tokens.
 * 
 * WHAT IT DOES:
 * 1. Creates a Supabase client with cookie access
 * 2. Calls getUser() to refresh the session if needed
 * 3. Protects routes that require authentication
 * 4. Redirects unauthenticated users to login page
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Create initial response (we'll modify cookies on this)
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Create Supabase client with cookie access
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // First update the request cookies
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Then create new response with updated cookies
          supabaseResponse = NextResponse.next({
            request,
          })
          // Finally set cookies on the response
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: This call refreshes the session
  // Don't remove this or users will be randomly logged out!
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define protected routes (routes that require login)
  const protectedRoutes = ['/dashboard', '/admin', '/profile']
  
  // Check if current path requires authentication
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // If trying to access protected route without being logged in
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    // Save the original URL so we can redirect after login
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // If logged in and trying to access auth pages, redirect to dashboard
  const authRoutes = ['/auth/login', '/auth/sign-up']
  const isAuthRoute = authRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
