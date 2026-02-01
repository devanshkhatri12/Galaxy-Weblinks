/**
 * Supabase Client for Browser/Client-Side Code
 * 
 * USE THIS FILE WHEN:
 * - You're in a Client Component (files with 'use client')
 * - You need to interact with Supabase from the browser
 * - You're handling user interactions like form submissions
 * 
 * HOW TO USE:
 * import { createClient } from '@/lib/supabase/client'
 * const supabase = createClient()
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
