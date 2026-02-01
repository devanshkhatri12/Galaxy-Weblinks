/**
 * Change Password Page
 * 
 * Allows users to change their account password.
 */

import { ChangePasswordForm } from '@/components/dashboard/change-password-form'

export const metadata = {
  title: 'Change Password | Your App',
  description: 'Update your account password',
}

export default function ChangePasswordPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Change Password</h1>
        <p className="text-muted-foreground mt-2">
          Update your password to keep your account secure.
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  )
}
