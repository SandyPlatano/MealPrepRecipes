import { cache } from "react";
import { createClient } from "./server";

/**
 * Cached auth check - reuses the same result across multiple calls in a single request
 * This prevents multiple calls to supabase.auth.getUser() during SSR
 */
export const getCachedUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
});

/**
 * Cached user + household data - combines two most common queries
 * Returns user info along with their household membership and subscription
 */
export const getCachedUserWithHousehold = cache(async () => {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { user: null, household: null, subscription: null, error: authError };
  }

  const supabase = await createClient();

  // Fetch household membership
  const { data: membership, error: householdError } = await supabase
    .from("household_members")
    .select("household_id, role")
    .eq("user_id", user.id)
    .single();

  // Fetch subscription data (graceful - don't fail if table doesn't exist)
  let subscription = null;
  try {
    const { data: subData, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Only use subscription data if query succeeded
    if (!subError) {
      subscription = subData;
    }
  } catch {
    // Table may not exist in schema cache - that's okay
  }

  return {
    user,
    household: membership,
    subscription,
    error: householdError, // Only fail on household error, not subscription
  };
});

/**
 * Get just the household_id for the current user (cached)
 */
export const getCachedHouseholdId = cache(async (): Promise<string | null> => {
  const { household } = await getCachedUserWithHousehold();
  return household?.household_id || null;
});

