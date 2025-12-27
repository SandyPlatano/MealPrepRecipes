# Advanced Nutrition Tracking & Macro Planning - Developer Documentation

## Overview

This document provides technical documentation for the Advanced Nutrition Tracking & Macro Planning feature. It covers architecture, implementation details, API endpoints, database schema, and deployment considerations.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Database Schema](#database-schema)
3. [Type Definitions](#type-definitions)
4. [Server Actions](#server-actions)
5. [API Endpoints](#api-endpoints)
6. [UI Components](#ui-components)
7. [Pages & Routes](#pages--routes)
8. [AI Integration](#ai-integration)
9. [Calculations & Utilities](#calculations--utilities)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Performance Considerations](#performance-considerations)
13. [Security](#security)
14. [Future Enhancements](#future-enhancements)

---

## Architecture

### High-Level Design

```
┌─────────────────┐
│  User Interface │
│  (Next.js App)  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼────┐
│ Pages│  │Actions│
└───┬──┘  └──┬────┘
    │        │
    └───┬────┘
        │
    ┌───▼────────┐
    │ API Routes │
    └───┬────────┘
        │
    ┌───▼──────────┐
    │ Claude API   │
    │ (Anthropic)  │
    └──────────────┘
        │
    ┌───▼──────────┐
    │  Supabase    │
    │  (Database)  │
    └──────────────┘
```

### Key Principles

1. **Server-First**: All data fetching happens server-side using Next.js Server Actions
2. **AI-Powered**: Nutrition extraction leverages Claude AI for accuracy
3. **Progressive Enhancement**: Works without JavaScript, enhanced with it
4. **Type-Safe**: Full TypeScript coverage with strict typing
5. **Privacy-Focused**: All data scoped to user/household with RLS

---

## Database Schema

### Tables

#### `recipe_nutrition`
Stores nutrition data for recipes.

```sql
CREATE TABLE recipe_nutrition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Macronutrients
  calories DECIMAL(10, 2),
  protein_g DECIMAL(10, 2),
  carbohydrates_g DECIMAL(10, 2),
  fat_g DECIMAL(10, 2),

  -- Micronutrients
  fiber_g DECIMAL(10, 2),
  sodium_mg DECIMAL(10, 2),
  sugar_g DECIMAL(10, 2),

  -- Metadata
  serving_size TEXT,
  confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  data_source TEXT CHECK (data_source IN ('ai_extracted', 'manual', 'official_label')),
  extraction_date TIMESTAMPTZ DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(recipe_id, user_id)
);
```

#### `user_macro_goals`
Stores user's daily macro targets.

```sql
CREATE TABLE user_macro_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Daily targets
  daily_calories INTEGER,
  daily_protein_g INTEGER,
  daily_carbs_g INTEGER,
  daily_fat_g INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);
```

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_recipe_nutrition_recipe_id ON recipe_nutrition(recipe_id);
CREATE INDEX idx_recipe_nutrition_user_id ON recipe_nutrition(user_id);
CREATE INDEX idx_user_macro_goals_user_id ON user_macro_goals(user_id);
```

### Row Level Security (RLS)

```sql
-- recipe_nutrition policies
ALTER TABLE recipe_nutrition ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own nutrition data"
  ON recipe_nutrition FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition data"
  ON recipe_nutrition FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition data"
  ON recipe_nutrition FOR UPDATE
  USING (auth.uid() = user_id);

-- user_macro_goals policies
ALTER TABLE user_macro_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals"
  ON user_macro_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own goals"
  ON user_macro_goals FOR ALL
  USING (auth.uid() = user_id);
```

---

## Type Definitions

### Core Types (`/src/types/nutrition.ts`)

```typescript
export interface RecipeNutrition {
  id: string;
  recipe_id: string;
  user_id: string;

  // Macros
  calories: number | null;
  protein_g: number | null;
  carbohydrates_g: number | null;
  fat_g: number | null;

  // Micros
  fiber_g: number | null;
  sodium_mg: number | null;
  sugar_g: number | null;

  // Metadata
  serving_size: string | null;
  confidence_score: number | null;
  data_source: 'ai_extracted' | 'manual' | 'official_label';
  extraction_date: string;
  created_at: string;
  updated_at: string;
}

export interface MacroGoals {
  id: string;
  user_id: string;
  daily_calories: number | null;
  daily_protein_g: number | null;
  daily_carbs_g: number | null;
  daily_fat_g: number | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyMacroDashboard {
  week_start: string;
  total_calories: number;
  avg_protein: number;
  avg_carbs: number;
  avg_fat: number;
  days_tracked: number;
  goal_achievement: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}
```

---

## Server Actions

Located in `/src/app/actions/nutrition.ts`

### Core Actions

```typescript
// Check if nutrition tracking is enabled
export async function isNutritionTrackingEnabled(): Promise<{
  enabled: boolean;
  error?: string;
}>

// Get nutrition for a recipe
export async function getRecipeNutrition(recipeId: string): Promise<{
  data: RecipeNutrition | null;
  error?: string;
}>

// Save or update nutrition data
export async function saveRecipeNutrition(
  recipeId: string,
  nutritionData: Partial<RecipeNutrition>
): Promise<{ data: RecipeNutrition | null; error?: string }>

// Get user's macro goals
export async function getMacroGoals(): Promise<{
  data: MacroGoals | null;
  error?: string;
}>

// Save or update macro goals
export async function saveMacroGoals(
  goals: Partial<MacroGoals>
): Promise<{ data: MacroGoals | null; error?: string }>

// Get weekly nutrition dashboard
export async function getWeeklyNutritionDashboard(
  weekStart: string
): Promise<{ data: WeeklyMacroDashboard | null; error?: string }>
```

---

## API Endpoints

### Nutrition Extraction

**POST** `/api/ai/extract-nutrition`

Extracts nutrition data from recipe ingredients using Claude AI.

**Request Body:**
```json
{
  "recipeId": "uuid",
  "title": "Recipe Title",
  "ingredients": ["1 cup flour", "2 eggs"],
  "servings": 4
}
```

**Response:**
```json
{
  "nutrition": {
    "calories": 250,
    "protein_g": 12,
    "carbohydrates_g": 35,
    "fat_g": 8,
    "fiber_g": 2,
    "sodium_mg": 200,
    "sugar_g": 5,
    "confidence_score": 0.85,
    "data_source": "ai_extracted"
  }
}
```

### Tracking Status

**GET** `/api/nutrition/tracking-status`

Check if nutrition tracking is enabled for the current user.

**Response:**
```json
{
  "enabled": true
}
```

### Batch Extraction

**POST** `/api/admin/extract-nutrition-batch?limit=10&dryRun=false`

Process multiple recipes in batch.

**Query Parameters:**
- `limit`: Number of recipes to process (default: 10)
- `dryRun`: If true, only count recipes (default: false)

**Response:**
```json
{
  "message": "Processed 10 recipes, 0 failed",
  "processed": 10,
  "failed": 0,
  "skipped": 0,
  "total": 10,
  "errors": []
}
```

---

## UI Components

### Core Components (`/src/components/nutrition/`)

#### `NutritionFactsCard`
FDA-style nutrition label with edit functionality.

```tsx
<NutritionFactsCard
  nutrition={nutritionData}
  recipeId="uuid"
  servings={4}
  editable={true}
/>
```

#### `MacroDashboard`
Visual dashboard showing macro totals and goal progress.

```tsx
<MacroDashboard
  totalCalories={2100}
  avgProtein={150}
  avgCarbs={200}
  avgFat={70}
  goals={macroGoals}
/>
```

#### `NutritionBadge`
Compact badge showing calories and protein.

```tsx
<NutritionBadge
  calories={450}
  protein={25}
  size="sm"
/>
```

---

## Pages & Routes

### Main Routes

- `/app/nutrition` - Nutrition history and trends
- `/app/nutrition/help` - In-app help documentation
- `/app/nutrition/batch-extract` - Batch processing tool
- `/app/recipes/[id]` - Recipe detail with nutrition
- `/app/plan` - Meal planner with nutrition

---

## AI Integration

### Claude API Integration

The system uses Claude (Anthropic) for nutrition extraction.

**Model:** `claude-3-5-sonnet-20241022`

**Prompt Structure:**
```typescript
const prompt = `Extract nutrition information from these ingredients...
Ingredients:
${ingredients.join('\n')}

Servings: ${servings}

Return JSON with: calories, protein_g, carbohydrates_g, fat_g, etc.`;
```

**Key Features:**
- Confidence scoring
- Per-ingredient analysis
- Serving size adjustments
- USDA database references

---

## Calculations & Utilities

### Nutrition Calculations (`/src/lib/nutrition/calculations.ts`)

```typescript
// Calculate daily averages from weekly data
export function calculateDailyAverages(
  assignments: MealAssignment[],
  nutritionData: Map<string, RecipeNutrition>
): DailyAverages

// Calculate goal achievement percentage
export function calculateGoalAchievement(
  actual: number,
  goal: number
): number

// Format nutrition values for display
export function formatNutritionValue(
  value: number | null,
  unit: string
): string
```

---

## Testing

### Unit Tests

Test nutrition calculations:

```bash
npm test src/lib/nutrition/calculations.test.ts
```

### Integration Tests

Test server actions with mocked Supabase:

```bash
npm test src/app/actions/nutrition.test.ts
```

### E2E Tests

Test full nutrition tracking flow:

```bash
npm run test:e2e -- nutrition-flow
```

---

## Deployment

### Environment Variables

Required variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic (Claude)
ANTHROPIC_API_KEY=your-anthropic-api-key

# App URL (for background tasks)
NEXT_PUBLIC_APP_URL=https://your-app.com
```

### Database Migration

Run migration to create tables:

```bash
npm run db:migrate
```

Or manually execute:
```sql
-- See migration file in /supabase/migrations/
```

### Deployment Steps

1. Set environment variables
2. Run database migrations
3. Deploy Next.js app
4. Verify nutrition tracking in settings
5. Test AI extraction with sample recipe
6. Monitor API usage and costs

---

## Performance Considerations

### Optimization Strategies

1. **Caching**
   - Server actions cache results using Next.js `unstable_cache`
   - Recipe nutrition cached per user
   - Macro goals cached per user

2. **Batch Processing**
   - Process 10-20 recipes at a time
   - Sequential processing to avoid rate limits
   - Error handling doesn't block batch

3. **Database Queries**
   - Indexed lookups on recipe_id and user_id
   - RLS policies optimized for performance
   - Joins minimized with denormalization

4. **API Rate Limits**
   - Claude API: ~50 requests/min
   - Implement exponential backoff
   - Queue system for large batches

---

## Security

### Data Privacy

- All nutrition data scoped to user with RLS
- Server-side validation on all inputs
- API keys stored in environment variables
- No client-side API key exposure

### Input Validation

```typescript
// Validate recipe ID
if (!recipeId || typeof recipeId !== 'string') {
  return { error: 'Invalid recipe ID' };
}

// Validate nutrition values
if (calories && (calories < 0 || calories > 10000)) {
  return { error: 'Invalid calorie value' };
}
```

### Authentication

- All actions require authenticated user
- Server actions check `getCachedUserWithHousehold()`
- API routes verify Supabase JWT

---

## Future Enhancements

### Planned Features

1. **Nutrition Data Versioning**
   - Track changes to nutrition data over time
   - Compare old vs new extractions
   - Audit trail for manual edits

2. **Advanced Analytics**
   - Macro ratio recommendations
   - Nutrient deficiency detection
   - Meal timing analysis

3. **Integration Enhancements**
   - Restaurant menu imports
   - Barcode scanning
   - USDA database direct lookup

4. **Mobile Features**
   - Nutrition widgets
   - Push notifications for goals
   - Offline nutrition viewing

5. **Social Features**
   - Share nutrition-optimized meal plans
   - Community nutrition challenges
   - Dietitian collaboration tools

---

## API Cost Estimates

### Claude API Costs

- **Model**: Claude 3.5 Sonnet
- **Input**: ~$3 per million tokens
- **Output**: ~$15 per million tokens

**Average Cost Per Recipe:**
- Input tokens: ~500 (ingredients + prompt)
- Output tokens: ~200 (JSON response)
- Cost: ~$0.004 per recipe

**Monthly Estimates (per user):**
- 20 recipes/month: ~$0.08
- 100 recipes/month: ~$0.40
- 500 recipes/month (batch): ~$2.00

---

## Monitoring & Logging

### Key Metrics to Track

1. **Usage Metrics**
   - Recipes with nutrition data (%)
   - AI extractions per day
   - Batch processing runs
   - Manual edits vs AI extractions

2. **Performance Metrics**
   - AI extraction latency
   - Database query times
   - Page load times
   - API error rates

3. **Quality Metrics**
   - Average confidence scores
   - Manual override rate
   - User satisfaction (if collected)

### Logging Best Practices

```typescript
console.log('[Nutrition] Auto-extracted for recipe:', recipeId);
console.error('[Nutrition] Extraction failed:', error);
console.warn('[Nutrition] Low confidence score:', score);
```

---

## Contributing

### Development Setup

1. Clone repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local`
4. Set up Supabase project
5. Run migrations
6. Start dev server: `npm run dev`

### Code Style

- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Test coverage > 80%

---

## License

[Your License Here]

---

## Support

For questions or issues:
- GitHub Issues
- Documentation
- Support email

---

*Last Updated: 2025-12-11*
*Version: 1.0.0*
