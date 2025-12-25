"use server";

/**
 * Account Management Actions
 *
 * Actions for account deletion and management.
 */

import { createAdminClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";

/**
 * Delete account permanently
 * Uses admin client with service role to delete user and cascade all data
 */
export async function deleteAccount() {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  try {
    const adminClient = createAdminClient();

    // First, cancel any active Stripe subscription
    const { data: subscription } = await adminClient
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subscription?.stripe_subscription_id) {
      try {
        const { getStripe } = await import("@/lib/stripe/client");
        const stripe = getStripe();
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
      } catch (stripeError) {
        console.error("Failed to cancel Stripe subscription:", stripeError);
        // Continue with deletion even if Stripe cancellation fails
      }
    }

    // Delete the user using admin API
    // This will cascade delete all related data due to ON DELETE CASCADE
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      console.error("Failed to delete user:", deleteError);
      return { error: "Failed to delete account. Please contact support." };
    }

    return { error: null };
  } catch (error) {
    console.error("Account deletion error:", error);
    return { error: "Failed to delete account. Please try again." };
  }
}
