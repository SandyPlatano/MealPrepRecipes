"use server";

/**
 * Read operations for smart folders
 */

import { createClient } from "@/lib/supabase/server";
import {
  getCachedUser,
  getCachedUserWithHousehold,
} from "@/lib/supabase/cached-queries";
import { getCached } from "@/lib/cache/redis";
import type { SystemSmartFolder } from "@/types/smart-folder";
import type { FolderWithChildren } from "@/types/folder";

/**
 * Get all system smart folders (built-in, read-only)
 */
export async function getSystemSmartFolders(): Promise<{
  error: string | null;
  data: SystemSmartFolder[] | null;
}> {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  // System smart folders are read-only, cache for 1 hour
  return getCached(
    "system-smart-folders",
    async () => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("system_smart_folders")
        .select("id, name, description, emoji, color, smart_filters, sort_order, created_at")
        .order("sort_order", { ascending: true });

      if (error) {
        return { error: error.message, data: null };
      }

      // Parse JSONB smart_filters into typed objects
      const parsed: SystemSmartFolder[] = data.map((folder) => ({
        ...folder,
        smart_filters:
          typeof folder.smart_filters === "string"
            ? JSON.parse(folder.smart_filters)
            : folder.smart_filters,
      }));

      return { error: null, data: parsed };
    },
    3600 // 1 hour TTL for read-only system data
  );
}

/**
 * Get all user-created smart folders for the household
 */
export async function getUserSmartFolders(): Promise<{
  error: string | null;
  data: FolderWithChildren[] | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data: folders, error } = await supabase
    .from("recipe_folders")
    .select("id, household_id, created_by_user_id, name, emoji, color, is_smart, smart_filters, parent_folder_id, cover_recipe_id, category_id, sort_order, created_at, updated_at")
    .eq("household_id", household.household_id)
    .eq("is_smart", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  // Convert to FolderWithChildren format (smart folders don't have children)
  const smartFolders: FolderWithChildren[] = folders.map((folder) => ({
    ...folder,
    smart_filters:
      typeof folder.smart_filters === "string"
        ? JSON.parse(folder.smart_filters)
        : folder.smart_filters,
    children: [],
    recipe_count: 0, // Dynamic count calculated client-side
    cover_image_url: null,
  }));

  return { error: null, data: smartFolders };
}
