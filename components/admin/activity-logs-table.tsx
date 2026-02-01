/**
 * Activity Logs Table Component
 *
 * Displays activity logs with filtering and search.
 * Can be used in both admin and manager views.
 */

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  LogIn,
  LogOut,
  User,
  Lock,
  FileUp,
  AlertTriangle,
} from "lucide-react";

interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface ActivityLogsTableProps {
  logs: ActivityLog[];
  readOnly?: boolean;
}

// Get action details for display
function getActionInfo(action: string) {
  switch (action) {
    case "LOGIN_SUCCESS":
      return { label: "Login", icon: LogIn, color: "bg-green-500" };
    case "LOGIN_FAILED":
      return {
        label: "Failed Login",
        icon: AlertTriangle,
        color: "bg-red-500",
      };
    case "LOGOUT":
      return { label: "Logout", icon: LogOut, color: "bg-gray-500" };
    case "SIGNUP_SUCCESS":
      return { label: "Sign Up", icon: User, color: "bg-blue-500" };
    case "SIGNUP_FAILED":
      return {
        label: "Failed Sign Up",
        icon: AlertTriangle,
        color: "bg-red-500",
      };
    case "PASSWORD_CHANGED":
      return { label: "Password Changed", icon: Lock, color: "bg-purple-500" };
    case "PASSWORD_RESET_REQUESTED":
      return {
        label: "Password Reset Request",
        icon: Lock,
        color: "bg-yellow-500",
      };
    case "PASSWORD_RESET_SUCCESS":
      return { label: "Password Reset", icon: Lock, color: "bg-green-500" };
    case "PROFILE_UPDATED":
      return { label: "Profile Update", icon: User, color: "bg-blue-500" };
    case "FILE_UPLOADED":
      return { label: "File Upload", icon: FileUp, color: "bg-cyan-500" };
    default:
      return {
        label: action.replace(/_/g, " "),
        icon: User,
        color: "bg-gray-500",
      };
  }
}

export function ActivityLogsTable({ logs }: ActivityLogsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Get unique actions for filter
  const uniqueActions = [...new Set(logs.map((log) => log.action))];

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (log.profiles?.first_name?.toLowerCase() || "").includes(searchLower) ||
      (log.profiles?.last_name?.toLowerCase() || "").includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower) ||
      (log.user_id?.toLowerCase() || "").includes(searchLower);

    // Action filter
    const matchesAction = actionFilter === "all" || log.action === actionFilter;

    // Date filter
    let matchesDate = true;
    if (dateFilter !== "all") {
      const logDate = new Date(log.created_at);
      const now = new Date();

      switch (dateFilter) {
        case "today":
          matchesDate = logDate.toDateString() === now.toDateString();
          break;
        case "week":
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDate = logDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          matchesDate = logDate >= monthAgo;
          break;
      }
    }

    return matchesSearch && matchesAction && matchesDate;
  });

  // Format date/time
  function formatDateTime(dateString: string) {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user or action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Action Filter */}
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">Total Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {logs.filter((l) => l.action === "LOGIN_SUCCESS").length}
            </div>
            <p className="text-xs text-muted-foreground">Successful Logins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {logs.filter((l) => l.action === "LOGIN_FAILED").length}
            </div>
            <p className="text-xs text-muted-foreground">Failed Logins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {logs.filter((l) => l.action === "SIGNUP_SUCCESS").length}
            </div>
            <p className="text-xs text-muted-foreground">New Sign Ups</p>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No activity logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => {
                  const actionInfo = getActionInfo(log.action);
                  const ActionIcon = actionInfo.icon;
                  const dateTime = formatDateTime(log.created_at);

                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${actionInfo.color}`}
                          >
                            <ActionIcon className="h-4 w-4 text-white" />
                          </div>
                          <Badge variant="outline">{actionInfo.label}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.profiles ? (
                          <div>
                            <p className="font-medium">
                              {log.profiles.first_name} {log.profiles.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {log.user_id}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            {log.details &&
                            typeof log.details === "object" &&
                            "email" in log.details
                              ? String(log.details.email)
                              : "Unknown"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {log.details ? JSON.stringify(log.details) : "-"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{dateTime.date}</p>
                          <p className="text-xs text-muted-foreground">
                            {dateTime.time}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Showing {filteredLogs.length} of {logs.length} events
      </p>
    </div>
  );
}
