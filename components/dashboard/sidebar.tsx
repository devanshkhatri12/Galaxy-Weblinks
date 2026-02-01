/**
 * Dashboard Sidebar Component
 *
 * Navigation sidebar for the dashboard.
 * Shows different options based on user role (Admin, Manager, User).
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  Lock,
  FileImage,
  Users,
  Activity,
  Settings,
  Shield,
  MessageSquare,
} from "lucide-react";

// Navigation items
const userNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/password", label: "Change Password", icon: Lock },
  { href: "/dashboard/files", label: "My Files", icon: FileImage },
];

const adminNavItems = [
  { href: "/admin", label: "Admin Dashboard", icon: Shield },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/activity", label: "Activity Logs", icon: Activity },
];

const managerNavItems = [
  { href: "/manager", label: "Manager Dashboard", icon: LayoutDashboard },
  { href: "/manager/activity", label: "Activity Logs", icon: Activity },
  { href: "/manager/messages", label: "Messages", icon: MessageSquare },
];

interface SidebarProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    avatarUrl: string | null;
  };
}

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = user.role === "admin";
  const isManager = user.role === "manager";

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-1 flex-col border-r bg-background">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">YourApp</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {/* User Navigation */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Account
            </p>
            {userNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Manager Navigation (only shown to managers and admins) */}
          {(isManager || isAdmin) && (
            <div className="space-y-1 pt-6">
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {isAdmin ? "Management" : "Manager"}
              </p>
              {(isAdmin ? adminNavItems : managerNavItems).map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Admin Navigation (only shown to admins) */}
          {isAdmin && (
            <div className="space-y-1 pt-2">
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Administration
              </p>
              {[
                { href: "/admin/users", label: "User Management", icon: Users },
                {
                  href: "/admin/activity",
                  label: "Activity Logs",
                  icon: Activity,
                },
              ].map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* Role Badge */}
        <div className="border-t p-4 space-y-3">
          <div className="flex gap-2 text-xs">
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full font-medium capitalize">
              {user.role}
            </span>
          </div>

          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
              {user.firstName?.[0] || user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
