/**
 * Profile Page
 * 
 * Allows users to view and edit their profile information.
 */

import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/dashboard/profile-form'

export const metadata = {
  title: 'Profile | Your App',
  description: 'Manage your profile information',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const userData = {
    id: user?.id || '',
    email: user?.email || '',
    firstName: profile?.first_name || user?.user_metadata?.first_name || '',
    lastName: profile?.last_name || user?.user_metadata?.last_name || '',
    bio: profile?.bio || '',
    avatarUrl: profile?.avatar_url || null,
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal information and preferences.
        </p>
      </div>

      <ProfileForm user={userData} />
    </div>
  )
}
