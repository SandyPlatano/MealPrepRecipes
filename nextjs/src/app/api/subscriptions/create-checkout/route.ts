import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { getCachedUser } from '@/lib/supabase/cached-queries';
import type { SubscriptionTier } from '@/types/subscription';

export async function POST(req: Request) {
  try {
    const { user } = await getCachedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier }: { tier: SubscriptionTier } = await req.json();

    if (tier === 'free') {
      return NextResponse.json(
        { error: 'Cannot create checkout for free tier' },
        { status: 400 }
      );
    }

    // Get price ID based on tier
    const priceId =
      tier === 'pro'
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured' },
        { status: 500 }
      );
    }

    // Get success and cancel URLs
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const successUrl = `${origin}/app/settings?subscription=success`;
    const cancelUrl = `${origin}/pricing?subscription=canceled`;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: user.id, // Pass user ID to webhook
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        tier,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          tier,
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
