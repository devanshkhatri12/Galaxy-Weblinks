/**
 * Activity Logs Page
 * 
 * Displays all system activity for administrators.
 * Shows login attempts, profile changes, and other actions.
 */

import { createClient } from '@/lib/supabase/server'
import { ActivityLogsTable } from '@/components/admin/activity-logs-table'

export const metadata = {
  title: 'Activity Logs | Admin',
  description: 'View system activity and audit logs',
}

export default async function ActivityLogsPage() {
  const supabase = await createClient()

  // Get activity logs with user information
  const { data: logs, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      profiles (
        first_name,
        last_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    console.error('Error fetching activity logs:', error)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground mt-2">
          Monitor user actions and system events.
        </p>
      </div>

      {/* Activity Logs Table */}
      <ActivityLogsTable logs={logs || []} />
    </div>
  )
}
