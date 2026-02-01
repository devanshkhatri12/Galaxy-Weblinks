/**
 * Role Management Utilities
 *
 * This module handles role-based access control (RBAC) for the application.
 * Roles: 'user', 'manager', 'admin'
 */

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

// Define available roles
export type UserRole = "user" | "manager" | "admin";

export interface UserWithRole {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  avatarUrl: string | null;
}

/**
 * Get the current user's profile and role (Server-side)
 *
 * This function should be called on the server side to securely
 * retrieve the authenticated user's role information.
 *
 * @returns User profile with role, or null if not authenticated
 */
export async function getCurrentUserWithRole(): Promise<UserWithRole | null> {
  try {
    const supabase = await createServerClient();

    // Get the current authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Fetch the user's profile with role information
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        first_name,
        last_name,
        is_active,
        email_verified,
        avatar_url,
        role:role_id(name)
      `,
      )
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    if (!profile) {
      return null;
    }

    return {
      id: profile.id,
      email: user.email || "",
      firstName: profile.first_name || "",
      lastName: profile.last_name || "",
      role: (profile.role?.name as UserRole) || "user",
      isActive: profile.is_active,
      emailVerified: profile.email_verified,
      avatarUrl: profile.avatar_url,
    };
  } catch (error) {
    console.error("Error getting current user with role:", error);
    return null;
  }
}

/**
 * Get user's role by ID
 *
 * @param userId - The user ID to fetch the role for
 * @returns The user's role or null if not found
 */
export async function getUserRoleById(
  userId: string,
): Promise<UserRole | null> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("role:role_id(name)")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user role:", error);
      return null;
    }

    return (data?.role?.name as UserRole) || "user";
  } catch (error) {
    console.error("Error getting user role by ID:", error);
    return null;
  }
}

/**
 * Check if user has a specific role
 *
 * @param userRole - The user's current role
 * @param requiredRole - The role to check against
 * @returns True if user has the required role or higher
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    manager: 2,
    admin: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Check if user has any of the specified roles
 *
 * @param userRole - The user's current role
 * @param allowedRoles - Array of roles that are allowed
 * @returns True if user has any of the allowed roles
 */
export function hasAnyRole(
  userRole: UserRole,
  allowedRoles: UserRole[],
): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Assign a role to a user (Admin only)
 *
 * @param userId - The user ID to assign role to
 * @param roleName - The role name to assign
 * @returns Success status
 */
export async function assignRoleToUser(
  userId: string,
  roleName: UserRole,
): Promise<boolean> {
  try {
    const supabase = await createServerClient();

    // First, get the role ID from the roles table
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", roleName)
      .single();

    if (roleError) {
      console.error("Error fetching role:", roleError);
      return false;
    }

    // Update the user's profile with the new role
    const { error } = await supabase
      .from("profiles")
      .update({ role_id: roleData.id })
      .eq("id", userId);

    if (error) {
      console.error("Error assigning role:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in assignRoleToUser:", error);
    return false;
  }
}

/**
 * Get all users with their roles (Admin only)
 *
 * @returns Array of users with their roles
 */
export async function getAllUsersWithRoles(): Promise<UserWithRole[]> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        first_name,
        last_name,
        is_active,
        email_verified,
        avatar_url,
        role:role_id(name),
        user_email:id(email)
      `,
      )
      .order("first_name");

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    return (
      data?.map((profile: any) => ({
        id: profile.id,
        email: profile.user_email?.email || "",
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        role: (profile.role?.name as UserRole) || "user",
        isActive: profile.is_active,
        emailVerified: profile.email_verified,
        avatarUrl: profile.avatar_url,
      })) || []
    );
  } catch (error) {
    console.error("Error getting all users:", error);
    return [];
  }
}

/**
 * Get user's role from browser client (client-side)
 * Note: This fetches from the users table and should be cached
 *
 * @returns The current user's role or null
 */
export async function getCurrentUserRoleClient(): Promise<UserRole | null> {
  try {
    const supabase = createBrowserClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role:role_id(name)")
      .eq("id", user.id)
      .single();

    return (profile?.role?.name as UserRole) || "user";
  } catch (error) {
    console.error("Error getting user role on client:", error);
    return null;
  }
}
