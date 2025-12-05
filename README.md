# Babe, What's for Dinner?

Finally, an answer. A meal planning app for couples and families who are tired of the nightly "what do you want?" debate.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

## Features

### 🍳 Recipe Management
- **AI-Powered Import**: Paste any recipe URL and AI extracts ingredients, instructions, and cook times automatically
- **Unlimited Recipes**: Save as many recipes as you want, organized by type and category
- **Smart Tagging**: Categorize by protein type, cuisine, meal type, and custom tags
- **Favorites & Ratings**: Mark your go-to recipes and rate them after cooking

### 📅 Weekly Meal Planning
- **Drag-and-Drop Planning**: Easy visual interface to plan your week
- **Cook Assignment**: Assign meals to different household members
- **Google Calendar Integration**: Sync your meal plan to your calendar (Pro feature)
- **Meal History**: Track what you've cooked and when

### 🛒 Smart Shopping Lists
- **Auto-Generated Lists**: Automatically created from your weekly meal plan
- **Organized by Category**: Items grouped by grocery store sections
- **Email Integration**: Send shopping lists directly to your email
- **Ingredient Scaling**: Adjust serving sizes on the fly

### 👥 Household Sharing
- **Multi-User**: Share recipes and meal plans with your partner or family
- **Collaborative Planning**: Everyone can see and contribute to the meal plan
- **Individual Preferences**: Each user can have their own favorites

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth with email and Google OAuth
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **AI**: [Anthropic Claude](https://www.anthropic.com/) for recipe parsing
- **Email**: [Resend](https://resend.com/) for transactional emails
- **Deployment**: [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([sign up free](https://supabase.com/))
- Anthropic API key ([get one here](https://console.anthropic.com/))
- Resend API key (optional, for email features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/MealPrepRecipes.git
cd MealPrepRecipes/nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` with your actual values:
- Supabase URL and anon key from your project settings
- Anthropic API key for recipe parsing
- (Optional) Resend API key and verified email for shopping lists
- (Optional) Google OAuth credentials for calendar integration

4. Set up the database:
   - Go to your Supabase project SQL Editor
   - Run the migrations in order from `supabase/migrations/`

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Database Setup

The application uses Supabase with PostgreSQL. Run these migrations in order:

1. `000_drop_existing.sql` - Clean slate (only if resetting)
2. `001_initial_schema.sql` - Core tables and triggers
3. `002_rls_policies.sql` - Row Level Security policies
4. `003_fix_signup_trigger.sql` - User signup automation
5. `004_update_cooking_history.sql` - Cooking history improvements
6. `005_fix_household_members_recursion.sql` - Performance fixes
7. `007_add_base_servings.sql` - Ingredient scaling support
8. `20251204154125_split_name_into_first_last.sql` - Name field updates
9. `20251204160000_add_google_calendar_to_user_settings.sql` - Calendar integration
10. `20251205_add_meal_plan_sent_at.sql` - Tracking sent meal plans

## Project Structure

```
nextjs/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (app)/             # Authenticated app routes
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (marketing)/       # Public pages (privacy, terms)
│   │   ├── actions/           # Server actions
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── recipes/          # Recipe-related components
│   │   ├── meal-plan/        # Meal planning components
│   │   └── settings/         # Settings components
│   ├── lib/                   # Utilities and helpers
│   │   ├── supabase/         # Supabase clients
│   │   ├── email/            # Email templates
│   │   └── rate-limit.ts     # Rate limiting
│   └── types/                 # TypeScript type definitions
├── supabase/
│   └── migrations/            # Database migrations
└── public/                    # Static assets
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com/)
3. Add environment variables in Vercel project settings
4. Deploy

### Environment Variables for Production

Make sure to set these in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)
- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Security Features

- ✅ Row Level Security (RLS) on all database tables
- ✅ Rate limiting on API endpoints
- ✅ SSRF protection on URL scraping
- ✅ Authentication required for all sensitive operations
- ✅ Security headers (CSP, HSTS, etc.)
- ✅ GDPR-compliant cookie consent
- ✅ Input validation and sanitization

## API Endpoints

### Public Endpoints
- `POST /api/auth/*` - Authentication callbacks

### Protected Endpoints (require authentication)
- `POST /api/parse-recipe` - AI recipe parsing (rate limited: 20/hour)
- `POST /api/scrape-url` - Recipe URL scraping (rate limited: 30/hour)
- `POST /api/send-shopping-list` - Email shopping lists (rate limited: 10/hour)
- `POST /api/google-calendar/create-events` - Create calendar events
- `POST /api/google-calendar/exchange-token` - OAuth token exchange
- `POST /api/google-calendar/disconnect` - Disconnect calendar

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Roadmap

### Current Features (Free Tier)
- ✅ Unlimited recipes with AI import
- ✅ Weekly meal planning
- ✅ Auto-generated shopping lists
- ✅ Cooking history tracking
- ✅ Recipe ratings and favorites

### Planned Features (Pro Tier - $5/month)
- 🔜 Household sharing
- 🔜 Google Calendar sync
- 🔜 Email shopping lists
- 🔜 Recipe scaling
- 🔜 AI meal suggestions
- 🔜 Nutrition information
- 🔜 Dietary restriction filters
- 🔜 Mobile app

## License

This project is proprietary software. All rights reserved.

## Support

For support, email support@babewhatsfordinner.com or open an issue in this repository.

## Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Anthropic](https://www.anthropic.com/) for Claude AI
- All the couples who are tired of the "what's for dinner?" debate

---

Made with love (and mild guilt) 💕
