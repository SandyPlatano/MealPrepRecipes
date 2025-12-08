# Features Not Built Yet - Summary

Based on competitor research and current codebase analysis, here are the features that users want but haven't been implemented yet.

---

## 🔴 HIGH PRIORITY - Most Requested Features

### 1. **Grocery Delivery Integration** ⭐⭐⭐⭐⭐
**Status:** ❌ Not Built  
**What Users Want:**
- Export shopping lists directly to Instacart, Amazon Fresh, Walmart+, etc.
- One-click "Add to Cart" functionality
- Integration with major grocery delivery APIs

**Current State:**
- ✅ Shopping list generation exists
- ✅ Email shopping list exists
- ❌ No direct API integration with delivery services

**Why It Matters:** This is the #1 requested feature - users are frustrated with manual entry into delivery apps.

---

### 2. **"Use What You Have" Recipe Suggestions** ⭐⭐⭐⭐⭐
**Status:** ❌ Not Built  
**What Users Want:**
- Recipe suggestions based on pantry inventory
- Filter recipes by "what's in my pantry"
- Reduce food waste by using existing ingredients

**Current State:**
- ✅ Pantry items table exists (`pantry_items`)
- ✅ Pantry CRUD operations exist
- ❌ No recipe search/filter by pantry ingredients
- ❌ No "use what you have" feature

**Why It Matters:** Users love this feature - it reduces waste and saves money.

---

### 3. **Recipe Notes & Modifications System** ⭐⭐⭐⭐
**Status:** ⚠️ Partially Built  
**What Users Want:**
- Save personal recipe modifications
- "My version" of recipes (different from original)
- Recipe notes that persist and are easy to edit

**Current State:**
- ✅ Recipe `notes` field exists in database
- ✅ Notes can be added when marking as cooked (`cooking_history.modifications`)
- ❌ No dedicated "My Recipe Version" system
- ❌ No easy way to save modifications as a new recipe variant
- ❌ Notes are basic text, not structured modifications

**Why It Matters:** Users want to save their tweaks and personal recipe variations.

---

### 4. **Family/Household Meal Planning** ⭐⭐⭐⭐
**Status:** ⚠️ Partially Built  
**What Users Want:**
- Different serving sizes per person
- "Who's eating what" meal planning
- Per-person dietary restrictions
- Collaborative real-time planning

**Current State:**
- ✅ Household members table exists
- ✅ Household sharing exists
- ✅ Cook assignment exists
- ❌ No per-person serving sizes
- ❌ No per-person dietary restrictions
- ❌ No "family mode" with different servings for kids/adults

**Why It Matters:** Real families have different needs - kids vs adults, different portions, etc.

---

### 5. **Meal Prep Batch Mode** ⭐⭐⭐⭐
**Status:** ❌ Not Built  
**What Users Want:**
- Dedicated meal prep workflow
- Batch cooking calculator ("cook once, eat all week")
- Portion for multiple days
- Meal prep-specific UI

**Current State:**
- ✅ Recipe scaling exists (`base_servings`, ingredient scaling)
- ❌ No dedicated batch mode
- ❌ No batch size calculator
- ❌ No meal prep workflow

**Why It Matters:** Many users meal prep on Sundays - they want a dedicated workflow.

---

## 🟡 MEDIUM PRIORITY - High Value Features

### 6. **Leftover Tracking System** ⚠️
**Status:** ❌ Not Built  
**What Users Want:**
- Track leftovers from cooked meals
- See what leftovers exist before planning
- Reduce food waste

**Current State:**
- ✅ Cooking history exists
- ❌ No leftover tracking
- ❌ No leftover quantity management
- ❌ No "use leftovers" suggestions

---

### 7. **Expiration Date Tracking** ⚠️
**Status:** ❌ Not Built  
**What Users Want:**
- Track expiration dates for pantry items
- Alerts for items expiring soon
- Reduce food waste

**Current State:**
- ✅ Pantry items exist
- ✅ `last_restocked` field exists
- ❌ No expiration date field
- ❌ No expiration alerts

---

### 8. **Quick Ingredient Substitution Suggestions** ⚠️
**Status:** ⚠️ Partially Built  
**What Users Want:**
- AI-powered ingredient swap suggestions
- Quick substitution recommendations
- One-click ingredient replacement

**Current State:**
- ✅ User substitutions table exists (`user_substitutions`)
- ✅ Substitutions can be created/managed
- ❌ No AI-powered suggestions
- ❌ No quick swap UI in recipes
- ❌ No automatic substitution application

---

### 9. **Recipe Variations / "My Version" System** ⚠️
**Status:** ❌ Not Built  
**What Users Want:**
- Save personal recipe variations
- "My version" vs "Original" recipe
- Recipe branching/forking

**Current State:**
- ✅ Notes exist
- ✅ Modifications tracked in cooking history
- ❌ No recipe variation system
- ❌ No "fork recipe" functionality

---

