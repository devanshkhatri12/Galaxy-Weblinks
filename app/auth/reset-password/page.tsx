/**
 * Reset Password Page
 * 
 * This page allows users to set a new password after clicking
 * the reset link in their email.
 */

import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import Link from 'next/link'

export const metadata = {
  title: 'Reset Password | Your App',
  description: 'Set a new password',
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and heading */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-primary">YourApp</h1>
          </Link>
          <h2 className="mt-4 text-2xl font-semibold text-foreground">
            Set new password
          </h2>
          <p className="mt-2 text-muted-foreground">
            Your new password must be different from previously used passwords
          </p>
        </div>

        {/* Reset password form */}
        <ResetPasswordForm />
      </div>
    </main>
  )
}
