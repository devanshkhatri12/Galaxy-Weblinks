/**
 * Manager Dashboard - Overview Page
 *
 * Overview for managers with key metrics and quick actions.
 * Managers can:
 * - View activity logs
 * - Manage contact submissions
 * - View system metrics
 */

import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Activity, MessageSquare, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Manager Dashboard | Your App",
  description: "Manager dashboard and overview",
};

export default async function ManagerDashboardPage() {
  const supabase = await createClient();

  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { count: recentActivityCount } = await supabase
    .from("activity_logs")
    .select("*", { count: "exact", head: true })
    .gte("created_at", sevenDaysAgo.toISOString());

  // Get contact submissions count
  const { count: contactCount } = await supabase
    .from("contact_submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: totalContactCount } = await supabase
    .from("contact_submissions")
    .select("*", { count: "exact", head: true });

  // Stats cards data
  const stats = [
    {
      title: "Recent Activity",
      value: recentActivityCount || 0,
      description: "Last 7 days",
      icon: Activity,
      href: "/manager/activity",
    },
    {
      title: "Pending Messages",
      value: contactCount || 0,
      description: "Contact submissions",
      icon: MessageSquare,
      href: "/manager/messages",
    },
    {
      title: "Total Messages",
      value: totalContactCount || 0,
      description: "All time",
      icon: TrendingUp,
      href: "/manager/messages",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage activity logs, contact submissions, and track system metrics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{stat.title}</CardTitle>
                  <CardDescription>{stat.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-muted-foreground">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>View Activity Logs</CardTitle>
              <CardDescription>
                Monitor all user actions and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/manager/activity">
                <Button>View Logs</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Messages</CardTitle>
              <CardDescription>
                Review and respond to contact form submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/manager/messages">
                <Button>View Messages</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
