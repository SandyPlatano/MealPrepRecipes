/**
 * Admin utilities for role-based access control
 */

import { createClient } from "@/lib/supabase/server";

/**
 * Check if a user has admin privileges
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (error) {
    return false;
  }

  return data?.is_admin === true;
}

/**
 * Get admin status for the current authenticated user
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  return isAdmin(user.id);
}

/**
 * Require admin access - throws if not admin
 */
export async function requireAdmin(): Promise<void> {
  const isAdminUser = await isCurrentUserAdmin();

  if (!isAdminUser) {
    throw new Error("Admin access required");
  }
}
