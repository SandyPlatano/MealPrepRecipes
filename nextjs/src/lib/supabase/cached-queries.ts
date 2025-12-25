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
    return {
      user: null,
      household: null,
      householdId: null,
      subscription: null,
      error: authError
    };
  }

  const supabase = await createClient();

  // Fetch household membership
  const { data: membership, error: householdError } = await supabase
    .from("household_members")
    .select("household_id, role")
    .eq("user_id", user.id)
    .single();

  // Fetch full household data if membership exists
  let household: {
    id: string;
    name: string;
    owner_id: string;
    permission_mode: string;
    household_settings: Record<string, unknown>;
    household_id: string; // Backward compatibility alias
  } | null = null;

  if (membership?.household_id) {
    const { data: householdData } = await supabase
      .from("households")
      .select("id, name, owner_id, permission_mode, household_settings")
      .eq("id", membership.household_id)
      .single();
    if (householdData) {
      household = {
        ...householdData,
        household_id: householdData.id, // Backward compatibility alias
      };
    }
  }

  // Fetch subscription data (graceful - don't fail if table doesn't exist)
  let subscription = null;
  try {
    const { data: subData, error: subError } = await supabase
      .from("subscriptions")
      .select("id, user_id, stripe_customer_id, stripe_subscription_id, status, tier, current_period_end, cancel_at_period_end, created_at, updated_at")
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
    household,
    householdId: membership?.household_id ?? null,
    membership,
    subscription,
    error: householdError, // Only fail on household error, not subscription
  };
});

/**
 * Get just the household_id for the current user (cached)
 */
export const getCachedHouseholdId = cache(async (): Promise<string | null> => {
  const { householdId } = await getCachedUserWithHousehold();
  return householdId || null;
});

