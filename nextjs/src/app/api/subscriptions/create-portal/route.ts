import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { getCachedUserWithHousehold } from '@/lib/supabase/cached-queries';

export async function POST(req: Request) {
  try {
    const { subscription } = await getCachedUserWithHousehold();

    if (!subscription || !subscription.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    // Get return URL
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const returnUrl = `${origin}/app/settings`;

    // Create Stripe customer portal session
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
