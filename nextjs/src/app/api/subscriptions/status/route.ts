import { NextResponse } from 'next/server';
import { getCachedUserWithHousehold } from '@/lib/supabase/cached-queries';

export async function GET() {
  try {
    const { subscription, user } = await getCachedUserWithHousehold();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!subscription) {
      // Return default free tier
      return NextResponse.json({
        tier: 'free',
        status: 'active',
        has_payment_method: false,
      });
    }

    return NextResponse.json({
      tier: subscription.tier,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      has_payment_method: !!subscription.stripe_customer_id,
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    );
  }
}
