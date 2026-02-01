/**
 * User Management Page
 * 
 * Admin page for managing users with CRUD operations:
 * - View all users
 * - Edit user details
 * - Change user roles
 * - Delete users
 */

import { createClient } from '@/lib/supabase/server'
import { UserManagementTable } from '@/components/admin/user-management-table'

export const metadata = {
  title: 'User Management | Admin',
  description: 'Manage users and their roles',
}

export default async function UsersPage() {
  const supabase = await createClient()

  // Get all users with their profiles
  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all registered users.
        </p>
      </div>

      {/* User Table */}
      <UserManagementTable users={users || []} />
    </div>
  )
}
