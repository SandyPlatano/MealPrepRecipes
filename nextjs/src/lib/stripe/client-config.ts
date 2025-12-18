import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripeClient = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.warn('Stripe publishable key not found. Payment features will not work.');
      stripePromise = Promise.resolve(null);
    } else {
      stripePromise = loadStripe(key);
    }
  }
  return stripePromise;
};

// Price IDs from environment
export const STRIPE_PRICE_IDS = {
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || '',
  premium: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM || '',
} as const;

// Subscription tiers configuration
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '20 AI meal suggestions per month',
      'Up to 50 recipes',
      'Basic meal planning',
      'Shopping list generation',
      '3 household members',
    ],
    limits: {
      aiSuggestions: 20,
      recipes: 50,
      householdMembers: 3,
      pantryScans: 0,
      customRecipeTypes: 10,
    },
  },
  pro: {
    name: 'Pro',
    price: 7,
    priceId: STRIPE_PRICE_IDS.pro,
    features: [
      '100 AI meal suggestions per month',
      'Up to 500 recipes',
      'Advanced meal planning',
      'Smart pantry scanning (10 scans/month)',
      'Google Calendar sync',
      '5 household members',
      'Priority support',
    ],
    limits: {
      aiSuggestions: 100,
      recipes: 500,
      householdMembers: 5,
      pantryScans: 10,
      customRecipeTypes: 10,
    },
  },
  premium: {
    name: 'Premium',
    price: 12,
    priceId: STRIPE_PRICE_IDS.premium,
    features: [
      'Unlimited AI meal suggestions',
      'Unlimited recipes',
      'Advanced nutrition tracking',
      'Unlimited pantry scanning',
      'Google Calendar sync',
      '10 household members',
      'Priority support',
      'Early access to new features',
    ],
    limits: {
      aiSuggestions: Infinity,
      recipes: Infinity,
      householdMembers: 10,
      pantryScans: Infinity,
      customRecipeTypes: 10,
    },
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;