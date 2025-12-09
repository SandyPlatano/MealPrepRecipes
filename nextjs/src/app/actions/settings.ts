"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";

// Get user profile
export async function getProfile() {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

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
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

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
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

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
  cook_colors?: Record<string, string>;
  email_notifications?: boolean;
  allergen_alerts?: string[];
  custom_dietary_restrictions?: string[];
  category_order?: string[] | null;
  calendar_event_time?: string | null;
  calendar_event_duration_minutes?: number | null;
  calendar_excluded_days?: string[] | null;
}) {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

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
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError || "No household found", data: null };
  }

  const supabase = await createClient();
  
  // Get full household details
  const { data: householdDetails } = await supabase
    .from("households")
    .select("id, name, created_at")
    .eq("id", household.household_id)
    .single();

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
    .eq("household_id", household.household_id);

  return {
    error: null,
    data: {
      household: householdDetails,
      role: household.role,
      members: members || [],
    },
  };
}

// Update household name
export async function updateHouseholdName(name: string) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError || "No household found" };
  }

  // Only owners can update household name
  if (household.role !== "owner") {
    return { error: "Only the household owner can update the name" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("households")
    .update({ name })
    .eq("id", household.household_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { error: null };
}

// Delete account permanently
export async function deleteAccount() {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

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
  } catch {
    return { error: "Failed to delete account. Please try again." };
  }
}

