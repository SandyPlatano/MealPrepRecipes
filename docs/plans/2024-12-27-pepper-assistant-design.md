# Pepper: Conversational Recipe Assistant

> Design document for the AI-powered chat assistant feature

**Created:** 2024-12-27
**Status:** Approved

---

## Overview

Pepper is a playful, always-available chat assistant that helps users with meal planning, recipe discovery, cooking questions, and pantry-based suggestions. Accessible via a floating chat bubble on any page.

### Key Decisions

| Aspect | Decision |
|--------|----------|
| Entry Point | Floating chat bubble (bottom-right) |
| Personality | Playful food friend - emojis, puns, encouraging |
| Name | Pepper |
| Context Access | Full access to recipes, pantry, preferences, history |
| Capabilities | Pantry-to-plate, meal planning, cooking help, recipe discovery |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Your App (any page)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   [Main Content]                           ┌──────────────┐ │
│                                            │  💬 Chat     │ │
│                                            │   Bubble     │ │
│                                            └──────┬───────┘ │
│                                                   │         │
│                                            ┌──────▼───────┐ │
│                                            │  Slide-out   │ │
│                                            │    Panel     │ │
│                                            │              │ │
│                                            │ ┌──────────┐ │ │
│                                            │ │ Messages │ │ │
│                                            │ └──────────┘ │ │
│                                            │ ┌──────────┐ │ │
│                                            │ │  Input   │ │ │
│                                            │ └──────────┘ │ │
│                                            └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Data Flow:**
```
User Message → Server Action → Claude API (with context) → Response → UI Update
                    ↓
         [Recipes, Pantry, Preferences, History]
```

---

## Personality Design

### Character: Pepper

**Traits:**
- Uses food emojis liberally
- Drops cooking puns ("Lettuce help you out!")
- Celebrates wins ("You're on a roll!")
- Never judgmental ("No shame in takeout nights!")
- Keeps responses concise but warm

### Sample Conversations

```
User: I have chicken and broccoli
Pepper: Ooh, power combo! I found 3 recipes in your collection:
        - Honey Garlic Chicken Stir-fry (25 min)
        - Creamy Chicken & Broccoli Pasta (30 min)
        - Sheet Pan Lemon Chicken (40 min)
        Which one sounds good?

User: Plan my week
Pepper: Let's cook up a plan! Quick questions:
        - Any nights you're eating out?
        - Feeling adventurous or comfort food vibes?

User: How long do I bake salmon at 400?
Pepper: 12-15 minutes at 400°F for a 1-inch fillet!
        Pro tip: It's done when it flakes easily with a fork.
        Want me to set a timer?

User: Find me something new with beef
Pepper: Adventure time! Based on your tastes, you might love:
        - Korean Beef Bowls (you loved that bibimbap!)
        - Beef Stroganoff (cozy vibes)
        [+ Import from web] option
```

---

## Database Schema

```sql
-- Chat sessions (persisted conversations)
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id, updated_at DESC);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id, created_at);

-- RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their chat sessions"
  ON chat_sessions FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage messages in their sessions"
  ON chat_messages FOR ALL
  USING (
    session_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    )
  );
```

---

## Context Injection

```typescript
interface PepperContext {
  // User's data
  recipes: RecipeSummary[];        // All their recipes (id, title, ingredients, tags)
  pantry: PantryItem[];            // Current pantry inventory
  preferences: DietaryPreferences; // Restrictions, favorites, dislikes
  mealHistory: RecentMeal[];       // Last 30 days of cooked meals
  currentMealPlan: MealPlan;       // This week's plan

  // Conversation context
  recentMessages: Message[];       // Last 10 messages for continuity
}
```

---

## UI Components

### Chat Bubble (collapsed)
- Fixed position bottom-right
- 44x44px touch target
- Pepper icon with subtle bounce animation
- Badge shows unread count

### Slide-out Panel (expanded)
- 400px wide, slides from right
- Header with minimize/close buttons
- Scrollable message thread
- Input area with send button
- Quick action chips below input

### Quick Action Chips
- Plan my week
- Shopping help
- What can I make?
- Cooking tips

### Animations
- Bubble: gentle pulse when Pepper has a suggestion
- Panel: smooth slide-in (300ms ease-out)
- Messages: fade-in as they appear
- Typing indicator: bouncing dots

---

## Claude API Integration

