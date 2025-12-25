"use server";

import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import type { SubscriptionTier } from "@/types/subscription";

export interface SubscriptionData {
  tier: SubscriptionTier;
  status: "active" | "trialing" | "canceled" | "past_due" | "incomplete" | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
}

/**
 * Get subscription data for the current user
 */
export async function getSubscriptionData(): Promise<{
  error: string | null;
  data: SubscriptionData | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  // Get subscription from database (includes stripe_customer_id)
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("tier, status, current_period_end, cancel_at_period_end, stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!subscription) {
    return {
      error: null,
      data: {
        tier: "free",
        status: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        stripeCustomerId: null,
      },
    };
  }

  return {
    error: null,
    data: {
      tier: subscription.tier,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      stripeCustomerId: subscription.stripe_customer_id || null,
    },
  };
}

/**
 * Create a Stripe Customer Portal session for managing billing
 */
export async function createCustomerPortalSession(): Promise<{
  error: string | null;
  url: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated", url: null };
  }

  // Get stripe customer ID from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    return { error: "No billing account found", url: null };
  }

  try {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings/billing`,
    });

    return { error: null, url: session.url };
  } catch (error) {
    console.error("Error creating portal session:", error);
    return { error: "Failed to create billing portal session", url: null };
  }
}
