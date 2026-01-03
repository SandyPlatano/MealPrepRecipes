# Deployment Guide

This guide covers deploying "Babe, What's for Dinner?" to production.

## Pre-Deployment Checklist

### 1. Email Configuration

The application references these email addresses in the Privacy Policy and Terms of Service:

- `privacy@babewhatsfordinner.com`
- `legal@babewhatsfordinner.com`
- `support@babewhatsfordinner.com` (mentioned in README)

**Action Required:**
1. Set up email forwarding for these addresses to your actual email
2. Or set up email accounts in your domain's email service
3. Monitor these inboxes regularly for user inquiries

### 2. Environment Variables

Ensure all environment variables are set in your deployment platform (Vercel):

#### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `NEXT_PUBLIC_APP_URL` - Your production URL (e.g., https://babewhatsfordinner.com)
- `ANTHROPIC_API_KEY` - Your Anthropic API key for recipe parsing

#### Required for Email Features
- `RESEND_API_KEY` - Your Resend API key
- `RESEND_FROM_EMAIL` - A verified email address in Resend (e.g., noreply@babewhatsfordinner.com)

#### Required for Google Calendar Integration
- `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth client secret

### 3. Supabase Setup

1. **Database Migrations**
   - Run all migrations in order from `supabase/migrations/`
   - Verify Row Level Security (RLS) policies are enabled

2. **Authentication Setup**
   - Configure email templates in Supabase Auth settings
   - Set up Google OAuth provider if using calendar integration
   - Set redirect URLs (both localhost for dev and production URL)

3. **Security**
   - Verify RLS policies are enabled on all tables
   - Test with different user roles to ensure data isolation

### 4. Domain Setup

1. **DNS Configuration**
   - Point your domain to Vercel
   - Set up SSL certificate (automatic in Vercel)

2. **Email Domain Verification**
   - Verify your domain in Resend
   - Add necessary DNS records (SPF, DKIM, DMARC)

### 5. Google OAuth Setup (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3001/auth/google/callback` (for development)
   - `https://yourdomain.com/auth/google/callback` (for production)
6. Set consent screen information

### 6. Resend Email Setup

1. Sign up at [Resend](https://resend.com/)
2. Verify your domain
3. Create an API key
4. Add DNS records to your domain for email verification
5. Send a test email to verify configuration

## Deployment Steps

### Deploy to Vercel

1. **Connect Repository**
   ```bash
   # Install Vercel CLI (optional)
   npm i -g vercel
   
   # Or use Vercel dashboard to import from GitHub
   ```

2. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Root Directory: `nextjs`

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from env.example
   - Make sure to use production values

4. **Deploy**
   ```bash
   vercel --prod
   # Or push to main branch if using GitHub integration
   ```

## Post-Deployment

### 1. Test Core Features

- [ ] User signup and email verification
- [ ] Login (email and Google OAuth)
- [ ] Recipe creation and import
- [ ] Meal planning
- [ ] Shopping list generation
- [ ] Email sending (shopping lists)
- [ ] Google Calendar integration
- [ ] Account deletion

### 2. Monitor

Set up monitoring for:
- API errors (consider adding Sentry)
- Rate limit violations
- Email delivery failures
- Database performance

### 3. Set Up Analytics (Optional)

Consider adding:
- Vercel Analytics
- Google Analytics
- PostHog
- Plausible

### 4. Security Review

- [ ] Review security headers in production
- [ ] Test rate limiting
- [ ] Verify RLS policies work correctly
- [ ] Test SSRF protection on scrape-url endpoint
- [ ] Confirm all API endpoints require authentication

## Monitoring & Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check email inbox (privacy@, legal@, support@)

**Weekly:**
- Review Anthropic API usage and costs
- Check Resend email delivery rates
- Review user feedback

**Monthly:**
- Update dependencies
- Review security advisories
- Backup database
- Review rate limiting effectiveness

### Cost Monitoring

**Estimated Monthly Costs:**
- Vercel: $0 (Hobby) or $20 (Pro)
- Supabase: $0 (Free) or $25 (Pro)
- Anthropic API: ~$0.50 per 100 recipe parses
- Resend: $0 for 3,000 emails/month, then $0.80 per 1,000
- Google Calendar API: Free

### Scaling Considerations

When you hit limits on free tiers:

1. **Supabase Free Tier Limits**
   - 500MB database size
   - 2GB bandwidth
   - 50,000 monthly active users
   - Upgrade to Pro: $25/month

2. **Anthropic API Costs**
   - Monitor usage in Anthropic console
   - Consider caching parsed recipes
   - Implement retry logic for failures

3. **Resend Email Limits**
   - 3,000 emails/month free
   - $20/month for 50,000 emails

4. **Rate Limiting**
   - Current implementation uses in-memory storage
   - For multiple Vercel instances, upgrade to Redis-based rate limiting
   - Consider Upstash Redis ($0.20 per 100,000 commands)

## Troubleshooting

### Common Issues

**1. Email not sending**
- Check Resend API key is correct
- Verify domain is verified in Resend
- Check DNS records (SPF, DKIM)
- Look at Resend logs

**2. Google OAuth fails**
- Verify redirect URLs are correct
- Check client ID and secret
- Ensure Google Calendar API is enabled

**3. Recipe parsing errors**
- Check Anthropic API key
- Monitor API quotas
- Check if rate limiting is being hit

**4. Database connection issues**
- Verify Supabase credentials
- Check if project is paused (free tier)
- Review connection pooling settings

### Getting Help

- Check Supabase logs
- Review Vercel function logs
- Check browser console for client errors
- Review Network tab in DevTools

## Security Incident Response

If you suspect a security breach:

1. Immediately rotate all API keys and secrets
2. Review Supabase auth logs for suspicious activity
3. Check for unusual API usage patterns
4. Review rate limit logs
5. Notify affected users if data was compromised
6. Document the incident and resolution

## Backup Strategy

**Database Backups:**
- Supabase Pro includes automatic daily backups
- Free tier: Manual exports recommended weekly
- Export SQL dumps via Supabase dashboard

**Code Backups:**
- Git repository (already handled)
- Vercel deployment history

**Configuration Backups:**
- Document all environment variables (use password manager)
- Keep copy of DNS records
- Document OAuth settings

## Going Live Checklist

- [ ] All environment variables configured
- [ ] Email addresses set up and monitored
- [ ] Domain pointed correctly
- [ ] SSL certificate active
- [ ] Database migrations run
- [ ] RLS policies tested
- [ ] Google OAuth configured (if using)
- [ ] Resend domain verified
- [ ] All core features tested in production
- [ ] Error monitoring set up
- [ ] Backup strategy in place
- [ ] Privacy policy reviewed
- [ ] Terms of service reviewed
- [ ] Cookie consent banner working
- [ ] Rate limiting tested
- [ ] Security headers verified

## Support Contacts

**Services Support:**
- Vercel: https://vercel.com/support
- Supabase: https://supabase.com/support
- Resend: https://resend.com/support
- Anthropic: https://support.anthropic.com/

---

Ready to launch? 🚀

