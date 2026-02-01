/**
 * Next.js Middleware
 * 
 * This runs BEFORE every request to your app.
 * It handles:
 * 1. Session refresh (keeps users logged in)
 * 2. Route protection (redirects unauthenticated users)
 * 3. Auth route handling (redirects logged-in users away from login/signup)
 */

import { updateSession } from '@/lib/supabase/proxy'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files like JS, CSS)
     * - _next/image (image optimization files)
     * - favicon.ico (browser icon)
     * - Images (.svg, .png, .jpg, .jpeg, .gif, .webp)
     * 
     * This means middleware runs on all pages but not on static assets.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
