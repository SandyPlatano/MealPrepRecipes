"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Get user profile
export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: profile };
}

// Update user profile
export async function updateProfile(firstName: string, lastName: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      // Keep name field updated for backwards compatibility
      name: `${firstName} ${lastName}`.trim(),
      updated_at: new Date().toISOString()
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { error: null };
}

// Get user settings (from user_settings table, or create default)
export async function getSettings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Try to get existing settings
  let { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Create default settings if none exist
  if (!settings) {
    const { data: newSettings, error } = await supabase
      .from("user_settings")
      .insert({
        user_id: user.id,
        dark_mode: false,
        cook_names: ["Me"],
        email_notifications: true,
      })
      .select()
      .single();

    if (error) {
      // Table might not exist - return defaults
      return {
        error: null,
        data: {
          id: "",
          user_id: user.id,
          dark_mode: false,
          cook_names: ["Me"],
          email_notifications: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    }
    settings = newSettings;
  }

  return { error: null, data: settings };
}

// Update user settings
export async function updateSettings(settings: {
  dark_mode?: boolean;
  cook_names?: string[];
  email_notifications?: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Upsert settings
  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: user.id,
      ...settings,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  return { error: null };
}

// Get household info
export async function getHouseholdInfo() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data: membership } = await supabase
    .from("household_members")
    .select(
      `
      household_id,
      role,
      households (
        id,
        name,
        created_at
      )
    `
    )
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", data: null };
  }

  // Get household members
  const { data: members } = await supabase
    .from("household_members")
    .select(
      `
      user_id,
      role,
      profiles (
        name,
        email
      )
    `
    )
    .eq("household_id", membership.household_id);

  return {
    error: null,
    data: {
      household: membership.households,
      role: membership.role,
      members: members || [],
    },
  };
}

// Update household name
export async function updateHouseholdName(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id, role")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found" };
  }

  // Only owners can update household name
  if (membership.role !== "owner") {
    return { error: "Only the household owner can update the name" };
  }

  const { error } = await supabase
    .from("households")
    .update({ name })
    .eq("id", membership.household_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { error: null };
}

// Delete account permanently
export async function deleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    // Delete the user's auth account
    // This will cascade delete all related data due to foreign key constraints
    const { error } = await supabase.auth.admin.deleteUser(user.id);

    if (error) {
      // If admin API not available, try RPC or direct deletion
      // The user's data will be deleted via CASCADE on auth.users deletion
      return { error: "Unable to delete account. Please contact support." };
    }

    return { error: null };
  } catch (error) {
    return { error: "Failed to delete account. Please try again." };
  }
}

// Get recipe stats
export async function getRecipeStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  // Get recipe counts by type
  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, recipe_type, category, created_at")
    .or(
      `user_id.eq.${user.id},and(household_id.eq.${membership?.household_id},is_shared_with_household.eq.true)`
    );

  // Get favorites count
  const { count: favoritesCount } = await supabase
    .from("favorites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Get cooking history
  const { data: history } = await supabase
    .from("recipe_history")
    .select("id, cooked_at, rating")
    .eq("user_id", user.id);

  // Calculate stats
  const recipesByType: Record<string, number> = {};
  const recipesByCategory: Record<string, number> = {};

  (recipes || []).forEach((recipe) => {
    recipesByType[recipe.recipe_type] =
      (recipesByType[recipe.recipe_type] || 0) + 1;
    if (recipe.category) {
      recipesByCategory[recipe.category] =
        (recipesByCategory[recipe.category] || 0) + 1;
    }
  });

  const totalCooked = (history || []).length;
  const avgRating =
    totalCooked > 0
      ? (history || []).reduce((sum, h) => sum + (h.rating || 0), 0) /
        (history || []).filter((h) => h.rating).length
      : 0;

  return {
    error: null,
    data: {
      totalRecipes: (recipes || []).length,
      favoritesCount: favoritesCount || 0,
      totalCooked,
      avgRating: avgRating || 0,
      recipesByType,
      recipesByCategory,
    },
  };
}
