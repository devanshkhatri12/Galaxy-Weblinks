/**
 * Forgot Password Page
 * 
 * This page allows users to request a password reset link.
 * A simple form that asks for their email address.
 */

import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import Link from 'next/link'

export const metadata = {
  title: 'Forgot Password | Your App',
  description: 'Reset your password',
}

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and heading */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-primary">YourApp</h1>
          </Link>
          <h2 className="mt-4 text-2xl font-semibold text-foreground">
            Forgot your password?
          </h2>
          <p className="mt-2 text-muted-foreground">
            No worries, we&apos;ll send you reset instructions
          </p>
        </div>

        {/* Forgot password form */}
        <ForgotPasswordForm />

        {/* Back to login link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link 
            href="/auth/login" 
            className="font-medium text-primary hover:underline"
          >
            Back to login
          </Link>
        </p>
      </div>
    </main>
  )
}
