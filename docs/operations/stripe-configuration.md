# Stripe Configuration Guide

This document outlines the Stripe Dashboard configuration required for MealPrepRecipes.

## 1. Customer Portal Branding

Configure the Customer Portal to match your app branding.

### Steps:
1. Go to **Stripe Dashboard** > **Settings** > **Billing** > **Customer portal**
2. Click **Configure portal**

### Branding Settings:
- **Business name**: Babe, What's for Dinner?
- **Privacy policy**: https://babewfd.com/privacy
- **Terms of service**: https://babewfd.com/terms
- **Support phone/email**: support@babewhatsfordinner.com

### Features to Enable:
- [x] View invoices
- [x] Update payment methods
- [x] Cancel subscriptions
- [x] View subscription details
- [ ] Pause subscriptions (optional)

### Customer Portal URL:
After configuration, customers access the portal via:
`POST /api/subscriptions/create-portal`

## 2. Product Configuration

### Products:
| Product | Price | Billing |
|---------|-------|---------|
| Pro Plan | $7.00/month | Monthly recurring |
| Premium Plan | $12.00/month | Monthly recurring |

### Create Products:
1. Go to **Products** > **Add product**
2. Create "Pro Plan" - $7/month
3. Create "Premium Plan" - $12/month
4. Copy Price IDs to environment variables

### Environment Variables:
```
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM=price_xxxxx
```

## 3. Webhook Configuration

### Webhook Endpoint:
```
https://babewfd.com/api/stripe/webhook
```

### Events to Subscribe:
- `checkout.session.completed` - New subscription created
- `customer.subscription.updated` - Subscription status changed
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Successful payment
- `invoice.payment_failed` - Failed payment

### Setup Steps:
1. Go to **Developers** > **Webhooks** > **Add endpoint**
2. Enter the webhook URL
3. Select the events listed above
4. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

## 4. Payment Alerts

Configure alerts for failed payments and subscription changes.

### Email Alerts (Dashboard > Settings > Emails):
- [x] Failed payment notifications
- [x] Successful payment receipts
- [x] Subscription created
- [x] Subscription cancelled

### Developer Alerts (Dashboard > Developers > Webhooks):
- [x] Enable webhook failure notifications
- [x] Set up email alerts for consecutive failures

### Custom Alerts (Dashboard > Reports > Alerts):
1. Click **Create alert**
2. Configure alerts for:
   - Daily revenue threshold (optional)
   - Failed payment rate > 5%
   - Churn rate alerts

## 5. Fraud Prevention

### Radar Rules (Dashboard > Radar > Rules):
Recommended rules for subscription business:
- Block payments from countries you don't serve
- Block cards that have been declined > 3 times
- Review payments > $100 (unusual for $7-12 subscriptions)

### Enable 3D Secure:
1. Go to **Settings** > **Payment methods**
2. Enable 3D Secure for card payments
3. Set to "Request when required by issuer"

## 6. Tax Configuration (Optional)

### Stripe Tax:
1. Go to **Settings** > **Tax**
2. Enable automatic tax collection
3. Configure your business tax registration

### Tax Rates (Manual):
If not using Stripe Tax, configure tax rates manually in checkout.

## 7. Checkout Session Customization

The checkout session is configured in `/api/stripe/checkout/route.ts`:

```typescript
const session = await stripe.checkout.sessions.create({
  customer: customerId,
  payment_method_types: ['card'],
  line_items: [{ price: priceId, quantity: 1 }],
  mode: 'subscription',
  success_url: `${baseUrl}/settings/billing?success=true`,
  cancel_url: `${baseUrl}/pricing?canceled=true`,
  allow_promotion_codes: true, // Enable coupon codes
  billing_address_collection: 'auto',
  // Custom branding messages
  custom_text: {
    submit: {
      message: `Welcome to ${tierName}! Start planning meals.`,
    },
  },
});
```

## 8. Coupon/Promotion Codes

### Create Promotion Codes:
1. Go to **Products** > **Coupons**
2. Create coupon (e.g., "LAUNCH50" for 50% off first month)
3. Enable "Promotion codes" on the coupon
4. Share the code with users

### Code Validation:
Promotion codes are automatically validated at checkout since `allow_promotion_codes: true` is set.

## 9. Verification Checklist

Before going live:

- [ ] Products created with correct prices
- [ ] Price IDs added to environment variables
- [ ] Webhook endpoint configured and verified
- [ ] Webhook secret added to environment variables
- [ ] Customer Portal configured with branding
- [ ] Email notifications enabled
- [ ] Test checkout with test cards
- [ ] Test subscription cancellation
- [ ] Test failed payment handling
- [ ] Test webhook events (use Stripe CLI)

### Test Commands:
```bash
# Forward webhooks locally
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_failed
```

## 10. Going Live

1. Toggle **View test data** off in Stripe Dashboard
2. Update all environment variables to live keys:
   - `STRIPE_SECRET_KEY` → `sk_live_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_...`
   - `STRIPE_WEBHOOK_SECRET` → live webhook secret
   - Price IDs → live price IDs
3. Redeploy to Vercel
4. Process a real test payment
5. Monitor webhook events for first 24-48 hours

## Support Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Billing Portal Guide](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Webhook Events Reference](https://stripe.com/docs/api/events/types)
- [Testing Guide](https://stripe.com/docs/testing)
