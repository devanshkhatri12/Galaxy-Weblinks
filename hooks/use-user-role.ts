/**
 * useUserRole Hook
 *
 * Client-side hook to get the current user's role information.
 * This hook manages the role state and provides role checking functions.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/roles";
import { getCurrentUserRoleClient } from "@/lib/roles";
import { createClient } from "@/lib/supabase/client";

interface UseUserRoleReturn {
  role: UserRole | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isManager: boolean;
  isUser: boolean;
  canAccess: (requiredRole: UserRole) => boolean;
}

/**
 * Hook to get current user's role
 * @returns User role information and helper functions
 */
export function useUserRole(): UseUserRoleReturn {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setRole(null);
          router.push("/auth/login");
          return;
        }

        // Fetch the user's profile with role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role:role_id(name)")
          .eq("id", user.id)
          .single();

        const userRole = (profile?.role?.name as UserRole) || "user";
        setRole(userRole);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch user role";
        setError(errorMessage);
        console.error("Error fetching user role:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();

    // Set up real-time subscription for role changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setRole(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, router]);

  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    manager: 2,
    admin: 3,
  };

  const canAccess = (requiredRole: UserRole): boolean => {
    if (!role) return false;
    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  };

  return {
    role,
    isLoading,
    error,
    isAdmin: role === "admin",
    isManager: role === "manager",
    isUser: role === "user",
    canAccess,
  };
}
