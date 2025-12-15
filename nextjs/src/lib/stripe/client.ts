import Stripe from 'stripe';

// Only throw error at runtime, not during build
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Validate Stripe key format (should start with sk_test_ or sk_live_)
if (stripeSecretKey && !stripeSecretKey.match(/^sk_(test|live)_/)) {
  console.warn(
    'Warning: STRIPE_SECRET_KEY format appears invalid. Expected format: sk_test_... or sk_live_...'
  );
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    })
  : null;

// Helper function to get stripe instance safely
export function getStripe(): Stripe {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }
  return stripe;
}

export { Stripe };
