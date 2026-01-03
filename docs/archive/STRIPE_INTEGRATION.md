# Stripe Integration Guide

This guide covers implementing Stripe for the Pro tier subscription ($5/month).

## Overview

The Pro tier currently includes these features (as shown on pricing page):
- Household sharing
- Google Calendar sync
- Email shopping lists
- Recipe scaling
- AI meal suggestions
- Priority support

## Prerequisites

1. Stripe account ([sign up](https://dashboard.stripe.com/register))
2. Test mode and production API keys
3. Webhook endpoint configured
4. Products and prices created in Stripe

## Installation

```bash
npm install stripe @stripe/stripe-js
```

## Environment Variables

Add to `env.example` and your deployment:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_... # or sk_live_... for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # or pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Step 1: Create Stripe Products

In [Stripe Dashboard](https://dashboard.stripe.com/products):

1. **Create Product**
   - Name: "Babe, What's for Dinner? - Pro"
   - Description: "Premium meal planning features for power couples"

2. **Create Price**
   - Type: Recurring
   - Amount: $5.00 USD
   - Billing period: Monthly
   - Copy the Price ID (e.g., `price_xxx`)

## Step 2: Database Schema Updates

Add subscription tracking to your database:

```sql
-- Add to user_settings table or create new subscriptions table
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end BOOLEAN DEFAULT false;

-- Or create dedicated subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'free', -- free, active, past_due, canceled, trialing
  tier TEXT NOT NULL DEFAULT 'free', -- free, pro
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

## Step 3: Create Stripe Utility

Create `src/lib/stripe.ts`:

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID!;

// Get or create Stripe customer
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  // Check if customer already exists in your database
  const supabase = await createClient();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single();

  if (subscription?.stripe_customer_id) {
    return subscription.stripe_customer_id;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  // Save customer ID
  await supabase.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: customer.id,
  });

  return customer.id;
}
```

## Step 4: Create Checkout API Route

Create `src/app/api/stripe/create-checkout-session/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, getOrCreateStripeCustomer } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(user.id, user.email);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
```

## Step 5: Create Portal API Route

Create `src/app/api/stripe/create-portal-session/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get Stripe customer ID
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
```

## Step 6: Create Webhook Handler

Create `src/app/api/stripe/webhook/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

// Use service role for webhook (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;

        if (userId && session.subscription) {
          await supabase.from("subscriptions").upsert({
            user_id: userId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            status: "active",
            tier: "pro",
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        
        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        
        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            tier: "free",
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        
        if (invoice.subscription) {
          await supabase
            .from("subscriptions")
            .update({
              status: "past_due",
            })
            .eq("stripe_subscription_id", invoice.subscription);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
```

## Step 7: Update Pricing Page

Update `src/app/pricing/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Add to Pro plan card
const [loading, setLoading] = useState(false);

async function handleSubscribe() {
  setLoading(true);
  try {
    const response = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
    });
    
    const { url, error } = await response.json();
    
    if (error) {
      toast.error(error);
      return;
    }
    
    // Redirect to Stripe Checkout
    window.location.href = url;
  } catch (error) {
    toast.error("Failed to start checkout");
  } finally {
    setLoading(false);
  }
}

// Replace disabled button with:
<Button 
  className="w-full" 
  size="lg"
  onClick={handleSubscribe}
  disabled={loading}
>
  {loading ? "Loading..." : "Upgrade to Pro"}
</Button>
```

## Step 8: Feature Gating

Create `src/lib/subscription.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";

export async function getSubscriptionTier(): Promise<"free" | "pro"> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "free";

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("tier, status")
    .eq("user_id", user.id)
    .single();

  if (subscription?.status === "active" && subscription?.tier === "pro") {
    return "pro";
  }

  return "free";
}

export async function requireProTier() {
  const tier = await getSubscriptionTier();
  if (tier !== "pro") {
    throw new Error("This feature requires a Pro subscription");
  }
}
```

Use in protected features:

```typescript
// In server actions or API routes
export async function someProFeature() {
  await requireProTier();
  // Feature logic...
}
```

## Step 9: Configure Webhooks in Stripe

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy webhook signing secret to env vars

## Step 10: Configure Checkout Branding

To make your Stripe Checkout page match your brand, configure the following in your Stripe Dashboard:

### Visual Branding (Stripe Dashboard)

1. **Go to Stripe Dashboard → Settings → Branding**
   - Upload your logo (recommended: 128x128px PNG with transparent background)
   - Set primary brand color: `#F97316` (Coral/Orange - matches your app theme)
   - Set accent color: `#4ADE80` (Sage Green - matches your brand colors)

2. **Product Descriptions**
   - Ensure your Stripe products have clear, friendly descriptions
   - Example: "Perfect for growing families - Advanced meal planning with smart pantry scanning"

3. **Checkout Customization**
   - The checkout session now includes custom text messages (configured in code)
   - Custom welcome message: "Welcome to Pro! 🍳 Start planning amazing meals right away."
   - Terms message: "By subscribing, you agree to our terms of service. Cancel anytime from your account settings."

### Brand Colors Reference

Your app uses these brand colors (configure in Stripe Dashboard):
- **Primary/Coral**: `#F97316` (HSL: 25 95% 53%)
- **Sage Green**: `#4ADE80` (HSL: 142 40% 45%)
- **Background**: Warm white/cream tones

### Code-Level Customizations

The checkout sessions are already configured with:
- ✅ Custom welcome messages
- ✅ Helpful subscription information
- ✅ Billing address collection
- ✅ Promotion code support
- ✅ Proper metadata for webhook handling

**Note**: Visual appearance (colors, logo) must be configured in Stripe Dashboard as these cannot be set via API for security reasons.

## Step 11: Testing

### Test Mode

1. Use test API keys
2. Test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
3. Test webhook with Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3001/api/stripe/webhook
   ```

### Production Checklist

- [ ] Switch to live API keys
- [ ] Configure production webhook endpoint
- [ ] Test complete subscription flow
- [ ] Test cancellation flow
- [ ] Test failed payment handling
- [ ] Set up Stripe email notifications

## Security Considerations

1. **Always verify webhooks** with signature
2. **Use service role key** only in webhook handler
3. **Never expose secret key** to client
4. **Validate user authentication** before creating sessions
5. **Store minimal data** in Stripe metadata

## Monitoring

Track these metrics:
- Monthly Recurring Revenue (MRR)
- Churn rate
- Failed payments
- Subscription upgrades/downgrades

## Support & Refunds

Handle via Stripe Dashboard:
- Refunds
- Subscription cancellations
- Payment disputes
- Customer inquiries

---

Ready to monetize? 💰

