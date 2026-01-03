# AI Meal Suggestions - Setup & Deployment Guide

This guide walks you through setting up Stripe subscriptions and AI meal suggestions for production deployment.

## Prerequisites

- Supabase project set up and running
- Anthropic API key (already configured)
- Stripe account (test mode first, then production)
- Vercel account for deployment

---

## Step 1: Database Migration

Run the subscription and AI quota migration:

```bash
cd /Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs

# If using Supabase CLI
supabase migration up

# Or apply manually in Supabase Dashboard SQL Editor
# Copy and paste the content of: supabase/migrations/20251211_subscriptions_and_ai_quota.sql
```

This migration creates:
- `subscriptions` table
- `ai_suggestion_logs` table
- Adds `ai_suggestions_remaining` and `ai_suggestions_reset_at` to `user_settings`
- Creates RLS policies
- Creates helper functions

---

## Step 2: Stripe Setup

### 2.1 Create Stripe Account
1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Complete registration
3. Start in **Test Mode** (toggle in top right)

### 2.2 Create Products and Prices

**Create Pro Plan ($7/month):**
1. Go to Products → Add Product
2. Name: "Babe, What's for Dinner? Pro"
3. Description: "5 AI meal suggestions per week, household sharing, Google Calendar sync, and more"
4. Pricing:
   - Price: $7.00 USD
   - Billing period: Monthly
   - Click "Add pricing"
5. **Copy the Price ID** (starts with `price_...`)

**Create Premium Plan ($12/month):**
1. Products → Add Product
2. Name: "Babe, What's for Dinner? Premium"
3. Description: "Unlimited AI meal suggestions and all Pro features"
4. Pricing:
   - Price: $12.00 USD
   - Billing period: Monthly
5. **Copy the Price ID** (starts with `price_...`)

### 2.3 Get API Keys

1. Go to Developers → API keys
2. **Copy** your:
   - Publishable key (starts with `pk_test_...`)
   - Secret key (starts with `sk_test_...` - click "Reveal test key")

### 2.4 Set Up Webhook

1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.vercel.app/api/webhooks/stripe`
   - For local testing: Use Stripe CLI (see below)
4. Description: "Subscription events"
5. Events to send: Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
6. Click "Add endpoint"
7. **Copy the Signing secret** (starts with `whsec_...`)

---

## Step 3: Environment Variables

### 3.1 Local Development (.env.local)

Create or update `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/.env.local`:

```bash
# Existing variables (keep these)
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# ... other existing vars

# NEW: Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM=price_...

# Cron Secret (generate a random string)
CRON_SECRET=your_random_secret_string_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 3.2 Vercel Production Variables

Go to your Vercel project → Settings → Environment Variables

Add the same variables as above, but with **production values**:

```
STRIPE_SECRET_KEY=sk_live_... (use live key)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (from production webhook)
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=price_... (production price ID)
NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM=price_...
CRON_SECRET=your_random_secret_string
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

**Important:** Don't forget to also set `ANTHROPIC_API_KEY` in Vercel if not already there!

---

## Step 4: Local Testing with Stripe CLI

### 4.1 Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### 4.2 Login to Stripe

```bash
stripe login
```

### 4.3 Forward Webhooks to Local Server

In a separate terminal:

```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

This will give you a webhook signing secret starting with `whsec_...`
Copy this and update your `.env.local` file's `STRIPE_WEBHOOK_SECRET`

### 4.4 Test a Payment

1. Start your app: `npm run dev`
2. Go to `http://localhost:3001/pricing`
3. Click "Upgrade to Pro"
4. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
5. Check your terminal running `stripe listen` - you should see events!
6. Check your database - you should have a new subscription record

---

## Step 5: Test AI Suggestions

### 5.1 Prerequisites
- You must have a subscription (test payment above)
- You should have some recipes in your library
- Anthropic API key must be set

### 5.2 Test Flow
1. Go to `/app/plan`
2. Click the **"✨ AI Suggest"** button
3. Wait 5-10 seconds for Claude to generate suggestions
4. You should see 7 meal suggestions
5. Try:
   - Locking a day
   - Swapping a single meal
   - Regenerating all suggestions
   - Accepting all suggestions

### 5.3 Test Quota
- Pro users get 5 regenerations per week
- Make 5 full regenerations
- On the 6th attempt, you should get a quota exhausted error
- Premium users should have unlimited

---