### 10. **Enhanced Recipe Scaling UI** ⚠️
**Status:** ⚠️ Partially Built  
**What Users Want:**
- More prominent scaling controls
- Batch cooking mode
- Per-person serving preferences

**Current State:**
- ✅ Recipe scaling backend exists (`base_servings`, ingredient scaling)
- ✅ Scaling calculations work
- ❌ UI could be more prominent/intuitive
- ❌ No batch mode UI

---

### 11. **Smart Shopping List Grouping** ⚠️
**Status:** ⚠️ Partially Built  
**What Users Want:**
- Group by store section (produce, dairy, etc.)
- Quantity optimization (e.g., "buy 1 lb instead of 2x 8oz")
- Better organization

**Current State:**
- ✅ Shopping list generation exists
- ✅ Category grouping exists (basic)
- ❌ Could be smarter about store sections
- ❌ No quantity optimization

---

### 12. **Nutritional Verification System** ⚠️
**Status:** ⚠️ Partially Built  
**What Users Want:**
- User-editable nutrition info
- Source citations for nutrition data
- Verification/accuracy improvements

**Current State:**
- ✅ Nutritional info parsing exists
- ❌ No user editing capability
- ❌ No source citations
- ❌ No verification system

---

### 13. **Cost Tracking / Budget Features** ⚠️
**Status:** ❌ Not Built  
**What Users Want:**
- Cost per recipe/meal
- Grocery spending tracking
- Budget-friendly meal suggestions

**Current State:**
- ❌ No cost tracking
- ❌ No budget features
- ❌ No cost per serving calculations

---

### 14. **Custom Recipe Collections & Tags** ⚠️
**Status:** ⚠️ Partially Built  
**What Users Want:**
- Custom collections (beyond categories)
- Recipe favorites system
- User-defined tags

**Current State:**
- ✅ Recipe categories exist
- ✅ Tags array exists
- ❌ No favorites system (favorites table exists but may not be fully implemented)
- ❌ No custom collections UI

---

### 15. **Per-Person Dietary Restrictions** ⚠️
**Status:** ⚠️ Partially Built  
**What Users Want:**
- Different dietary needs per household member
- Per-person allergen tracking
- Filter recipes by person's restrictions

**Current State:**
- ✅ Household dietary preferences exist (settings)
- ✅ Allergen detection exists
- ❌ No per-person dietary restrictions
- ❌ No per-person allergen tracking

---

## 🟢 LOWER PRIORITY - Nice to Have

### 16. **Monthly Calendar View**
**Status:** ❌ Not Built  
**Current:** Weekly view only

### 17. **Recipe Favorites UI**
**Status:** ⚠️ Partially Built  
**Current:** Favorites table exists, but may need UI improvements

### 18. **Enhanced Onboarding**
**Status:** ⚠️ Partially Built  
**Current:** Basic onboarding exists, could be improved

### 19. **Interactive Tutorials/Tooltips**
**Status:** ❌ Not Built

### 20. **Community Features** (Future)
**Status:** ❌ Not Built  
- Recipe sharing
- Recipe ratings/reviews
- "Popular this week" recipes

---

## 📊 Summary by Category

### Recipe Management
- ✅ Recipe import from URLs
- ✅ Recipe notes (basic)
- ✅ Recipe scaling (backend)
- ❌ Recipe variations/"My version"
- ❌ Custom collections UI
- ⚠️ Recipe favorites (table exists, UI may need work)

### Meal Planning
- ✅ Weekly meal planning
- ✅ Drag-and-drop
- ✅ Google Calendar sync
- ❌ Meal prep batch mode
- ❌ Per-person serving sizes
- ❌ Monthly calendar view

### Shopping & Pantry
- ✅ Shopping list generation
- ✅ Pantry items management
- ✅ Email shopping lists
- ❌ Grocery delivery integration
- ❌ "Use what you have" suggestions
- ❌ Expiration date tracking
- ❌ Leftover tracking

### Household & Family
- ✅ Household members
- ✅ Household sharing
- ✅ Cook assignment
- ❌ Per-person dietary restrictions
- ❌ Collaborative real-time planning
- ❌ Family mode (different servings)

### Substitutions & Modifications
- ✅ User substitutions table
- ✅ Substitution management
- ❌ AI-powered suggestions
- ❌ Quick swap UI
- ❌ Automatic substitution application

### Nutrition & Budget
- ✅ Nutritional info parsing
- ❌ User-editable nutrition
- ❌ Cost tracking
- ❌ Budget features

---

## 🎯 Top 5 Features to Build Next

Based on user demand and impact:

1. **"Use What You Have" Recipe Suggestions** - High impact, builds on existing pantry
2. **Grocery Delivery Integration** - #1 requested feature
3. **Recipe Notes & Modifications System** - Enhance existing notes
4. **Meal Prep Batch Mode** - Dedicated workflow for meal preppers
5. **Family/Household Serving Sizes** - Per-person portions

---

## Notes

- Many features are "partially built" - the foundation exists but needs enhancement
- Some features have database tables but no UI (e.g., favorites)
- Focus on features that build on existing infrastructure for faster implementation

