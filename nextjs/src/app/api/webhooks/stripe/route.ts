import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';
import type Stripe from 'stripe';
import type { SubscriptionTier, SubscriptionStatus } from '@/types/subscription';
import { getQuotaForTier } from '@/types/subscription';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription as string;
          const customerId = session.customer as string;
          const userId = session.client_reference_id; // We'll pass user ID here

          if (!userId) {
            console.error('No user ID in session metadata');
            break;
          }

          // Get subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const tier = getTierFromPriceId(subscription.items.data[0].price.id);

          // Create or update subscription record
          const { error } = await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: subscription.status as SubscriptionStatus,
            tier,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          });

          if (error) {
            console.error('Error creating subscription:', error);
            break;
          }

          // Initialize AI quota for the user
          const quota = getQuotaForTier(tier);
          const nextMonday = getNextMonday(new Date());

          await supabase
            .from('user_settings')
            .update({
              ai_suggestions_remaining: quota || 999, // 999 for unlimited (premium)
              ai_suggestions_reset_at: nextMonday.toISOString(),
            })
            .eq('user_id', userId);

          console.log('Subscription created successfully for user:', userId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const tier = getTierFromPriceId(subscription.items.data[0].price.id);

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status as SubscriptionStatus,
            tier,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating subscription:', error);
          break;
        }

        // Update AI quota if tier changed
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (subData) {
          const quota = getQuotaForTier(tier);
          await supabase
            .from('user_settings')
            .update({
              ai_suggestions_remaining: quota || 999,
            })
            .eq('user_id', subData.user_id);
        }

        console.log('Subscription updated successfully:', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Mark subscription as canceled
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled' as SubscriptionStatus,
            tier: 'free',
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error deleting subscription:', error);
          break;
        }

        // Reset AI quota to 0 (free tier)
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (subData) {
          await supabase
            .from('user_settings')
            .update({
              ai_suggestions_remaining: 0,
            })
            .eq('user_id', subData.user_id);
        }

        console.log('Subscription deleted:', subscription.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due' as SubscriptionStatus,
            })
            .eq('stripe_subscription_id', subscriptionId);

          console.log('Payment failed for subscription:', subscriptionId);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Helper to determine tier from Stripe price ID
 */
function getTierFromPriceId(priceId: string): SubscriptionTier {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO) {
    return 'pro';
  }
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM) {
    return 'premium';
  }
  return 'free';
}

/**
 * Helper to get next Monday at 00:00 UTC
 */
function getNextMonday(date: Date): Date {
  const nextMonday = new Date(date);
  const dayOfWeek = nextMonday.getUTCDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  nextMonday.setUTCDate(nextMonday.getUTCDate() + daysUntilMonday);
  nextMonday.setUTCHours(0, 0, 0, 0);
  return nextMonday;
}
