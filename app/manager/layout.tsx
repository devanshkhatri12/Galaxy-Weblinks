/**
 * Manager Layout
 *
 * Layout for manager pages. Requires manager or admin role.
 * Managers can view activity logs and manage contact submissions.
 */

import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not authenticated, redirect to login
  if (!user) {
    redirect("/auth/login");
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Check if user is manager or admin
  const isManagerOrAdmin =
    profile?.role === "manager" || profile?.role === "admin";

  if (!isManagerOrAdmin) {
    // Redirect non-manager/non-admin users to regular dashboard
    redirect("/dashboard");
  }

  // Combine user and profile data
  const userData = {
    id: user.id,
    email: user.email!,
    firstName: profile?.first_name || user.user_metadata?.first_name || "",
    lastName: profile?.last_name || user.user_metadata?.last_name || "",
    avatarUrl: profile?.avatar_url || null,
    role: profile?.role || "user",
    createdAt: user.created_at,
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar for desktop */}
      <DashboardSidebar user={userData} />

      {/* Main content area */}
      <div className="lg:pl-64">
        <DashboardHeader user={userData} />
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
