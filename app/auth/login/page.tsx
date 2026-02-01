/**
 * Login Page
 * 
 * This page allows users to sign in to their account.
 * It includes:
 * - Email and password fields
 * - Remember me option
 * - Link to forgot password
 * - Link to sign up
 */

import { LoginForm } from '@/components/auth/login-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = {
  title: 'Login | Your App',
  description: 'Sign in to your account',
}

export default async function LoginPage() {
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
            Welcome back
          </h2>
          <p className="mt-2 text-muted-foreground">
            Sign in to continue to your account
          </p>
        </div>

        {/* Login form component */}
        <LoginForm />

        {/* Sign up link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link 
            href="/auth/sign-up" 
            className="font-medium text-primary hover:underline"
          >
            Create one here
          </Link>
        </p>
      </div>
    </main>
  )
}
