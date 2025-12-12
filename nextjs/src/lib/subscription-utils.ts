import { createClient } from '@/lib/supabase/server';

export type SubscriptionTier = 'free' | 'pro' | 'premium';

export interface SubscriptionLimits {
  tier: SubscriptionTier;
  pantryScansPerMonth: number;
  aiRequestsPerMonth: number;
  recipesPerHousehold: number;
  householdMembers: number;
}

const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    tier: 'free',
    pantryScansPerMonth: 0,
    aiRequestsPerMonth: 20,
    recipesPerHousehold: 50,
    householdMembers: 3,
  },
  pro: {
    tier: 'pro',
    pantryScansPerMonth: 10,
    aiRequestsPerMonth: 100,
    recipesPerHousehold: 500,
    householdMembers: 5,
  },
  premium: {
    tier: 'premium',
    pantryScansPerMonth: Infinity,
    aiRequestsPerMonth: Infinity,
    recipesPerHousehold: Infinity,
    householdMembers: 10,
  },
};

/**
 * Get the subscription tier for a user
 */
export async function getUserSubscriptionTier(userId: string): Promise<SubscriptionTier> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  return (profile?.subscription_tier as SubscriptionTier) || 'free';
}

/**
 * Get the subscription limits for a user
 */
export async function getSubscriptionLimits(userId: string): Promise<SubscriptionLimits> {
  const tier = await getUserSubscriptionTier(userId);
  return SUBSCRIPTION_LIMITS[tier];
}

/**
 * Check if a user has access to a specific feature
 */
export async function checkSubscriptionAccess(
  userId: string,
  feature: 'pantry_scanning' | 'ai_meal_planning' | 'advanced_nutrition'
): Promise<boolean> {
  const tier = await getUserSubscriptionTier(userId);

  switch (feature) {
    case 'pantry_scanning':
      return tier === 'pro' || tier === 'premium';
    case 'ai_meal_planning':
      return true; // Available to all tiers, but with different limits
    case 'advanced_nutrition':
      return tier === 'premium';
    default:
      return false;
  }
}

/**
 * Check if a user has exceeded their monthly AI request quota
 */
export async function checkAIQuota(userId: string): Promise<{ allowed: boolean; remaining: number; resetDate?: Date }> {
  const supabase = await createClient();
  const limits = await getSubscriptionLimits(userId);

  // Premium users have unlimited requests
  if (limits.tier === 'premium') {
    return { allowed: true, remaining: Infinity };
  }

  // Get user's AI usage for the current month
  const { data: settings } = await supabase
    .from('user_settings')
    .select('ai_requests_used, ai_requests_reset_at')
    .eq('user_id', userId)
    .single();

  if (!settings) {
    // No settings yet, create default
    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);
    resetDate.setDate(1);
    resetDate.setHours(0, 0, 0, 0);

    await supabase
      .from('user_settings')
      .insert({
        user_id: userId,
        ai_requests_used: 0,
        ai_requests_reset_at: resetDate.toISOString()
      });

    return {
      allowed: true,
      remaining: limits.aiRequestsPerMonth,
      resetDate
    };
  }

  // Check if quota should be reset
  const resetDate = new Date(settings.ai_requests_reset_at);
  const now = new Date();

  if (now >= resetDate) {
    // Reset the quota
    const newResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    await supabase
      .from('user_settings')
      .update({
        ai_requests_used: 0,
        ai_requests_reset_at: newResetDate.toISOString()
      })
      .eq('user_id', userId);

    return {
      allowed: true,
      remaining: limits.aiRequestsPerMonth,
      resetDate: newResetDate
    };
  }

  const used = settings.ai_requests_used || 0;
  const remaining = Math.max(0, limits.aiRequestsPerMonth - used);

  return {
    allowed: remaining > 0,
    remaining,
    resetDate
  };
}

/**
 * Increment AI request usage for a user
 */
export async function incrementAIUsage(userId: string): Promise<void> {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from('user_settings')
    .select('ai_requests_used')
    .eq('user_id', userId)
    .single();

  const currentUsage = settings?.ai_requests_used || 0;

  await supabase
    .from('user_settings')
    .update({
      ai_requests_used: currentUsage + 1
    })
    .eq('user_id', userId);
}

/**
 * Check pantry scan quota for a user
 */
export async function checkPantryScanQuota(userId: string): Promise<{
  allowed: boolean;
  remaining: number | 'unlimited';
  resetDate?: Date;
}> {
  const limits = await getSubscriptionLimits(userId);

  // Free users don't have access
  if (limits.tier === 'free') {
    return { allowed: false, remaining: 0 };
  }

  // Premium users have unlimited scans
  if (limits.tier === 'premium') {
    return { allowed: true, remaining: 'unlimited' };
  }

  const supabase = await createClient();

  // Pro users have monthly limits
  const { data: settings } = await supabase
    .from('user_settings')
    .select('pantry_scans_used, pantry_scans_reset_at')
    .eq('user_id', userId)
    .single();

  if (!settings) {
    // No settings yet, create default
    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);
    resetDate.setDate(1);
    resetDate.setHours(0, 0, 0, 0);

    await supabase
      .from('user_settings')
      .insert({
        user_id: userId,
        pantry_scans_used: 0,
        pantry_scans_reset_at: resetDate.toISOString()
      });

    return {
      allowed: true,
      remaining: limits.pantryScansPerMonth,
      resetDate
    };
  }

  // Check if quota should be reset
  const resetDate = new Date(settings.pantry_scans_reset_at);
  const now = new Date();

  if (now >= resetDate) {
    // Reset the quota
    const newResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    await supabase
      .from('user_settings')
      .update({
        pantry_scans_used: 0,
        pantry_scans_reset_at: newResetDate.toISOString()
      })
      .eq('user_id', userId);

    return {
      allowed: true,
      remaining: limits.pantryScansPerMonth,
      resetDate: newResetDate
    };
  }

  const used = settings.pantry_scans_used || 0;
  const remaining = Math.max(0, limits.pantryScansPerMonth - used);

  return {
    allowed: remaining > 0,
    remaining,
    resetDate
  };
}