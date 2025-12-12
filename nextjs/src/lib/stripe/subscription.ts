import { createClient } from '@/lib/supabase/server';
import type { Subscription, SubscriptionTier } from '@/types/subscription';
import { getQuotaForTier } from '@/types/subscription';

/**
 * Get the subscription status for a user
 */
export async function getSubscriptionStatus(
  userId: string
): Promise<Subscription | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  return data;
}

/**
 * Check if user has an active subscription of a specific tier or higher
 */
export async function hasActiveSubscription(
  userId: string,
  requiredTier: SubscriptionTier = 'pro'
): Promise<boolean> {
  const subscription = await getSubscriptionStatus(userId);

  if (!subscription) return false;

  // Check if subscription is active
  if (subscription.status !== 'active' && subscription.status !== 'trialing') {
    return false;
  }

  // Check tier hierarchy: premium > pro > free
  const tierHierarchy: Record<SubscriptionTier, number> = {
    free: 0,
    pro: 1,
    premium: 2,
  };

  return tierHierarchy[subscription.tier] >= tierHierarchy[requiredTier];
}

/**
 * Get the current tier for a user (defaults to 'free' if no subscription)
 */
export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const subscription = await getSubscriptionStatus(userId);

  if (!subscription) return 'free';

  if (subscription.status !== 'active' && subscription.status !== 'trialing') {
    return 'free';
  }

  return subscription.tier;
}

/**
 * Check AI suggestion quota for a user
 */
export async function checkAISuggestionQuota(
  userId: string
): Promise<{ remaining: number | null; tier: SubscriptionTier }> {
  const supabase = await createClient();
  const tier = await getUserTier(userId);

  // Premium users have unlimited
  if (tier === 'premium') {
    return { remaining: null, tier };
  }

  // Free users have 0
  if (tier === 'free') {
    return { remaining: 0, tier };
  }

  // Pro users: check their quota
  const { data: settings, error } = await supabase
    .from('user_settings')
    .select('ai_suggestions_remaining, ai_suggestions_reset_at')
    .eq('user_id', userId)
    .single();

  if (error || !settings) {
    // Default to tier quota if no settings found
    const quota = getQuotaForTier(tier) || 0;
    return { remaining: quota, tier };
  }

  // Check if quota needs to be reset (weekly on Monday)
  const now = new Date();
  const resetAt = settings.ai_suggestions_reset_at
    ? new Date(settings.ai_suggestions_reset_at)
    : null;

  if (!resetAt || now > resetAt) {
    // Need to reset quota
    const quota = getQuotaForTier(tier) || 0;
    const nextMonday = getNextMonday(now);

    await supabase
      .from('user_settings')
      .update({
        ai_suggestions_remaining: quota,
        ai_suggestions_reset_at: nextMonday.toISOString(),
      })
      .eq('user_id', userId);

    return { remaining: quota, tier };
  }

  return { remaining: settings.ai_suggestions_remaining || 0, tier };
}

/**
 * Decrement AI suggestion quota for a user
 */
export async function decrementAISuggestionQuota(
  userId: string
): Promise<boolean> {
  const supabase = await createClient();
  const tier = await getUserTier(userId);

  // Premium users have unlimited, don't decrement
  if (tier === 'premium') {
    return true;
  }

  // Free users shouldn't be calling this
  if (tier === 'free') {
    return false;
  }

  const { error } = await supabase.rpc('decrement_ai_quota', {
    p_user_id: userId,
  });

  if (error) {
    console.error('Error decrementing quota:', error);
    return false;
  }

  return true;
}

/**
 * Reset AI suggestion quotas for all users (called by cron job)
 */
export async function resetAllAISuggestionQuotas(): Promise<void> {
  const supabase = await createClient();
  const nextMonday = getNextMonday(new Date());

  // Reset Pro users to 5
  await supabase
    .from('user_settings')
    .update({
      ai_suggestions_remaining: 5,
      ai_suggestions_reset_at: nextMonday.toISOString(),
    })
    .in('user_id', (await getProUserIds()) || []);

  // Premium users don't need reset (unlimited)
}

/**
 * Helper to get next Monday at 00:00 UTC
 */
function getNextMonday(date: Date): Date {
  const nextMonday = new Date(date);
  const dayOfWeek = nextMonday.getUTCDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  nextMonday.setUTCDate(nextMonday.getUTCDate() + daysUntilMonday);
  nextMonday.setUTCHours(0, 0, 0, 0);
  return nextMonday;
}

/**
 * Helper to get all Pro user IDs
 */
async function getProUserIds(): Promise<string[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('tier', 'pro')
    .in('status', ['active', 'trialing']);

  return data?.map((s) => s.user_id) || [];
}

/**
 * Require subscription middleware - throws error if user doesn't have required tier
 */
export async function requireSubscription(
  userId: string,
  requiredTier: SubscriptionTier = 'pro'
): Promise<void> {
  const hasAccess = await hasActiveSubscription(userId, requiredTier);

  if (!hasAccess) {
    throw new Error(
      `This feature requires a ${requiredTier} subscription or higher`
    );
  }
}
