/**
 * RoleBasedAccess Component
 *
 * Conditionally renders content based on the user's role.
 * Useful for hiding/showing UI elements based on permissions.
 */

"use client";

import React from "react";
import { useUserRole } from "@/hooks/use-user-role";
import type { UserRole } from "@/lib/roles";

interface RoleBasedAccessProps {
  requiredRole?: UserRole | UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
  requireAll?: boolean;
}

/**
 * Component that only renders content if user has the required role
 *
 * @param requiredRole - Single role or array of allowed roles
 * @param fallback - Content to show if user doesn't have access
 * @param children - Content to show if user has access
 * @param requireAll - If true, user must have ALL roles. If false, user needs ANY role.
 */
export function RoleBasedAccess({
  requiredRole,
  fallback = null,
  children,
  requireAll = false,
}: RoleBasedAccessProps) {
  const { role, isLoading } = useUserRole();

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (!role) {
    return fallback;
  }

  // If no specific role required, show content to all authenticated users
  if (!requiredRole) {
    return children;
  }

  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    manager: 2,
    admin: 3,
  };

  let hasAccess = false;

  if (Array.isArray(requiredRole)) {
    if (requireAll) {
      // User must have all specified roles (doesn't make sense with hierarchy)
      hasAccess = requiredRole.includes(role);
    } else {
      // User must have at least one of the specified roles
      hasAccess = requiredRole.includes(role);
    }
  } else {
    // Single role - check hierarchy
    hasAccess = roleHierarchy[role] >= roleHierarchy[requiredRole];
  }

  return hasAccess ? children : fallback;
}

interface RoleBasedVisibilityProps {
  show?: UserRole | UserRole[];
  hide?: UserRole | UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component with more flexible role visibility rules
 */
export function RoleBasedVisibility({
  show,
  hide,
  children,
  fallback = null,
}: RoleBasedVisibilityProps) {
  const { role, isLoading } = useUserRole();

  if (isLoading) {
    return null;
  }

  if (!role) {
    return fallback;
  }

  // Check hide rules first
  if (hide) {
    const hiddenRoles = Array.isArray(hide) ? hide : [hide];
    if (hiddenRoles.includes(role)) {
      return fallback;
    }
  }

  // Check show rules
  if (show) {
    const shownRoles = Array.isArray(show) ? show : [show];
    if (!shownRoles.includes(role)) {
      return fallback;
    }
  }

  return children;
}
