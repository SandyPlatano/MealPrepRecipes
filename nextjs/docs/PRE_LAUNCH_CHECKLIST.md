# Pre-Launch Testing Checklist

Complete this checklist before launching to production.

## 1. Authentication Flows

### Email/Password Signup
- [ ] Navigate to `/signup`
- [ ] Enter valid email and password
- [ ] Verify confirmation email received
- [ ] Click confirmation link
- [ ] Verify redirect to app dashboard
- [ ] Verify user profile created in database

### Email/Password Login
- [ ] Navigate to `/login`
- [ ] Enter valid credentials
- [ ] Verify successful login
- [ ] Verify redirect to `/app`
- [ ] Test "Remember me" functionality
- [ ] Test invalid credentials error message

### Password Reset
- [ ] Navigate to `/forgot-password`
- [ ] Enter registered email
- [ ] Verify reset email received
- [ ] Click reset link
- [ ] Enter new password
- [ ] Verify login works with new password

### Google OAuth
- [ ] Click "Sign in with Google" on login page
- [ ] Complete Google authentication
- [ ] Verify profile created with Google info
- [ ] Verify profile picture imported
- [ ] Test logout and re-login with Google

### Session Management
- [ ] Verify session persists across page refreshes
- [ ] Verify session expires after inactivity (if configured)
- [ ] Test logout functionality
- [ ] Verify protected routes redirect to login

## 2. Email Functionality (Resend)

### Shopping List Email
- [ ] Create a meal plan with recipes
- [ ] Click "Send Shopping List"
- [ ] Verify email received
- [ ] Verify email formatting is correct
- [ ] Verify all ingredients included
- [ ] Test rate limiting (10 emails/hour max)

### Transactional Emails
- [ ] Verify signup confirmation email
- [ ] Verify password reset email
- [ ] Check email deliverability (not in spam)
- [ ] Verify "from" address is correct

### Email Configuration
```
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@babewfd.com
```

## 3. Payment Flow (Stripe)

### Checkout
- [ ] Navigate to `/pricing`
- [ ] Click "Upgrade to Pro"
- [ ] Verify redirect to Stripe Checkout
- [ ] Complete payment with test card `4242 4242 4242 4242`
- [ ] Verify redirect to success page
- [ ] Verify subscription active in database

### Subscription Management
- [ ] Access Customer Portal via Settings
- [ ] Verify current plan displayed
- [ ] Test updating payment method
- [ ] Test cancellation flow
- [ ] Verify downgrade to free tier after cancellation

### Webhook Events
- [ ] Verify `checkout.session.completed` processed
- [ ] Verify `customer.subscription.updated` processed
- [ ] Verify `customer.subscription.deleted` processed
- [ ] Check Stripe webhook logs for errors

## 4. Core Features

### Recipe Management
- [ ] Create new recipe manually
- [ ] Import recipe from URL
- [ ] Edit existing recipe
- [ ] Delete recipe
- [ ] Add recipe to favorites
- [ ] Search recipes
- [ ] Filter by category/tags

### Meal Planning
- [ ] Add recipe to meal plan
- [ ] Assign cook to meal
- [ ] Move meals between days (drag & drop)
- [ ] Remove meal from plan
- [ ] View weekly calendar
- [ ] Navigate between weeks

### Shopping List
- [ ] Generate shopping list from meal plan
- [ ] Check off items
- [ ] Add custom items
- [ ] Remove items
- [ ] Send list via email

### Household
- [ ] Create household
- [ ] Invite member (if implemented)
- [ ] Share recipes within household
- [ ] View shared meal plans

## 5. Mobile Responsiveness

### Test on Mobile Devices
- [ ] iPhone Safari
- [ ] iPhone Chrome
- [ ] Android Chrome
- [ ] Android Samsung Browser