### System Prompt

```typescript
const PEPPER_SYSTEM_PROMPT = `You are Pepper, a playful and friendly kitchen assistant for "Babe, What's for Dinner?"

PERSONALITY:
- Warm, encouraging, never judgmental
- Use food emojis liberally
- Drop cooking puns when natural ("Lettuce help!", "You're on a roll!")
- Keep responses concise (2-4 sentences typical)
- Celebrate wins ("Nice pick!")

CAPABILITIES:
1. PANTRY-TO-PLATE: Match user ingredients to their saved recipes
2. MEAL PLANNING: Suggest weekly plans based on preferences and history
3. COOKING HELP: Answer cooking questions, times, temperatures, substitutions
4. RECIPE DISCOVERY: Recommend recipes from their collection or suggest imports

CONTEXT PROVIDED:
- User's recipe collection (titles, ingredients, cook times)
- Pantry inventory
- Dietary restrictions and preferences
- Recent meal history (avoid repeats)
- Current week's meal plan

RESPONSE FORMAT:
- When suggesting recipes, use structured format with recipe cards
- For cooking tips, be specific with times/temps
- For meal planning, ask clarifying questions first
- Always offer a next step or follow-up question

BOUNDARIES:
- Only suggest recipes from their collection unless asked for new ideas
- Respect dietary restrictions (never suggest allergens)
- If unsure, ask clarifying questions`;
```

### Tool Definitions

```typescript
const tools = [
  {
    name: "search_recipes",
    description: "Search user's recipe collection by ingredients or tags",
    input_schema: {
      type: "object",
      properties: {
        ingredients: { type: "array", items: { type: "string" } },
        tags: { type: "array", items: { type: "string" } }
      }
    }
  },
  {
    name: "add_to_meal_plan",
    description: "Add a recipe to the user's meal plan",
    input_schema: {
      type: "object",
      properties: {
        recipe_id: { type: "string" },
        day: { type: "string" },
        meal_type: { type: "string" }
      },
      required: ["recipe_id", "day", "meal_type"]
    }
  },
  {
    name: "add_to_shopping_list",
    description: "Add items to the shopping list",
    input_schema: {
      type: "object",
      properties: {
        items: { type: "array", items: { type: "string" } }
      },
      required: ["items"]
    }
  }
];
```

---

## File Structure

```
nextjs/src/
├── components/pepper/
│   ├── pepper-bubble.tsx        # Floating button
│   ├── pepper-panel.tsx         # Slide-out container
│   ├── pepper-message.tsx       # Individual message
│   ├── pepper-recipe-card.tsx   # Inline recipe suggestion
│   ├── pepper-input.tsx         # Input + quick actions
│   └── pepper-typing.tsx        # Typing indicator
├── hooks/
│   └── use-pepper.ts            # State management + API calls
├── lib/ai/
│   └── pepper-prompt.ts         # System prompt + context builder
├── app/actions/
│   └── pepper.ts                # Server actions for chat
├── app/api/pepper/
│   └── route.ts                 # Streaming API endpoint
└── types/
    └── pepper.ts                # TypeScript interfaces

supabase/migrations/
└── XXXXXX_add_pepper_chat.sql   # Chat tables
```

---

## Implementation Phases

| Phase | Description | Effort |
|-------|-------------|--------|
| 1 | Database migration + TypeScript types | 2-3 hours |
| 2 | Basic UI (bubble, panel, messages) | 4-5 hours |
| 3 | Claude API integration with streaming | 3-4 hours |
| 4 | Context injection (recipes, pantry, prefs) | 2-3 hours |
| 5 | Tool use (search, add to plan, shopping) | 3-4 hours |
| 6 | Polish (animations, quick actions, history) | 3-4 hours |

**Total Estimated Effort:** 18-23 hours

---

## Success Criteria

- [ ] Chat bubble visible on all authenticated pages
- [ ] Panel slides open/closed smoothly
- [ ] Messages stream in real-time
- [ ] Pepper correctly searches user's recipes by ingredients
- [ ] Pepper can add recipes to meal plan via tool use
- [ ] Pepper can add items to shopping list
- [ ] Conversation history persists across sessions
- [ ] Pepper respects dietary restrictions
- [ ] Quick action chips trigger appropriate flows
- [ ] Works on mobile (responsive panel)

---

*Design approved: 2024-12-27*
