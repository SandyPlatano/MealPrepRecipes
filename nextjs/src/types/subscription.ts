export type SubscriptionTier = 'free' | 'pro' | 'premium';

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  tier: SubscriptionTier;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  name: string;
  tier: SubscriptionTier;
  price: number;
  interval: 'month' | 'year';
  stripePriceId: string;
  features: string[];
  aiSuggestionsPerWeek: number | 'unlimited';
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    name: 'Free',
    tier: 'free',
    price: 0,
    interval: 'month',
    stripePriceId: '',
    aiSuggestionsPerWeek: 0,
    features: [
      'Unlimited recipes',
      'Basic meal planning',
      'Shopping list generation',
      'Recipe import',
      'Cooking history tracking',
    ],
  },
  {
    name: 'Pro',
    tier: 'pro',
    price: 7,
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || '',
    aiSuggestionsPerWeek: 5,
    popular: true,
    features: [
      'Everything in Free',
      '5 AI meal suggestions per week',
      'Household sharing',
      'Google Calendar sync',
      'Email shopping lists',
      'Recipe scaling',
      'Priority support',
    ],
  },
  {
    name: 'Premium',
    tier: 'premium',
    price: 12,
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM || '',
    aiSuggestionsPerWeek: 'unlimited',
    features: [
      'Everything in Pro',
      'Unlimited AI meal suggestions',
      'Advanced meal planning',
      'Custom integrations',
      'Priority support',
      'Early access to new features',
    ],
  },
];

export function getQuotaForTier(tier: SubscriptionTier): number | null {
  if (tier === 'free') return 0;
  if (tier === 'pro') return 5;
  if (tier === 'premium') return null; // unlimited
  return 0;
}

export function hasFeatureAccess(
  tier: SubscriptionTier,
  feature: 'ai_suggestions' | 'household_sharing' | 'google_calendar' | 'email_lists'
): boolean {
  if (tier === 'free') return false;
  if (tier === 'pro' || tier === 'premium') return true;
  return false;
}
