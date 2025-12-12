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

  // Fetch subscription data
  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return {
    user,
    household: membership,
    subscription,
    error: householdError || subscriptionError,
  };
});

/**
 * Get just the household_id for the current user (cached)
 */
export const getCachedHouseholdId = cache(async (): Promise<string | null> => {
  const { household } = await getCachedUserWithHousehold();
  return household?.household_id || null;
});

