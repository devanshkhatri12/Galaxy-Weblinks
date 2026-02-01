/**
 * Sign Up Page
 * 
 * This page allows new users to create an account.
 * It includes:
 * - Name fields (first and last)
 * - Email field
 * - Password with confirmation
 * - Terms and conditions agreement
 */

import { SignUpForm } from '@/components/auth/sign-up-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = {
  title: 'Sign Up | Your App',
  description: 'Create a new account',
}

export default async function SignUpPage() {
  // Check if user is already logged in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If already logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and heading */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-primary">YourApp</h1>
          </Link>
          <h2 className="mt-4 text-2xl font-semibold text-foreground">
            Create your account
          </h2>
          <p className="mt-2 text-muted-foreground">
            Join us today and get started
          </p>
        </div>

        {/* Sign up form component */}
        <SignUpForm />

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link 
            href="/auth/login" 
            className="font-medium text-primary hover:underline"
          >
            Sign in instead
          </Link>
        </p>
      </div>
    </main>
  )
}
