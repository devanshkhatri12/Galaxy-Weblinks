/**
 * Search API Route
 *
 * Handles search requests for:
 * - Users (admin only)
 * - Files (personal - current user only)
 * - Pages (public search)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface SearchResult {
  id: string;
  type: "user" | "file" | "page";
  title: string;
  description?: string;
  url?: string;
  email?: string;
  role?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.toLowerCase() || "";
  const searchType = searchParams.get("type") || "all"; // all, users, files, pages

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const results: SearchResult[] = [];

  try {
    // Search public pages
    if (searchType === "all" || searchType === "pages") {
      const pages = [
        {
          id: "home",
          type: "page" as const,
          title: "Home",
          description: "Main landing page",
          url: "/",
        },
        {
          id: "about",
          type: "page" as const,
          title: "About Us",
          description: "Learn about our mission and values",
          url: "/about",
        },
        {
          id: "contact",
          type: "page" as const,
          title: "Contact Us",
          description: "Get in touch with our team",
          url: "/contact",
        },
        {
          id: "privacy",
          type: "page" as const,
          title: "Privacy Policy",
          description: "Our privacy and data protection policies",
          url: "/privacy",
        },
        {
          id: "terms",
          type: "page" as const,
          title: "Terms of Service",
          description: "Terms and conditions of use",
          url: "/terms",
        },
      ];

      const matchedPages = pages.filter(
        (page) =>
          page.title.toLowerCase().includes(query) ||
          page.description.toLowerCase().includes(query),
      );

      results.push(...matchedPages);
    }

    // Search users (admin only)
    if ((searchType === "all" || searchType === "users") && user) {
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // Check if user is admin
      if (userProfile?.role === "admin") {
        const { data: users } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email:auth.users(email), role")
          .or(
            `first_name.ilike.%${query}%,last_name.ilike.%${query}%,id.eq.${query}`,
          )
          .limit(10);

        if (users) {
          results.push(
            ...users.map((u: any) => ({
              id: u.id,
              type: "user" as const,
              title:
                `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.id,
              description: u.email,
              email: u.email,
              role: u.role,
              url: `/admin/users/${u.id}`,
            })),
          );
        }
      }
    }

    // Search files (personal only)
    if ((searchType === "all" || searchType === "files") && user) {
      const { data: fileList } = await supabase.storage
        .from("user-files")
        .list(`${user.id}/`, {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (fileList) {
        const matchedFiles = fileList
          .filter(
            (file) =>
              file.name !== ".emptyFolderPlaceholder" &&
              file.name.toLowerCase().includes(query),
          )
          .slice(0, 10);

        results.push(
          ...matchedFiles.map((file) => ({
            id: file.name,
            type: "file" as const,
            title: file.name,
            description: `Size: ${formatFileSize(file.metadata?.size || 0)}`,
            url: `/dashboard/files`,
          })),
        );
      }
    }

    // Sort results: pages first, then users, then files
    const typeOrder = { page: 0, user: 1, file: 2 };
    results.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);

    return NextResponse.json({
      success: true,
      query,
      results: results.slice(0, 20), // Return max 20 results
      total: results.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

/**
 * Format file size in bytes to human readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
