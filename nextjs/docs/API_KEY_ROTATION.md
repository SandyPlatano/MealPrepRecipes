# API Key Rotation Guide

This document outlines the process for rotating API keys used in the MealPrepRecipes application. Regular key rotation is a security best practice.

## Overview

The application uses the following external services that require API keys:

| Service | Keys | Rotation Frequency |
|---------|------|-------------------|
| Supabase | Anon Key, Service Role Key | Annually or if compromised |
| Stripe | Publishable Key, Secret Key, Webhook Secret | Annually or if compromised |
| Anthropic | API Key | Quarterly or if compromised |
| Resend | API Key | Annually or if compromised |
| Google | Client ID, Client Secret | Annually or if compromised |

## Pre-Rotation Checklist

- [ ] Schedule rotation during low-traffic period
- [ ] Notify team members of planned rotation
- [ ] Have access to Vercel dashboard for environment variable updates
- [ ] Test in development/staging first if possible

---

## 1. Supabase Keys

### Keys to Rotate
- `NEXT_PUBLIC_SUPABASE_URL` - Usually doesn't change
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public, but can be rotated
- `SUPABASE_SERVICE_ROLE_KEY` - Critical, rotate if exposed

### Rotation Steps

1. **Go to Supabase Dashboard**
   - Navigate to: Project Settings → API

2. **Generate New Keys**
   - Supabase doesn't support direct key rotation
   - For compromised keys: Create a new project and migrate data
   - For preventive rotation: Contact Supabase support

3. **Update Environment Variables**
   ```bash
   # Update in Vercel
   vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

   vercel env rm SUPABASE_SERVICE_ROLE_KEY production
   vercel env add SUPABASE_SERVICE_ROLE_KEY production
   ```

4. **Redeploy**
   ```bash
   vercel --prod
   ```

5. **Verify**
   - Test authentication flow
   - Test database operations

---

## 2. Stripe Keys

### Keys to Rotate
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Public key
- `STRIPE_SECRET_KEY` - Secret key (critical)
- `STRIPE_WEBHOOK_SECRET` - Webhook verification

### Rotation Steps

1. **Go to Stripe Dashboard**
   - Navigate to: Developers → API keys

2. **Roll API Keys**
   - Click "Roll key" next to the secret key
   - Stripe provides a grace period where both old and new keys work
   - Default: 24 hours (can be extended to 72 hours)

3. **Update Webhook Secret**
   - Go to Developers → Webhooks
   - Click on your webhook endpoint
   - Click "Reveal" under Signing secret to get current secret
   - Or create a new endpoint and delete the old one

4. **Update Environment Variables**
   ```bash
   # Update in Vercel
   vercel env rm STRIPE_SECRET_KEY production
   vercel env add STRIPE_SECRET_KEY production

   vercel env rm STRIPE_WEBHOOK_SECRET production
   vercel env add STRIPE_WEBHOOK_SECRET production
   ```

5. **Redeploy**
   ```bash
   vercel --prod
   ```

6. **Verify**
   - Test checkout flow
   - Test webhook delivery (check Stripe dashboard)
   - Verify subscription management works

### Important Notes
- Stripe's key rolling provides overlap period - use it!
- Test webhooks using Stripe CLI during rotation:
  ```bash
  stripe listen --forward-to localhost:3000/api/stripe/webhook
  ```

---

## 3. Anthropic API Key

### Keys to Rotate
- `ANTHROPIC_API_KEY`

### Rotation Steps

1. **Go to Anthropic Console**
   - Navigate to: https://console.anthropic.com/settings/keys

2. **Create New Key**
   - Click "Create Key"
   - Name it with date (e.g., "MealPrep-Prod-2025-01")
   - Copy the new key immediately (shown only once)

3. **Update Environment Variables**
   ```bash
   vercel env rm ANTHROPIC_API_KEY production
   vercel env add ANTHROPIC_API_KEY production
   ```

4. **Redeploy**
   ```bash
   vercel --prod
   ```

5. **Verify**
   - Test recipe parsing
   - Test nutrition extraction
   - Test meal suggestions

6. **Delete Old Key**
   - After verification, delete the old key in Anthropic Console

---

## 4. Resend API Key

### Keys to Rotate
- `RESEND_API_KEY`

### Rotation Steps

1. **Go to Resend Dashboard**
   - Navigate to: https://resend.com/api-keys

2. **Create New Key**
   - Click "Create API Key"
   - Set appropriate permissions (sending only)
   - Copy the new key

3. **Update Environment Variables**
   ```bash
   vercel env rm RESEND_API_KEY production
   vercel env add RESEND_API_KEY production
   ```

4. **Redeploy**
   ```bash
   vercel --prod
   ```

5. **Verify**
   - Test shopping list email sending
   - Check Resend dashboard for delivery

6. **Delete Old Key**
   - Delete the old key in Resend dashboard

---

## 5. Google OAuth Credentials

### Keys to Rotate
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### Rotation Steps

1. **Go to Google Cloud Console**
   - Navigate to: APIs & Services → Credentials

2. **Create New OAuth Client**
   - Click "Create Credentials" → "OAuth client ID"
   - Configure same redirect URIs as existing client:
     - `https://babewfd.com/api/auth/callback/google`
     - `https://babewfd.com/api/google/callback`

3. **Update Environment Variables**
   ```bash
   vercel env rm GOOGLE_CLIENT_ID production
   vercel env add GOOGLE_CLIENT_ID production

   vercel env rm GOOGLE_CLIENT_SECRET production
   vercel env add GOOGLE_CLIENT_SECRET production
   ```

4. **Redeploy**
   ```bash
   vercel --prod
   ```

5. **Verify**
   - Test Google Sign-In
   - Test Google Calendar integration

6. **Delete Old Credentials**
   - Wait 24-48 hours for active sessions to expire
   - Delete old OAuth client in Google Cloud Console

---

## Post-Rotation Checklist

- [ ] All environment variables updated in Vercel
- [ ] Application redeployed
- [ ] Authentication working (email + Google)
- [ ] Stripe payments processing
- [ ] Webhooks receiving events
- [ ] AI features working (recipe parsing, nutrition)
- [ ] Email sending working
- [ ] Google Calendar sync working
- [ ] Old keys deleted from service dashboards
- [ ] Document rotation date in changelog

## Emergency Key Rotation

If a key is compromised:

1. **Immediately rotate the compromised key** following steps above
2. **Check audit logs** for unauthorized usage:
   - Stripe: Dashboard → Developers → Logs
   - Supabase: Dashboard → Logs
   - Anthropic: Console → Usage
3. **Review recent transactions/operations** for anomalies
4. **Consider rotating related keys** if breach scope is unknown
5. **Document incident** for future reference

## Environment Variable Locations

| Environment | Location |
|-------------|----------|
| Production | Vercel Dashboard → Project → Settings → Environment Variables |
| Development | Local `.env.local` file |
| CI/CD | GitHub Actions secrets (if applicable) |

## Vercel CLI Quick Reference

```bash
# List current environment variables
vercel env ls production

# Remove an environment variable
vercel env rm VARIABLE_NAME production

# Add an environment variable (interactive)
vercel env add VARIABLE_NAME production

# Pull environment variables to local
vercel env pull .env.local
```
