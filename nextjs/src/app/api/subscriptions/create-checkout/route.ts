import { NextResponse } from 'next/server';
import { stripe, getStripe } from '@/lib/stripe/client';
import { getCachedUser } from '@/lib/supabase/cached-queries';
import type { SubscriptionTier } from '@/types/subscription';

export async function POST(req: Request) {
  try {
    const { user } = await getCachedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Stripe is configured
    if (!stripe) {
      console.error('Stripe is not configured. STRIPE_SECRET_KEY is missing.');
      return NextResponse.json(
        { error: 'Payment system is not configured. Please contact support.' },
        { status: 500 }
      );
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
      const missingEnvVar = tier === 'pro' 
        ? 'NEXT_PUBLIC_STRIPE_PRICE_ID_PRO' 
        : 'NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM';
      console.error(`Price ID not configured. Missing: ${missingEnvVar}`);
      return NextResponse.json(
        { error: `Price ID not configured for ${tier} tier. Please contact support.` },
        { status: 500 }
      );
    }

    // Get success and cancel URLs
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const successUrl = `${origin}/app/settings?subscription=success`;
    const cancelUrl = `${origin}/pricing?subscription=canceled`;

    // Get tier details for better checkout experience
    const tierName = tier === 'pro' ? 'Pro' : 'Premium';

    // Create Stripe checkout session with enhanced branding
    const stripeInstance = getStripe();
    const session = await stripeInstance.checkout.sessions.create({
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
        description: `Babe What's For Dinner - ${tierName}`,
      },
      custom_text: {
        submit: {
          message: `Welcome to ${tierName}! 🍳 Start planning amazing meals right away.`,
        },
        after_submit: {
          message: 'Your subscription will be activated immediately. Cancel anytime from your account settings.',
        },
      },
      allow_promotion_codes: true,
      // Add billing address collection for better customer data
      billing_address_collection: 'auto',
      // Add phone number collection (optional but helpful)
      phone_number_collection: {
        enabled: false,
      },
    });

    if (!session.url) {
      console.error('Stripe session created but URL is missing');
      return NextResponse.json(
        { error: 'Failed to generate checkout URL. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    // Log full error details for debugging
    const err = error as { message?: string; type?: string; code?: string; statusCode?: number };
    console.error('Error creating checkout session:', {
      message: err?.message,
      type: err?.type,
      code: err?.code,
      statusCode: err?.statusCode,
      raw: error,
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create checkout session';

    if (err?.type === 'StripeInvalidRequestError') {
      // Stripe API errors
      if (err?.code === 'resource_missing') {
        errorMessage = 'Invalid price ID. Please check your Stripe configuration.';
      } else if (err?.code === 'api_key_expired' || err?.code === 'invalid_api_key') {
        errorMessage = 'Invalid Stripe API key. Please check your configuration.';
      } else {
        errorMessage = err.message || 'Invalid Stripe configuration';
      }
    } else if (err?.message) {
      errorMessage = err.message;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        // Include error code in development for debugging
        ...(process.env.NODE_ENV === 'development' && {
          debug: {
            type: err?.type,
            code: err?.code,
            statusCode: err?.statusCode,
          },
        }),
      },
      { status: 500 }
    );
  }
}
