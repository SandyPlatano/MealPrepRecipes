# Payment Flow Testing Guide

This document outlines how to test the Stripe payment flow for MealPrepRecipes.

## Test Environment Setup

### Stripe Test Mode
Ensure you're using Stripe test keys (prefix `sk_test_` and `pk_test_`) when testing.

### Test Credit Cards
Use these Stripe test cards:

| Scenario | Card Number | CVC | Expiry |
|----------|-------------|-----|--------|
| Successful payment | 4242 4242 4242 4242 | Any 3 digits | Any future date |
| Declined card | 4000 0000 0000 0002 | Any 3 digits | Any future date |
| Requires authentication | 4000 0025 0000 3155 | Any 3 digits | Any future date |
| Insufficient funds | 4000 0000 0000 9995 | Any 3 digits | Any future date |

## Manual Test Checklist

### 1. Pricing Page Display
- [ ] Navigate to `/pricing`
- [ ] Verify all three tiers display correctly (Free, Pro $7, Premium $12)
- [ ] Verify feature comparison table loads
- [ ] Verify FAQ section displays

### 2. Unauthenticated User Flow
- [ ] Click "Upgrade to Pro" while logged out
- [ ] Verify redirect to `/login?redirect=/pricing`
- [ ] Log in and verify redirect back to pricing

### 3. Checkout Session Creation
- [ ] Log in with test account
- [ ] Navigate to `/pricing`
- [ ] Click "Upgrade to Pro"
- [ ] Verify loading state shows on button
- [ ] Verify redirect to Stripe Checkout

### 4. Stripe Checkout Page
- [ ] Verify correct product name shows ("Babe What's For Dinner - Pro")
- [ ] Verify correct price ($7/month)
- [ ] Verify customer email is pre-filled
- [ ] Enter test card details
- [ ] Complete payment

### 5. Post-Payment
- [ ] Verify redirect to `/settings/billing?success=true`
- [ ] Verify subscription status updated in database
- [ ] Verify user can access Pro features

### 6. Cancellation Flow
- [ ] Navigate to Settings
- [ ] Click "Manage Subscription" (Stripe Customer Portal)
- [ ] Cancel subscription
- [ ] Verify webhook processes cancellation
- [ ] Verify user downgraded to Free tier

## Webhook Testing

### Local Development
Use Stripe CLI to forward webhooks:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Production Verification
Check webhook events in Stripe Dashboard:
1. Go to Developers > Webhooks
2. Click on your endpoint
3. View recent events and their status

### Events to Verify
- [ ] `checkout.session.completed` - Creates subscription
- [ ] `customer.subscription.updated` - Updates status
- [ ] `customer.subscription.deleted` - Handles cancellation
- [ ] `invoice.payment_succeeded` - Records successful payment
- [ ] `invoice.payment_failed` - Handles failed payment

## Database Verification

After successful payment, verify in Supabase:

```sql
-- Check user_settings subscription fields
SELECT
  user_id,
  subscription_tier,
  subscription_status,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_started_at
FROM user_settings
WHERE user_id = '<user-id>';
```

## Common Issues

### Issue: Checkout session fails with 401
**Cause**: User not authenticated
**Solution**: Redirect to login first

### Issue: Price ID not configured
**Cause**: Missing environment variable
**Solution**: Check `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO` and `NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM`

### Issue: Webhook signature verification fails
**Cause**: Incorrect webhook secret
**Solution**: Update `STRIPE_WEBHOOK_SECRET` to match Stripe Dashboard

### Issue: Subscription not updated in database
**Cause**: Webhook not receiving events or database error
**Solution**: Check Stripe webhook logs and application logs

## Production Verification Checklist

Before going live, verify:

- [ ] Stripe account is in live mode
- [ ] All environment variables use live keys (sk_live_, pk_live_)
- [ ] Webhook endpoint is configured for live events
- [ ] Test a real payment with small amount (consider using a coupon for 100% off)
- [ ] Verify refund process works
- [ ] Verify cancellation works

## Monitoring

### Stripe Dashboard Monitoring
- Monitor failed payments in Stripe Dashboard
- Set up Stripe alerts for failed charges
- Review webhook event logs weekly

### Application Monitoring
- Check error logs for webhook failures
- Monitor subscription status changes
- Track conversion rate from Free to Paid