## Step 6: Cron Job Setup (Vercel)

The cron job resets quotas every Monday at 00:00 UTC.

### 6.1 Verify vercel.json

File already created at: `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/reset-ai-quota",
      "schedule": "0 0 * * 1"
    }
  ]
}
```

### 6.2 Deploy to Vercel

```bash
git add .
git commit -m "Add AI meal suggestions feature with Stripe subscriptions"
git push
```

Vercel will automatically detect the cron configuration!

### 6.3 Test Cron Locally

```bash
curl -H "Authorization: Bearer your_random_secret_string" \
  http://localhost:3001/api/cron/reset-ai-quota
```

You should see:
```json
{
  "success": true,
  "reset_date": "2025-01-13T00:00:00.000Z",
  "pro_users_reset": 1,
  "premium_users_updated": 0
}
```

---

## Step 7: Go Live (Production)

### 7.1 Switch Stripe to Live Mode

1. In Stripe Dashboard, toggle to **Live Mode** (top right)
2. Create the same products and prices
3. Get new live API keys (`sk_live_...` and `pk_live_...`)
4. Create production webhook pointing to your live domain
5. Update Vercel environment variables with live keys

### 7.2 Update Webhook URL

Your production webhook should point to:
```
https://your-production-domain.vercel.app/api/webhooks/stripe
```

### 7.3 Final Checklist

- [ ] Database migration applied to production Supabase
- [ ] Stripe in live mode with products created
- [ ] Production API keys in Vercel environment variables
- [ ] Production webhook configured and pointing to live URL
- [ ] Test a real payment with a real card (refund immediately)
- [ ] Test AI suggestions in production
- [ ] Monitor Stripe Dashboard for incoming payments
- [ ] Monitor Sentry for errors

---

## Step 8: Monitoring & Maintenance

### 8.1 Stripe Dashboard

Monitor:
- Subscriptions → Active subscriptions
- Payments → Successful/failed payments
- Developers → Webhooks → Check for webhook errors

### 8.2 Supabase Dashboard

Monitor:
- `subscriptions` table - verify user subscriptions
- `ai_suggestion_logs` table - track suggestion usage
- `user_settings.ai_suggestions_remaining` - verify quota tracking

### 8.3 Cost Tracking

**Claude API Costs:**
- Average: ~2300 tokens per suggestion (~$0.02-0.04)
- Pro user (5/week): ~$0.25-0.50/month
- Monitor at: https://console.anthropic.com/settings/usage

**Stripe Fees:**
- 2.9% + $0.30 per successful card charge
- Pro ($7): You receive ~$6.49
- Premium ($12): You receive ~$11.31

---

## Troubleshooting

### Issue: Webhook not receiving events

**Solution:**
1. Check webhook URL is correct
2. Verify webhook secret in environment variables
3. Check Stripe Dashboard → Developers → Webhooks for failed attempts
4. For local: Ensure `stripe listen` is running

### Issue: AI suggestions not generating

**Solution:**
1. Check `ANTHROPIC_API_KEY` is set
2. Check browser console and server logs for errors
3. Verify user has Pro/Premium subscription in database
4. Check quota hasn't been exhausted

### Issue: Subscription not created after payment

**Solution:**
1. Check webhook events in Stripe Dashboard
2. Verify `checkout.session.completed` event was sent
3. Check server logs for webhook processing errors
4. Ensure webhook secret matches

### Issue: Quota not resetting on Monday

**Solution:**
1. Check Vercel cron job logs
2. Verify `CRON_SECRET` environment variable is set
3. Test cron endpoint manually (see Step 6.3)

---

## Support

For issues or questions:
1. Check implementation docs: `AI_SUGGESTIONS_IMPLEMENTATION.md`
2. Review Stripe documentation: https://stripe.com/docs
3. Review Anthropic Claude docs: https://docs.anthropic.com
4. Check Vercel cron docs: https://vercel.com/docs/cron-jobs

---

## Success! 🎉

Your AI meal suggestions feature is now live! Users can:
- ✅ Subscribe to Pro or Premium plans
- ✅ Get personalized AI meal suggestions
- ✅ Save AI-generated recipes to their library
- ✅ Manage their subscription via Stripe portal
- ✅ Have quotas reset automatically every Monday

**Next steps:**
- Monitor usage and gather user feedback
- A/B test pricing
- Add more premium features
- Optimize Claude prompts based on user ratings
