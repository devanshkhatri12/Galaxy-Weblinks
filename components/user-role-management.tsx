/**
 * User Role Management Component
 *
 * Admin-only component for viewing and changing user roles.
 * This demonstrates how to implement role management UI.
 */

"use client";

import React, { useEffect, useState } from "react";
import { RoleBasedAccess } from "./role-based-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserRole, UserWithRole } from "@/lib/roles";

export function UserRoleManagementPanel() {
  return (
    <RoleBasedAccess
      requiredRole="admin"
      fallback={
        <div className="p-4 text-red-600">Access Denied - Admin Only</div>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>User Role Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Manage user roles for access control. Hierarchy: User → Manager →
              Admin
            </p>
            <UserRoleTable />
          </CardContent>
        </Card>
      </div>
    </RoleBasedAccess>
  );
}

function UserRoleTable() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error: {error}
        <Button onClick={fetchUsers} className="ml-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-4">Name</th>
            <th className="text-left py-2 px-4">Email</th>
            <th className="text-left py-2 px-4">Current Role</th>
            <th className="text-left py-2 px-4">Status</th>
            <th className="text-left py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRoleRow
              key={user.id}
              user={user}
              onRoleChanged={() => fetchUsers()}
            />
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="text-center py-8 text-gray-500">No users found</div>
      )}
    </div>
  );
}

interface UserRoleRowProps {
  user: UserWithRole;
  onRoleChanged: () => void;
}

function UserRoleRow({ user, onRoleChanged }: UserRoleRowProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRoleChange = async () => {
    if (selectedRole === user.role) {
      return;
    }

    try {
      setUpdating(true);
      setMessage(null);

      const response = await fetch(`/api/admin/users/${user.id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      setMessage(`✓ Role updated to ${selectedRole}`);
      setTimeout(() => {
        setMessage(null);
        onRoleChanged();
      }, 2000);
    } catch (error) {
      setMessage(
        `✗ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setSelectedRole(user.role);
    } finally {
      setUpdating(false);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "user":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 px-4">
        <div className="font-medium">
          {user.firstName} {user.lastName}
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
      <td className="py-3 px-4">
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as UserRole)}
          disabled={updating}
          className={`px-3 py-1 rounded border ${getRoleBadgeColor(
            selectedRole,
          )} cursor-pointer disabled:opacity-50`}
        >
          <option value="user">User</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td className="py-3 px-4">
        <span
          className={`px-2 py-1 rounded text-sm ${
            user.isActive
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {user.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleRoleChange}
            disabled={updating || selectedRole === user.role}
            size="sm"
            variant={selectedRole === user.role ? "outline" : "default"}
          >
            {updating ? "Saving..." : "Save"}
          </Button>
          {message && (
            <div
              className={`text-xs ${
                message.startsWith("✓") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
