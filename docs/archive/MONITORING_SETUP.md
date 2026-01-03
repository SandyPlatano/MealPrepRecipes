# Monitoring and Analytics Setup Guide

This guide will help you set up error tracking and analytics for your production deployment.

## 1. Sentry (Error Tracking) - Recommended

Sentry provides real-time error tracking and performance monitoring.

### Setup Steps:

1. **Create a Sentry Account**
   - Go to [https://sentry.io/signup/](https://sentry.io/signup/)
   - Create a free account (includes 5,000 errors/month)

2. **Create a New Project**
   - Choose "Next.js" as your platform
   - Copy your DSN (Data Source Name)

3. **Add Environment Variable**
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn-here
   ```

4. **Add to Vercel**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add `NEXT_PUBLIC_SENTRY_DSN` with your DSN
   - Apply to all environments (Production, Preview, Development)

5. **Redeploy**
   - Trigger a new deployment for the changes to take effect

### What Sentry Tracks:

- ✅ Runtime errors and exceptions
- ✅ Failed API requests
- ✅ Client-side JavaScript errors
- ✅ Server-side errors
- ✅ Performance issues (optional)
- ✅ Session replays (optional)

---

## 2. Vercel Analytics - Recommended

Vercel Analytics provides insights into your app's performance and usage.

### Setup Steps:

1. **Enable in Vercel Dashboard**
   - Go to your project in Vercel
   - Navigate to "Analytics" tab
   - Click "Enable Analytics"

2. **No code changes needed** - Analytics are automatically tracked!

### What Vercel Analytics Tracks:

- ✅ Page views and unique visitors
- ✅ Real User Monitoring (RUM) metrics
- ✅ Web Vitals (LCP, FID, CLS, TTFB)
- ✅ Geographic distribution of users

**Cost:** Free for 100k events/month, then $10/month

---

## 3. Upstash Redis (Rate Limiting) - Optional but Recommended

Your app already supports Upstash Redis for production-grade rate limiting.

### Setup Steps:

1. **Create Upstash Account**
   - Go to [https://console.upstash.com/](https://console.upstash.com/)
   - Sign up for free (10,000 commands/day included)

2. **Create a Redis Database**
   - Click "Create Database"
   - Choose a region close to your Vercel deployment region
   - Select "Free" tier

3. **Copy Credentials**
   - Copy the REST URL and Token

4. **Add Environment Variables**
   ```bash
   UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token-here
   ```

5. **Add to Vercel**
   - Add both variables to your Vercel environment variables
   - Apply to all environments

### Benefits:

- ✅ Consistent rate limiting across all serverless function instances
- ✅ Protects against API abuse
- ✅ Better than in-memory rate limiting on serverless

**Note:** The app will fall back to in-memory rate limiting if Redis is not configured.

---

## 4. Uptime Monitoring - Optional

Set up external monitoring to alert you if your site goes down.

### Recommended Services:

**UptimeRobot** (Free tier: 50 monitors, 5-minute checks)
- [https://uptimerobot.com/](https://uptimerobot.com/)
- Setup: Add your domain and email for alerts

**Better Uptime** (Free tier: 10 monitors)
- [https://betterstack.com/better-uptime](https://betterstack.com/better-uptime)
- Setup: Add your domain and configure alerts

---

## Summary Checklist

- [ ] Sentry DSN configured in Vercel
- [ ] Vercel Analytics enabled
- [ ] Upstash Redis configured (optional)
- [ ] Uptime monitoring set up (optional)
- [ ] Test error tracking by triggering a test error
- [ ] Verify analytics are appearing in Vercel dashboard

---

## Testing Your Setup

### Test Sentry Error Tracking:

1. Deploy your app with Sentry configured
2. Temporarily add a test error to a page:
   ```typescript
   // Add this to any client component
   throw new Error("Test Sentry error");
   ```
3. Visit that page
4. Check Sentry dashboard for the error
5. Remove the test error and redeploy

### Test Vercel Analytics:

1. Visit your deployed site
2. Navigate through a few pages
3. Wait a few minutes
4. Check the Analytics tab in Vercel dashboard

---

## Cost Estimate (Monthly)

| Service | Free Tier | Typical Cost |
|---------|-----------|--------------|
| Sentry | 5,000 errors | Free (or $26/month for more) |
| Vercel Analytics | 100k events | Free (or $10/month for more) |
| Upstash Redis | 10k commands/day | Free (or $0.20/100k commands) |
| Uptime Monitoring | 50 monitors | Free |

**Total for small-medium app: $0-10/month** (most apps fit in free tiers!)
