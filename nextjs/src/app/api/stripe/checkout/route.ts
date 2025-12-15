import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/client';
import { STRIPE_PRICE_IDS } from '@/lib/stripe/client-config';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the price ID from request
    const { priceId, tier } = await request.json();

    if (!priceId || !tier) {
      return NextResponse.json({ error: 'Price ID and tier required' }, { status: 400 });
    }

    // Validate the price ID matches our configuration
    if ((tier === 'pro' && priceId !== STRIPE_PRICE_IDS.pro) ||
        (tier === 'premium' && priceId !== STRIPE_PRICE_IDS.premium)) {
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 });
    }

    const stripe = getStripe();

    // Create or get Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        metadata: {
          supabase_user_id: user.id
        }
      });

      customerId = customer.id;

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Get tier details for better checkout experience
    const tierName = tier === 'pro' ? 'Pro' : 'Premium';

    // Create checkout session with enhanced branding
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        supabase_user_id: user.id,
        tier: tier
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          tier: tier,
        },
        description: `Babe What's For Dinner - ${tierName}`,
      },
      custom_text: {
        submit: {
          message: `Welcome to ${tierName}! 🍳 Start planning amazing meals right away.`,
        },
        shipping_address: {
          message: 'Your subscription will be activated immediately after payment.',
        },
        terms_of_service_acceptance: {
          message: 'By subscribing, you agree to our terms of service. Cancel anytime from your account settings.',
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}