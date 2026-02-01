/**
 * Supabase Client for Server-Side Code
 * 
 * USE THIS FILE WHEN:
 * - You're in a Server Component (no 'use client' directive)
 * - You're in a Server Action
 * - You're in an API Route Handler
 * 
 * IMPORTANT:
 * - Always create a new client inside each function (don't store in global variable)
 * - This ensures proper cookie handling for each request
 * 
 * HOW TO USE:
 * import { createClient } from '@/lib/supabase/server'
 * const supabase = await createClient()
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The "setAll" method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}