### Key Pages to Test
- [ ] Homepage
- [ ] Login/Signup
- [ ] Recipe list
- [ ] Recipe detail
- [ ] Meal planner (drag & drop)
- [ ] Shopping list
- [ ] Settings

### Mobile-Specific
- [ ] Touch interactions work
- [ ] Swipe gestures (if any)
- [ ] Keyboard doesn't cover inputs
- [ ] Proper viewport scaling
- [ ] PWA installation works

## 6. Cross-Browser Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)

### Test Areas
- [ ] Layout and styling
- [ ] Form submissions
- [ ] Modal dialogs
- [ ] Animations/transitions
- [ ] Local storage functionality

## 7. Performance

### Page Load Times
- [ ] Homepage < 3 seconds
- [ ] App dashboard < 2 seconds
- [ ] Recipe page < 2 seconds

### Core Web Vitals
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1

### Tools
- Use Chrome DevTools Lighthouse
- Use PageSpeed Insights: https://pagespeed.web.dev/
- Use WebPageTest: https://webpagetest.org/

## 8. Security

### Authentication
- [ ] Passwords properly hashed
- [ ] Session tokens secure
- [ ] CSRF protection enabled
- [ ] Rate limiting on login attempts

### Data Protection
- [ ] RLS policies active on all tables
- [ ] User can only access own data
- [ ] API routes check authentication
- [ ] Sensitive data not exposed in responses

### Headers
- [ ] HTTPS enforced
- [ ] HSTS header present
- [ ] CSP header configured
- [ ] X-Frame-Options set

## 9. Error Handling

### User-Facing Errors
- [ ] 404 page displays correctly
- [ ] 500 errors show friendly message
- [ ] Form validation errors clear
- [ ] Network errors handled gracefully

### Monitoring
- [ ] Sentry capturing errors
- [ ] Error alerts configured
- [ ] Health check endpoint responding

## 10. SEO & Social

### Meta Tags
- [ ] Title tags unique per page
- [ ] Meta descriptions present
- [ ] Open Graph tags working
- [ ] Twitter cards working

### Verification
- [ ] Test with Facebook Sharing Debugger
- [ ] Test with Twitter Card Validator
- [ ] Verify og-image.png exists and displays

### Search Engines
- [ ] robots.txt accessible
- [ ] sitemap.xml accessible
- [ ] Submit sitemap to Google Search Console

## 11. Legal & Compliance

### Required Pages
- [ ] Privacy Policy accessible
- [ ] Terms of Service accessible
- [ ] Cookie consent banner working

### Data Handling
- [ ] Account deletion works
- [ ] Data export available (if required)
- [ ] GDPR compliance (if applicable)

## 12. Environment Variables

### Verify All Set in Production
```bash
vercel env ls production
```

Required variables:
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO`
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM`
- [ ] `ANTHROPIC_API_KEY`
- [ ] `RESEND_API_KEY`
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`

## 13. Final Checks

### Before Launch
- [ ] Remove any test data from production database
- [ ] Verify Stripe is in live mode
- [ ] Update all API keys to production keys
- [ ] Test real payment (can refund immediately)
- [ ] Set up monitoring alerts
- [ ] Prepare rollback plan

### Launch Day
- [ ] Deploy final version
- [ ] Verify health check endpoint
- [ ] Monitor error rates for first hour
- [ ] Check payment processing
- [ ] Monitor server resources

### Post-Launch
- [ ] Respond to any immediate issues
- [ ] Monitor user feedback
- [ ] Track key metrics
- [ ] Schedule follow-up review

---

## Quick Test Commands

```bash
# Check health endpoint
curl https://babewfd.com/api/health

# Verify sitemap
curl https://babewfd.com/sitemap.xml

# Verify robots.txt
curl https://babewfd.com/robots.txt

# Run Lighthouse audit
npx lighthouse https://babewfd.com --view
```

## Testing Credentials

### Stripe Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

### Test User (create in staging)
- Email: test@babewfd.com
- Password: [stored securely]
