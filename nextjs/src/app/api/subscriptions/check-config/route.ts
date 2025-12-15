import { NextResponse } from 'next/server';

/**
 * Diagnostic endpoint to check Stripe configuration
 * This helps identify missing environment variables
 * PROTECTED: Only accessible in development mode
 */
export async function GET() {
  // Only allow in development - block in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is disabled in production' },
      { status: 403 }
    );
  }

  const config = {
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_PRICE_ID_PRO: !!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
    NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM: !!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM,
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
  };

  const missing = Object.entries(config)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_key, isSet]) => !isSet)
    .map(([key]) => key);

  const allConfigured = missing.length === 0;

  return NextResponse.json({
    configured: allConfigured,
    missing,
    config: {
      // Show first few characters to verify format without exposing secrets
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY
        ? `${process.env.STRIPE_SECRET_KEY.substring(0, 7)}...`
        : 'NOT SET',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        ? `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 7)}...`
        : 'NOT SET',
      NEXT_PUBLIC_STRIPE_PRICE_ID_PRO: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || 'NOT SET',
      NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM || 'NOT SET',
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
        ? `${process.env.STRIPE_WEBHOOK_SECRET.substring(0, 7)}...`
        : 'NOT SET',
    },
  });
}

