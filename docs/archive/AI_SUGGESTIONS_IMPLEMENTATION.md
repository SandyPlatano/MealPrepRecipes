# AI Meal Suggestions Feature - Implementation Status

## ✅ COMPLETED (Phase 1-3)

### Phase 1: Stripe Subscription Infrastructure
- [x] Installed Stripe packages (`stripe`, `@stripe/stripe-js`)
- [x] Created subscription types (`/src/types/subscription.ts`)
- [x] Created AI suggestion types (`/src/types/ai-suggestion.ts`)
- [x] Created Stripe client (`/src/lib/stripe/client.ts`)
- [x] Created subscription helpers (`/src/lib/stripe/subscription.ts`)
- [x] Created database migration (`/supabase/migrations/20251211_subscriptions_and_ai_quota.sql`)
  - `subscriptions` table with RLS
  - `ai_suggestion_logs` table with RLS
  - Added `ai_suggestions_remaining` and `ai_suggestions_reset_at` to `user_settings`
  - Created `decrement_ai_quota()` function
- [x] Updated cached queries to include subscription data
- [x] Created Stripe webhook handler (`/src/app/api/webhooks/stripe/route.ts`)
  - Handles `checkout.session.completed`
  - Handles `customer.subscription.updated`
  - Handles `customer.subscription.deleted`
  - Handles `invoice.payment_failed`
- [x] Created subscription management API routes:
  - `/api/subscriptions/create-checkout`
  - `/api/subscriptions/create-portal`
  - `/api/subscriptions/status`
- [x] Created pricing UI components:
  - `PricingCards.tsx`
  - `UpgradeModal.tsx`
  - `pricing-cards-client.tsx`

### Phase 2: AI Meal Suggestions Backend
- [x] Created AI prompt engineering system (`/src/lib/ai/meal-suggestion-prompt.ts`)
  - Context builder for user recipes, history, favorites, allergens
  - Support for library-only and mixed modes
  - Protein variety and complexity balancing rules
  - Response parser with validation
- [x] Created AI suggestion API route (`/src/app/api/ai/suggest-meals/route.ts`)
  - Pro/Premium subscription check
  - Quota management (5 for Pro, unlimited for Premium)
  - Rate limiting (10 requests/hour)
  - Claude API integration
  - Suggestion logging
- [x] Created AI suggestion server actions (`/src/app/actions/ai-meal-suggestions.ts`)
  - `generateAIMealSuggestions()`
  - `acceptAllSuggestions()` - saves new AI-generated recipes to library
  - `swapSingleSuggestion()`
  - `checkAIQuota()`
- [x] Created quota reset cron job (`/src/app/api/cron/reset-ai-quota/route.ts`)
- [x] Configured Vercel cron (`vercel.json`)

### Phase 3: AI Suggestions UI Components
- [x] Created `AISuggestionCard.tsx` component
  - Displays recipe title, cuisine, protein, prep time
  - Shows AI reasoning
  - Lock checkbox
  - Swap button
  - "New Recipe!" badge for AI-generated recipes
- [x] Created `AISuggestionModal.tsx` component
  - 7-day grid layout
  - Loading states
  - Lock/unlock days
  - Regenerate all
  - Swap individual meals
  - Accept all
  - Quota counter
  - Error handling

## 🚧 TODO (Remaining Work)

### Phase 3 Continued: Mobile Optimization
- [ ] Create mobile-optimized version with bottom sheet (Sheet component)
- [ ] Add swipe gestures for individual swaps
- [ ] Test responsive layout on various screen sizes
- [ ] Optimize for pull-to-refresh on mobile

### Phase 4: Integration
- [ ] Integrate AI suggestion button into meal plan page (`/app/(app)/app/plan/page.tsx`)
  - Add "✨ AI Suggest Meals" button
  - Show upgrade modal for free users
  - Show quota exhausted state
  - Wire up the `AISuggestionModal`
- [ ] Add subscription status badge to navigation
- [ ] Update settings page to show subscription management
  - Display current plan
  - "Manage Subscription" button → Stripe portal
  - AI quota display

### Phase 5: Environment Setup
- [ ] Add environment variables to `.env.local`:
  ```
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=price_...
  NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM=price_...
  CRON_SECRET=your_random_secret
  ANTHROPIC_API_KEY=sk-ant-... (already set)
  ```
- [ ] Create Stripe products/prices in Stripe Dashboard:
  - Pro: $7/month
  - Premium: $12/month
- [ ] Configure Stripe webhook in Dashboard pointing to `/api/webhooks/stripe`
- [ ] Add environment variables to Vercel project settings

### Phase 6: Database Migration
- [ ] Run the migration:
  ```bash
  npx supabase db push
  ```
  Or if using Supabase CLI:
  ```bash
  supabase migration up
  ```

### Phase 7: Testing
- [ ] Test Stripe checkout flow (use test mode)
- [ ] Test webhook handling (use Stripe CLI: `stripe listen --forward-to localhost:3001/api/webhooks/stripe`)
- [ ] Test AI suggestion generation
- [ ] Test quota management
- [ ] Test new recipe generation and saving
- [ ] Test mobile experience
- [ ] Test error states

### Phase 8: Polish & Edge Cases
- [ ] Add loading skeletons
- [ ] Add empty states
- [ ] Handle API timeouts gracefully
- [ ] Add retry logic for failed Claude API calls
- [ ] Add analytics tracking (optional)
- [ ] Update documentation

## 📊 Quota Configuration

- **Free Tier**: 0 AI suggestions per week
- **Pro Tier ($7/month)**: **5 AI suggestions per week** (resets Monday 00:00 UTC)
- **Premium Tier ($12/month)**: Unlimited AI suggestions

## 🎯 Key Features Implemented

1. **Full Stripe Integration**
   - Checkout sessions
   - Customer portal
   - Webhook handling
   - Subscription status tracking

2. **AI Meal Suggestions**
   - Personalized based on user's recipe library, history, and preferences
   - Respects allergen alerts and dietary restrictions
   - Ensures protein variety and complexity balance
   - Generates NEW recipes when user's library is insufficient
   - Saves AI-generated recipes to user's library automatically
   - Provides reasoning for each suggestion

3. **Quota Management**
   - 5 regenerations per week for Pro users
   - Unlimited for Premium users
   - Weekly reset via cron job (Mondays at 00:00 UTC)
   - Database-backed quota tracking

4. **Rich UI**
   - Beautiful modal with suggestion cards
   - Lock individual days
   - Swap single meals without regenerating all
   - Visual indicators for new AI-generated recipes
   - Loading and error states

## 🚀 Next Steps to Deploy

1. Run database migration
2. Set up Stripe products and add price IDs to environment variables
3. Configure Stripe webhook
4. Add remaining UI integration (AI button on meal plan page)
5. Test thoroughly in test mode
6. Deploy to production
7. Switch Stripe to live mode

## 📝 Notes

- All code follows existing patterns in the codebase
- Uses shadcn/ui components for consistency
- Server actions for data mutations
- Proper TypeScript typing throughout
- RLS policies for security
- Rate limiting to prevent abuse
- Comprehensive error handling
