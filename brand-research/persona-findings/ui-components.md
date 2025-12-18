# UI Component Design Findings: "Babe, What's for Dinner?"

**Research Date:** December 18, 2025
**Researcher:** Claude (Deep Research Agent)
**Context:** Meal prep app using Next.js, Tailwind CSS, Radix UI with PostHog/Clay.com design influences

---

## Executive Summary

This research synthesizes current UI component patterns for food/meal planning apps, focusing on creating a "playful but functional" interface that balances delight with efficiency. Key findings suggest that modern food apps prioritize:

1. **Rounded, approachable components** over sharp professional edges (17-55% higher CTR)
2. **Appetite-stimulating color psychology** (reds, yellows, oranges) balanced with fresh greens
3. **Minimal cognitive load** through progressive disclosure and clear visual hierarchy
4. **Micro-interactions that delight** without becoming annoying over time
5. **Mobile-first, touch-optimized patterns** with generous tap targets and bottom navigation

**Confidence Level:** High (85%) - Based on extensive industry examples, UX research, and psychological studies.

---

## Component Personality Scale Recommendation

### Recommended Position: 70% Playful / 30% Minimal

**Rationale:**
- Food apps that lean playful (like Tasty) show higher engagement with younger audiences
- Meal planning requires trust and reliability (hence 30% minimal/professional)
- PostHog's "dev tool" philosophy prevents overly childish aesthetics
- Clay.com's minimalism keeps cognitive load low during complex tasks

### Visual Personality Traits

**Playful Elements (70%):**
- Rounded corners (8-12px border radius on buttons, 12-16px on cards)
- Vibrant appetite-stimulating colors (red, orange, yellow accents)
- Delightful micro-interactions on key actions
- Friendly microcopy ("Dive in" vs "Get Started")
- Illustrated empty states with food-themed characters
- Animated feedback on recipe saves/additions

**Minimal Elements (30%):**
- Clean typography with clear hierarchy
- Generous whitespace in recipe cards
- Limited color palette (3-4 primary colors + neutrals)
- Fast, subtle animations (<300ms)
- Bottom navigation with max 5 items
- Simple iconography (preferably outline style)

**Confidence:** 80% - Aligns with successful food app patterns while maintaining functional requirements

---

## 1. Button Design Patterns

### Shape & Corners

**Recommendation: Rounded Corners (8-12px radius)**

**Evidence:**
- Rounded CTA buttons get 17-55% higher click-through rates than sharp-cornered ones
- Neuroimaging studies show sharp angles trigger subtle stress responses
- 95% of people across cultures associate curvy shapes with friendliness (Bouba/Kiki Effect)
- Rounded corners reduce cognitive load and mimic natural shapes

**When to Use Sharp Corners:**
- Secondary/tertiary actions that need to feel professional
- Admin/settings interfaces
- Data-heavy dashboard sections

**Example Implementation with Radix + Tailwind:**
```tsx
// Primary action button (playful)
<Button className="rounded-xl bg-orange-500 hover:bg-orange-600
                   px-6 py-3 shadow-md transition-all duration-200
                   hover:scale-105 active:scale-95">
  Add to Meal Plan
</Button>

// Secondary action button (minimal)
<Button className="rounded-lg border-2 border-gray-300
                   px-4 py-2 hover:border-gray-400">
  View Details
</Button>
```

**Confidence:** 90% - Strong psychological and performance data

---

### Hover States & Interactions

**Recommendation: Playful but Subtle Transformations**

**Best Practices for 2025:**
- Use CSS transitions instead of JavaScript (lighter, faster)
- Combine 2-3 effects: scale + color + shadow
- Duration: 150-200ms for snappy feedback
- Avoid heavy blurs or complex gradients (performance)

**Playful Hover Patterns for Food Apps:**

1. **Scale + Bounce** (Primary CTAs)
   - `hover:scale-105` + spring animation
   - Best for: "Add to Cart", "Save Recipe", "Start Cooking"

2. **Color Flash** (Creative/Fun Actions)
   - Multi-color gradient shifts
   - Best for: "Random Recipe", "Surprise Me"

3. **Lift with Shadow** (Recipe Cards)
   - Subtle elevation increase
   - Best for: Hovering over recipe cards, meal plan items

4. **Fizzy/Bubble Effect** (Celebratory Actions)
   - Floating particles on hover
   - Best for: "Recipe Completed", "Week Planned"

**Example Hover States:**
```css
/* Playful primary button */
.btn-primary {
  transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.btn-primary:hover {
  transform: scale(1.05) translateY(-2px);
  box-shadow: 0 8px 16px rgba(255, 107, 0, 0.3);
}

/* Recipe card lift */
.recipe-card {
  transition: transform 150ms ease, box-shadow 150ms ease;
}
.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}
```

**Accessibility Considerations:**
- Provide equivalent focus states for keyboard navigation
- Don't rely solely on color changes
- Test hover animations on tablets/hybrids
- Allow users to disable motion (prefers-reduced-motion)

**Confidence:** 85% - Well-established patterns with accessibility caveats

---

### Color Psychology for Buttons

**Primary Actions: Warm Appetite Stimulants**
- **Red**: Stimulates appetite, creates urgency (use for primary CTAs)
- **Orange**: Energetic, friendly, stimulates social conversation (recommended primary)
- **Yellow**: Happiness, optimism, metabolism boost (accent/secondary)

**Secondary Actions: Cool Trustworthy Tones**
- **Green**: Fresh, healthy, natural (dietary filters, healthy badges)
- **Blue**: Trust, calm, professional (settings, account, data)
- **Purple**: Creative, premium (special features, pro tier)

**Anti-Appetite (Use Sparingly):**
- **Blue**: Suppresses appetite (avoid for recipe imagery)
- **Purple**: Can suppress appetite if too prominent

**Recommended Button Color System:**
```css
/* Primary actions */
.btn-primary {
  bg: orange-500 (#f97316)
  hover: orange-600 (#ea580c)
}

/* Success/Healthy */
.btn-success {
  bg: green-500 (#22c55e)
  hover: green-600 (#16a34a)
}

/* Secondary/Neutral */
.btn-secondary {
  bg: gray-100 (#f3f4f6)
  border: gray-300 (#d1d5db)
  hover-border: gray-400 (#9ca3af)
}

/* Destructive */
.btn-destructive {
  bg: red-500 (#ef4444)
  hover: red-600 (#dc2626)
}
```

**Confidence:** 85% - Based on color psychology research specific to food industry

---

### Button Microcopy

**Recommendation: Deliberately Playful, Confident, and Thematic**

**Research Findings:**
- "Dive in" > "Start cooking" (less robotic, more inviting)
- "Let's cook" > "Begin" (warmer, collaborative)
- Progress dots > explicit "Next" buttons (reduces pressure)

**Recommended Button Labels:**

| Context | Avoid | Use | Personality |
|---------|-------|-----|-------------|
| Start cooking mode | "Begin Recipe" | "Let's Cook!" | Playful |
| Save recipe | "Add to Library" | "Save for Later" | Clear |
| Plan week | "Generate Plan" | "Plan My Week" | Personal |
| Random recipe | "Shuffle" | "Surprise Me" | Playful |
| Shopping list | "Export List" | "Take to Store" | Practical |
| Complete recipe | "Mark Done" | "Nailed It!" | Celebratory |
| Onboarding | "Next" | Use progress dots | Minimal pressure |

**Confidence:** 75% - Based on one detailed case study + general UX principles

---

## 2. Recipe Card Design Patterns

### Image Placement & Hierarchy

**Recommendation: Large Hero Image + Minimal Text Overlay**

**Best Practices:**
- **Image size:** Minimum 300x300px, ideally 400x300px for landscape cards
- **Aspect ratio:** 4:3 for landscape, 3:4 for portrait, 1:1 for grid
- **Position:** Top of card (establishes appetite appeal immediately)
- **Whitespace:** Generous padding around text (prevents overcrowding)
- **Quality:** Export JPGs at ~80% quality, target 200-250kb per image

**Card Anatomy (Priority Order):**
1. **Hero Image** (40-50% of card height)
   - Large, appetizing food photo
   - Subtle gradient overlay for text readability

2. **Recipe Title** (large, bold font)
   - Clear > clever (searchability matters)
   - 1-2 lines max before truncation

3. **Quick Stats** (icons + numbers)
   - Cook time (🕐)
   - Calories (🔥) *optional based on user settings*
   - Servings (👥)
   - Difficulty (⭐) *if applicable*

4. **Ingredient Availability** (optional)
   - "3/8 ingredients in pantry" badge
   - Color-coded: green (all), yellow (most), red (few)

5. **Action Buttons** (bottom)
   - Primary: "Add to Plan" (prominent)
   - Secondary: Like/Save (icon only)
   - Tertiary: Share (icon only)

**Example Card Layout:**
```tsx
<Card className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl
                 transition-all duration-200 hover:-translate-y-1">
  {/* Hero Image */}
  <div className="relative h-48 w-full">
    <Image src={recipe.image} fill className="object-cover" />
    <div className="absolute top-2 right-2">
      <Badge variant="success">Quick & Easy</Badge>
    </div>
  </div>

  {/* Content */}
  <div className="p-4 space-y-3">
    <h3 className="text-xl font-bold line-clamp-2">
      {recipe.title}
    </h3>

    {/* Quick Stats */}
    <div className="flex gap-4 text-sm text-gray-600">
      <span className="flex items-center gap-1">
        <ClockIcon className="w-4 h-4" />
        {recipe.cookTime}
      </span>
      <span className="flex items-center gap-1">
        <UsersIcon className="w-4 h-4" />
        {recipe.servings}
      </span>
    </div>

    {/* Ingredient Availability */}
    <div className="flex items-center gap-2 text-sm">
      <span className="text-green-600 font-medium">
        6/8 ingredients available
      </span>
    </div>

    {/* Actions */}
    <div className="flex gap-2 pt-2">
      <Button className="flex-1 rounded-xl bg-orange-500">
        Add to Week
      </Button>
      <IconButton variant="ghost">
        <HeartIcon />
      </IconButton>
      <IconButton variant="ghost">
        <ShareIcon />
      </IconButton>
    </div>
  </div>
</Card>
```

**Information Density:**
- **High Priority:** Image, title, cook time, servings
- **Medium Priority:** Calories, difficulty, ingredient match
- **Low Priority:** Author, date added, categories
- **Avoid Overload:** Max 5-6 data points visible before interaction

**Confidence:** 90% - Consistent pattern across successful food apps

---

### Card States & Interactions

**Hover State:**
- Lift effect (translateY -4px)
- Shadow increase (md → xl)
- Subtle scale on image (1.0 → 1.05)
- Duration: 150-200ms

**Selected/Planned State:**
- Border glow (orange or green)
- "Planned for Monday" badge overlay
- Checkmark icon in corner

**Skeleton Loading:**
- Placeholder cards with pulsing animation
- Same dimensions as real cards
- "Hold on, your food is coming, we're just plating it"

**Confidence:** 85% - Standard card interaction patterns

---

## 3. Navigation Patterns

### Recommended Structure: Bottom Navigation Bar

**Why Bottom Navigation:**
- Thumb-friendly on mobile (primary use case)
- Direct access to core features
- Consistent across meal planning apps
- Faster than hamburger menus

**Cardinal Rules:**
- **Max 5 items** (more = clutter and accidental taps)
- **Icons + labels** for clarity (don't rely on icons alone)
- **Highlight active state** clearly (color + weight)

**Recommended Bottom Nav Items (Priority Order):**

1. **🏠 Home/Feed**
   - Personalized recipe feed
   - Today's meal banner
   - Quick search

2. **📅 Plan**
   - Weekly calendar view
   - Drag-and-drop meal planning
   - Today's meals highlighted

3. **🔍 Discover**
   - Recipe search
   - Categories/filters
   - Trending/new recipes

4. **🛒 List**
   - Shopping list
   - Pantry inventory
   - Missing ingredients

5. **👤 Profile/Settings**
   - Dietary preferences
   - Saved recipes
   - Account settings

**Alternative (if 6 items needed):**
- Consider tabs within sections
- Use floating action button (FAB) for primary action
- Nest less-used features in Profile

**Accessibility:**
- Minimum 48x48px touch target
- Clear focus states for keyboard navigation
- Semantic HTML (`<nav>`, `role="navigation"`)

**Confidence:** 90% - Industry standard for mobile-first apps

---

### Filter Panel & Search

**Recommendation: Bottom Sheet + Persistent Search Bar**

**Filter Panel Design:**
- Slides up from bottom (mobile native pattern)
- Semi-transparent backdrop
- Easy to dismiss (swipe down or tap outside)
- Sticky "Apply Filters" button
- Show active filter count badge

**Search Bar:**
- Persistent at top of Browse/Discover
- Predictive autocomplete
- Recent searches saved
- Voice search option (accessibility)

**Filter Categories (Progressive Disclosure):**
1. **Quick Presets** (one-tap)
   - "I can cook now" (ingredients you have)
   - "Quick & Easy" (<30 min)
   - "Healthy Options"
   - "Meal Prep Friendly"

2. **Detailed Filters** (expand to show)
   - Time: <15 min, 15-30, 30-60, 60+
   - Dietary: Vegetarian, Vegan, Gluten-Free, etc.
   - Cuisine: Italian, Mexican, Asian, etc.
   - Ingredients: Include/Exclude specific items

**Confidence:** 85% - Based on successful recipe app patterns

---

### Weekly Calendar/Meal Plan View

**Recommendation: Horizontal Scrollable Week + Drag-and-Drop**

**Layout Options:**

**Option A: Card-Based Week View**
- Each day is a vertical column
- Breakfast/Lunch/Dinner rows
- Horizontal scroll through week
- Drag recipe cards into slots

**Option B: List-Based Day View**
- Single day view (default: today)
- Swipe left/right to change days
- Week navigation at top
- Vertical scroll through meals

**Recommended: Hybrid Approach**
- Default to "Today + Tomorrow" preview
- Tap "Full Week" to expand to 7-day view
- Drag-and-drop from bottom recipe drawer
- Color-coded meals (breakfast=yellow, lunch=orange, dinner=red)

**Key Features:**
- **Empty state slots:** "Add breakfast" with plus icon
- **Quick actions:** Long-press for options (swap, remove, duplicate)
- **Ingredient aggregation:** "Shop for week" button calculates all needs
- **Visual density control:** Compact vs expanded view toggle

**Example Calendar UI:**
```tsx
<CalendarView>
  {/* Week Navigation */}
  <WeekNav className="flex justify-between items-center p-4">
    <Button variant="ghost"><ChevronLeft /></Button>
    <span className="font-semibold">Week of Dec 18</span>
    <Button variant="ghost"><ChevronRight /></Button>
  </WeekNav>

  {/* Day Columns */}
  <div className="flex overflow-x-auto gap-3 p-4">
    {weekDays.map(day => (
      <DayColumn key={day} className="min-w-[280px]">
        <DayHeader active={day === today}>
          {day.name}
        </DayHeader>

        {/* Meal Slots */}
        <MealSlot type="breakfast" isEmpty={!day.breakfast}>
          {day.breakfast ? (
            <RecipeCard compact {...day.breakfast} />
          ) : (
            <EmptySlot>
              <PlusIcon />
              <span>Add breakfast</span>
            </EmptySlot>
          )}
        </MealSlot>

        {/* Repeat for lunch, dinner */}
      </DayColumn>
    ))}
  </div>
</CalendarView>
```

**Collaboration Features (if multi-user):**
- Color-coded by family member who added
- Comments/notes on meals
- Voting/approval system
- "Suggest meal" notifications

**Confidence:** 80% - Strong patterns but requires user testing for your specific audience

---

## 4. Empty States & Onboarding

### Empty State Philosophy

**Recommendation: Delightful Illustrations + Clear Next Steps**

**Principles:**
- Visual cues give direction on how to enjoy the product
- Narrative through doodles creates connection
- Not just decorative, but instructional
- Avoid generic stock illustrations

**Empty State Categories:**

**1. First-Time User (No Data Yet)**
- **Visual:** Friendly food character (e.g., smiling avocado, chef hat mushroom)
- **Message:** "Your meal plan is waiting to be filled with delicious ideas!"
- **CTA:** "Discover Recipes" (primary), "Take Quick Tour" (secondary)

**2. No Results (Search/Filter)**
- **Visual:** Confused food character looking in empty fridge
- **Message:** "Hmm, we couldn't find that dish. Try different keywords?"
- **CTA:** "Clear Filters", "Browse Popular Recipes"

**3. Shopping List Empty**
- **Visual:** Happy shopping bag with checkmark
- **Message:** "All caught up! Your shopping list is empty."
- **CTA:** "Plan Next Week" to generate new list

**4. Completed Week**
- **Visual:** Celebration confetti + food characters high-fiving
- **Message:** "You crushed this week! 7/7 meals planned."
- **CTA:** "Plan Next Week", "Share Achievement"

**5. Zero State (Virtual Pizza Example)**
- **Visual:** Minimalist pizza illustration
- **Message:** "Create your perfect pizza to see it come to life"
- **CTA:** Interactive pizza builder

**Illustration Resources:**
- Figma Community: "Empty State Illustrations Freebies" (25 themes)
- Blush.design: Customizable illustration library
- LottieFiles: Animated empty state micro-interactions

**Confidence:** 85% - Well-established UX pattern with food app examples

---

### Onboarding Flow Best Practices

**Recommendation: Progressive Onboarding (Not Static Tour)**

**Anti-Patterns to Avoid:**
- 5+ intro screens before value
- Asking for contacts/location before proving worth
- Forced registration to see features
- Onboarding that looks nothing like actual app

**Recommended Flow:**

**1. Welcome Screen (Minimal Pressure)**
- Warm greeting, no explicit "Next" button
- Progress dots indicate movement
- Copywriting: calm, friendly, personal
- Example: "Welcome! Let's make meal planning less stressful."

**2. Personalization (2-3 Quick Questions)**
- Dietary preferences (vegetarian, vegan, allergies)
- Cooking skill level
- Household size
- Time available for cooking
- **Skip Option Available**

**3. Value Demonstration (Show, Don't Tell)**
- Auto-generate sample meal plan based on preferences
- "Here's what your week could look like"
- Allow exploration before commitment

**4. Optional Account Creation**
- "Sign up to save your plan" (not required upfront)
- Social sign-in options
- Clear explanation of why each permission needed

**5. Contextual Hints (Progressive Disclosure)**
- Tooltips appear when first encountering features
- "Tap and hold to see options"
- "Swipe to change days"
- Dismissible and never repeat

**Microcopy Examples:**
- ❌ "Welcome to FoodApp. Get started by creating your profile."
- ✅ "Hey there! Let's find meals you'll actually want to cook."

- ❌ "Next"
- ✅ "Sounds Good" or "Let's Go"

- ❌ "Setup Complete"
- ✅ "You're All Set!" or "Let's Cook!"

**Emotional Considerations:**
- Reduce friction (delayed signup)
- Personalize experience (smart questions)
- Quick wins (show value fast)
- Respect user time (skippable steps)

**Testing & Iteration:**
- A/B test number of onboarding screens (2-3 vs 4-5)
- Track completion rates per step
- Monitor time-to-first-value

**Confidence:** 85% - Based on comprehensive 200+ onboarding flow study

---

## 5. Form Design for Recipe Input

### Ingredient List Entry

**Recommendation: Dynamic Single-Field Input with Smart Parsing**

**Anti-Patterns:**
- Multiple dropdowns per ingredient (overwhelming, slow)
- Separate fields for amount/unit/ingredient (tedious)
- Forced structured input (inhibits natural entry)

**Best Practice: Natural Language Input**
```
"2 cups flour" → auto-parses to:
  amount: 2
  unit: cups
  ingredient: flour
```

**Features:**
- **Autocomplete:** Suggest common ingredients as user types
- **Smart defaults:** Recognize "1 onion" = 1 medium onion
- **Flexible format:** Accept "2c flour" or "2 cups of flour"
- **Edit capability:** Tap any ingredient to modify
- **Substitutes:** Hold/long-press to see alternates

**Form Layout:**
```tsx
<IngredientInput>
  <Label>Add Ingredient</Label>
  <Input
    type="text"
    placeholder="e.g., 2 cups flour"
    onBlur={parseIngredient}
    autoComplete="ingredients"
  />

  {/* Live Preview */}
  {parsedIngredient && (
    <PreviewChip>
      <span className="font-medium">{parsedIngredient.amount}</span>
      <span className="text-gray-600">{parsedIngredient.unit}</span>
      <span>{parsedIngredient.name}</span>
      <IconButton onClick={edit}><PencilIcon /></IconButton>
    </PreviewChip>
  )}

  {/* Ingredient List */}
  <div className="space-y-2">
    {ingredients.map((ing, i) => (
      <IngredientRow key={i}>
        <Checkbox
          checked={ing.inPantry}
          label={`${ing.amount} ${ing.unit} ${ing.name}`}
        />
        <IconButton onClick={() => remove(i)}>
          <TrashIcon />
        </IconButton>
      </IngredientRow>
    ))}
  </div>
</IngredientInput>
```

**Accessibility:**
- Clear focus indicators
- Keyboard shortcuts (Enter to add, Esc to cancel)
- Screen reader announcements for additions/removals

**Confidence:** 80% - Based on recipe conversion app case study

---

### Instruction Steps

**Recommendation: Numbered Auto-Expanding Textarea**

**Best Practice:**
- **Numbered automatically** (don't make user type "Step 1:")
- **Auto-expand textarea** as user types (no scrolling within field)
- **Reorderable** via drag handle
- **Image upload** optional per step
- **Timer suggestion** detection ("bake for 20 minutes" → offer timer)

**Layout:**
```tsx
<InstructionList>
  {steps.map((step, i) => (
    <InstructionStep key={step.id}>
      {/* Drag Handle */}
      <DragHandle {...dragHandleProps}>
        <GripVertical className="text-gray-400" />
      </DragHandle>

      {/* Step Number */}
      <StepNumber>{i + 1}</StepNumber>

      {/* Instruction Text */}
      <Textarea
        value={step.text}
        onChange={e => updateStep(i, e.target.value)}
        placeholder="Describe this step..."
        autoResize
        className="flex-1"
      />

      {/* Optional Image */}
      <ImageUpload step={i} />

      {/* Remove Button */}
      <IconButton onClick={() => removeStep(i)}>
        <TrashIcon />
      </IconButton>
    </InstructionStep>
  ))}

  <Button variant="ghost" onClick={addStep}>
    + Add Step
  </Button>
</InstructionList>
```

**Smart Features:**
- **Timer Detection:** Regex for "X minutes" → offer to set timer
- **Temperature Detection:** "350°F" → suggest conversion to °C
- **Ingredient Linking:** Recognize ingredients mentioned → link to pantry

**Confidence:** 75% - Logical UX improvements, needs user testing

---

### Recipe Metadata Form

**Recommendation: Progressive Disclosure with Smart Defaults**

**Required Fields (Visible Upfront):**
- Recipe title
- Cook time (dropdown: <15, 15-30, 30-60, 1-2hr, 2+hr)
- Servings (number input with +/- buttons)
- Category (searchable dropdown)

**Optional Fields (Collapsible Section):**
- Prep time
- Total time (auto-calculated if blank)
- Difficulty (Easy/Medium/Hard)
- Cuisine type
- Dietary tags (checkboxes: vegetarian, vegan, GF, etc.)
- Calories per serving
- Source/attribution

**Smart Defaults:**
- Total time = prep + cook if both provided
- Difficulty = auto-suggest based on ingredient count + step count
- Category = suggest based on ingredients (e.g., "pasta" ingredient → Italian category)

**Validation:**
- Required fields highlighted on submit attempt
- Inline validation (e.g., servings must be > 0)
- Helpful error messages ("Hmm, we need a title to save this recipe")

**Confidence:** 85% - Standard form UX patterns

---

## 6. Micro-interactions & Animation Budget

### Animation Philosophy

**Mantra: "Delightful the first time, invisible the hundredth time"**

**Budget Principles:**
- **Functional animations** (provide feedback/guidance) = generous budget
- **Celebratory animations** (delight moments) = moderate budget
- **Decorative animations** (no purpose) = zero budget

---

### Priority 1: Functional Micro-interactions (Always Include)

**1. Button Press Feedback**
- **Trigger:** Button click/tap
- **Effect:** Scale down (0.95) + slight shadow reduction
- **Duration:** 100ms
- **Purpose:** Confirms interaction registered
- **Frequency:** Very high → MUST be instant and lightweight

**2. Form Validation**
- **Trigger:** Input blur or submit
- **Effect:**
  - ✅ Success: Green checkmark fade-in + gentle border pulse
  - ❌ Error: Subtle shake (3px left-right, 2x) + red border
- **Duration:** 150ms shake, 200ms fade
- **Purpose:** Clear success/failure feedback
- **Frequency:** High → Keep subtle

**3. Loading States**
- **Trigger:** Data fetching
- **Effect:** Skeleton screens with pulsing gradient
- **Duration:** Continuous until loaded
- **Purpose:** Shows progress, reduces perceived wait time
- **Microcopy:** "We're plating your recipes..."

**4. Add to List/Plan**
- **Trigger:** Adding recipe to meal plan or shopping list
- **Effect:** Brief scale + checkmark overlay + haptic feedback (mobile)
- **Duration:** 300ms
- **Purpose:** Confirms action success
- **Frequency:** High → Must remain satisfying over time

**5. Drag & Drop Preview**
- **Trigger:** Dragging recipe card to calendar
- **Effect:**
  - Dragged item: 90% opacity, slight scale up (1.05)
  - Drop zone: Highlighted border, background tint
  - Snap to grid on release
- **Duration:** Instant response, 150ms settle
- **Purpose:** Spatial understanding of action

**Confidence:** 95% - Essential feedback mechanisms

---

### Priority 2: Delightful Moments (Selective Use)

**6. Recipe Save Success**
- **Trigger:** Favoriting/saving a recipe
- **Effect:** Heart icon fills with color + small scale bounce
- **Duration:** 400ms
- **Purpose:** Emotional reward
- **Frequency:** Medium → Can be more pronounced

**7. Week Completion**
- **Trigger:** All 7 days have meals planned
- **Effect:** Confetti burst from top + "Week Complete!" toast
- **Duration:** 1.5s confetti, 3s toast
- **Purpose:** Celebration, encourages continued use
- **Frequency:** Low → Big moment deserves big animation
- **Alternative:** Lottie animation of food characters celebrating

**8. Empty State → First Item**
- **Trigger:** Adding first recipe to empty meal plan
- **Effect:** Gentle fade-in + slide-up of recipe card
- **Duration:** 300ms
- **Purpose:** Welcoming, reduces harshness of empty→full transition
- **Frequency:** Once per user → Can be more elaborate

**9. Random Recipe Button**
- **Trigger:** Tapping "Surprise Me" button
- **Effect:** Slot machine-style card flip through 3-4 recipes before landing
- **Duration:** 1.2s total
- **Purpose:** Playful, builds anticipation
- **Frequency:** Medium → Should remain fun, not annoying

**10. Shopping List Item Checkoff**
- **Trigger:** Checking item as purchased
- **Effect:**
  - Strikethrough animation (left to right)
  - Gentle fade to 50% opacity
  - Optional: Satisfying checkmark sound (user preference)
- **Duration:** 200ms
- **Purpose:** Progress visualization, dopamine hit
- **Frequency:** Very high during shopping → Must stay satisfying

**Confidence:** 80% - Balances delight with restraint

---

### Priority 3: Avoid These (Annoying Over Time)

**❌ Page Transition Animations**
- **Why:** Slow down navigation after first few uses
- **Alternative:** Instant transitions or max 150ms fade

**❌ Auto-Playing Animations on Scroll**
- **Why:** Distracting, increases cognitive load
- **Alternative:** Static illustrations

**❌ Elaborate Onboarding Animations**
- **Why:** Most users skip rapidly
- **Alternative:** Simple fades, progress dots

**❌ Hover Effects That Change Layout**
- **Why:** Causes page reflow, feels unstable
- **Alternative:** Use transform/opacity (no layout shift)

**❌ Loading Spinners >3s**
- **Why:** Anxiety-inducing
- **Alternative:** Skeleton screens + progress indicators

**Confidence:** 90% - Based on long-term UX research

---

### Animation Performance Guidelines

**Technical Requirements:**
- Use `transform` and `opacity` (GPU-accelerated)
- Avoid `width`, `height`, `top`, `left` (cause reflow)
- Use `will-change` sparingly (memory overhead)
- Respect `prefers-reduced-motion` media query
- Target 60fps (16.6ms per frame)

**Example Optimized Animation:**
```css
/* Good: GPU-accelerated */
.recipe-card {
  transition: transform 200ms ease, opacity 200ms ease;
}
.recipe-card:hover {
  transform: translateY(-4px) scale(1.02);
}

/* Bad: Causes reflow */
.recipe-card:hover {
  margin-top: -4px; /* Forces layout recalculation */
  width: 102%; /* Triggers reflow */
}
```

**Accessibility:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Confidence:** 95% - Standard performance best practices

---

### Recommended Micro-interaction Library

**For Radix + React:**
- **Framer Motion:** Powerful, composable, works with Radix via `asChild`
- **LottieFiles:** Food App Micro-interactions Pack (42 animated icons)
- **React Spring:** Physics-based animations, great for drag-and-drop

**Example with Framer Motion + Radix:**
```tsx
import { motion } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';

<Dialog.Content asChild>
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.2 }}
  >
    {/* Dialog content */}
  </motion.div>
</Dialog.Content>
```

**Confidence:** 85% - Based on Radix documentation and community patterns

---

## 7. Radix UI Implementation Best Practices

### Component Composition with `asChild`

**Key Principle:** Use `asChild` to merge Radix behavior with custom components

**Example: Custom Button with Radix Tooltip**
```tsx
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Dialog from '@radix-ui/react-dialog';

// Compose Tooltip + Dialog triggers on custom button
<Tooltip.Root>
  <Tooltip.Trigger asChild>
    <Dialog.Trigger asChild>
      <Button variant="primary">
        Add Recipe
      </Button>
    </Dialog.Trigger>
  </Tooltip.Trigger>
  <Tooltip.Content>
    Click to add recipe to your plan
  </Tooltip.Content>
</Tooltip.Root>
```

**Benefits:**
- Single button element (no wrapper divs)
- Combined behavior from multiple primitives
- Full control over styling

---

### Accessibility by Default

**Radix Handles:**
- ARIA roles and attributes
- Focus management
- Keyboard navigation
- Focus trapping in modals

**Your Responsibility:**
- Verify ARIA labels when customizing
- Test keyboard navigation
- Ensure color contrast meets WCAG AA
- Provide focus visible styles

**Example: Accessible Dialog**
```tsx
<Dialog.Root>
  <Dialog.Trigger asChild>
    <Button>Open Recipe</Button>
  </Dialog.Trigger>

  <Dialog.Portal>
    <Dialog.Overlay className="bg-black/50" />
    <Dialog.Content
      aria-labelledby="recipe-title"
      aria-describedby="recipe-description"
    >
      <Dialog.Title id="recipe-title">
        Spaghetti Carbonara
      </Dialog.Title>

      <Dialog.Description id="recipe-description">
        A classic Italian pasta dish
      </Dialog.Description>

      {/* Recipe details */}

      <Dialog.Close asChild>
        <Button>Close</Button>
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

---

### Styling Strategy

**Recommendation: Tailwind + CSS Variables for Theming**

**Setup:**
```css
/* globals.css */
:root {
  --color-primary: 249 115 22; /* orange-500 */
  --color-primary-hover: 234 88 12; /* orange-600 */
  --radius-sm: 0.5rem; /* 8px */
  --radius-md: 0.75rem; /* 12px */
  --radius-lg: 1rem; /* 16px */
}

[data-theme="retro"] {
  --color-primary: 128 128 128; /* Windows 95 gray */
  --radius-sm: 0;
  --radius-md: 0;
  --radius-lg: 0;
}
```

**Usage with Radix:**
```tsx
<Dialog.Content className="
  bg-white
  rounded-[var(--radius-lg)]
  p-6
  shadow-xl
  data-[state=open]:animate-in
  data-[state=closed]:animate-out
">
  {/* Content */}
</Dialog.Content>
```

---

### Common Patterns for Food App

**1. Recipe Quick View (Dialog)**
```tsx
<Dialog.Root>
  <Dialog.Trigger asChild>
    <RecipeCard {...recipe} />
  </Dialog.Trigger>

  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/40" />
    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <RecipeDetail {...recipe} />
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

**2. Filter Panel (Sheet/Drawer)**
```tsx
<Sheet.Root>
  <Sheet.Trigger asChild>
    <Button variant="outline">
      <FilterIcon /> Filters
    </Button>
  </Sheet.Trigger>

  <Sheet.Portal>
    <Sheet.Overlay />
    <Sheet.Content side="bottom" className="h-[80vh]">
      <Sheet.Title>Filter Recipes</Sheet.Title>
      {/* Filter checkboxes, sliders, etc. */}
    </Sheet.Content>
  </Sheet.Portal>
</Sheet.Root>
```

**3. Dietary Preferences (Checkbox Group)**
```tsx
<CheckboxGroup>
  <Label>Dietary Restrictions</Label>
  {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'].map(diet => (
    <div key={diet} className="flex items-center gap-2">
      <Checkbox.Root
        id={diet}
        checked={preferences.includes(diet)}
        onCheckedChange={checked => toggle(diet, checked)}
        className="w-5 h-5 border-2 rounded data-[state=checked]:bg-primary"
      >
        <Checkbox.Indicator>
          <CheckIcon className="w-4 h-4 text-white" />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <Label htmlFor={diet}>{diet}</Label>
    </div>
  ))}
</CheckboxGroup>
```

**4. Ingredient Quantity Adjuster (Slider)**
```tsx
<div>
  <Label>Servings: {servings}</Label>
  <Slider.Root
    value={[servings]}
    onValueChange={([val]) => setServings(val)}
    min={1}
    max={12}
    step={1}
    className="relative flex items-center w-full h-5"
  >
    <Slider.Track className="relative h-1 w-full bg-gray-200 rounded">
      <Slider.Range className="absolute h-full bg-orange-500 rounded" />
    </Slider.Track>
    <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-orange-500 rounded-full shadow" />
  </Slider.Root>
</div>
```

**Confidence:** 90% - Direct from Radix documentation + community best practices

---

## 8. Windows 95 Retro Mode Considerations

### When Retro Mode is Active

**Component Transformations:**

**Buttons:**
- Sharp corners (border-radius: 0)
- 3D beveled edges (inset box-shadow)
- System gray background (#c0c0c0)
- 2px border with highlight/shadow effect

**Cards:**
- Sharp corners
- Drop shadow (not modern blur)
- System window chrome
- Title bar with minimize/maximize/close buttons

**Typography:**
- MS Sans Serif or Tahoma font-family
- Crisp, non-anti-aliased rendering (if possible)
- Classic system blue for links

**Colors:**
- Replace orange-500 with system blue (#0000ff)
- Gray-50 background → #c0c0c0
- White → #ffffff (pure)
- No gradients (solid colors only)

**Example Retro Button:**
```tsx
const Button = ({ children, ...props }) => {
  const theme = useTheme();

  return (
    <button
      className={cn(
        "px-4 py-2 font-semibold transition-all",
        theme === 'retro'
          ? "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-none active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white"
          : "bg-orange-500 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5"
      )}
      {...props}
    >
      {children}
    </button>
  );
};
```

**Implementation Resources:**
- **React95:** Complete Windows 95 component library
- **Themesberg Windows 95 UI Kit:** Bootstrap-based components
- **Figma Windows 95 UI Kit:** Design system for mockups

**Confidence:** 85% - Based on available libraries and nostalgia design trends

---

## 9. Summary & Prioritization Matrix

### Immediate Implementation (High ROI)

| Component | Priority | Effort | Impact | Confidence |
|-----------|----------|--------|--------|------------|
| Rounded buttons (8-12px) | P0 | Low | High | 90% |
| Recipe card layout (image-first) | P0 | Medium | High | 90% |
| Bottom navigation (5 items) | P0 | Low | High | 90% |
| Button hover states | P0 | Low | High | 85% |
| Empty states with illustrations | P1 | Medium | High | 85% |
| Form validation animations | P1 | Low | Medium | 85% |

### Medium-Term Enhancements (Delight)

| Component | Priority | Effort | Impact | Confidence |
|-----------|----------|--------|--------|------------|
| Drag-and-drop meal planning | P1 | High | High | 80% |
| Celebratory animations | P2 | Medium | Medium | 80% |
| Smart ingredient parser | P1 | High | Medium | 75% |
| Filter bottom sheet | P1 | Medium | Medium | 85% |
| Progressive onboarding | P1 | Medium | High | 85% |

### Future Nice-to-Haves (Polish)

| Component | Priority | Effort | Impact | Confidence |
|-----------|----------|--------|--------|------------|
| Windows 95 retro mode | P3 | High | Low | 85% |
| Recipe quick view dialog | P2 | Medium | Medium | 90% |
| Lottie micro-interactions | P2 | Medium | Low | 80% |
| Voice search | P3 | High | Low | 70% |
| Skeleton screens | P2 | Low | Low | 90% |

---

## 10. Sources & References

### Button Design & Psychology
- [Rounded vs Sharp Corners Button Design UX Psychology](https://cieden.com/book/sub-atomic/shapes/rounded-buttons-and-usability)
- [The Psychology of Rounded Buttons in User Interface Design](https://medium.com/@angshuman2k12/the-psychology-of-rounded-buttons-in-user-interface-design-c3c296c8fb9b)
- [Button State Design: 20 Best Examples](https://www.mockplus.com/blog/post/button-state-design)
- [Hover Effects for Buttons: Modern Techniques 2025](https://shapebootstrap.net/hover-effects-for-buttons-modern-techniques-in-web-design-2025/)

### Recipe Card Design
- [UI Experiments: Options for Recipe Cards in a Food App](https://blog.tubikstudio.com/ui-experiments-options-for-recipe-cards-in-a-food-app/)
- [Recipe Card UI Design Best Examples](https://www.subframe.com/tips/recipe-website-design-examples)
- [Cards UI Design — Best Practices](https://www.halo-lab.com/blog/card-ui-design)

### Color Psychology
- [Colors that Influence Food Sales](https://jenndavid.com/colors-that-influence-food-sales-infographic/)
- [Color Psychology for Restaurant Design](https://www.wasserstrom.com/blog/2022/12/07/color-psychology-for-restaurant-design/)
- [How Colors Affect Appetite](https://www.colorpsychology.org/blog/color-appetite/)

### Navigation & UX Patterns
- [Case Study: Perfect Recipes App UX Design](https://blog.tubikstudio.com/case-study-recipes-app-ux-design/)
- [UI Patterns For Navigation That Makes Good UX Sense](https://usabilitygeek.com/ui-patterns-for-navigation-good-ux/)
- [Calendar UI Examples: 33 Inspiring Designs](https://www.eleken.co/blog-posts/calendar-ui)

### Micro-interactions & Animations
- [Food App Micro-interactions Animation Pack](https://lottiefiles.com/marketplace/food-app-micro-interactions)
- [Micro-Interactions That Delight: UX Animations](https://www.bigdropinc.com/blog/micro-interactions-that-delight-ux-animations-that-convert/)
- [Experience Design Essentials: Animated Microinteractions](https://www.smashingmagazine.com/2016/08/experience-design-essentials-animated-microinteractions-in-mobile-apps/)

### Empty States & Onboarding
- [Empty State - Food Ordering App](https://dribbble.com/shots/3689223-Empty-State-Food-Ordering-App)
- [40 Clever Empty State Designs for Mobile Apps](https://www.hongkiat.com/blog/mobile-app-empty-state-designs/)
- [All Set, Foodie: UX Writing for Cooking App Onboarding](https://medium.com/design-bootcamp/all-set-foodie-ux-writing-for-a-cooking-apps-onboarding-flow-bd59a39a7364)
- [Mobile Onboarding UX: 11 Best Practices for Retention](https://www.designstudiouiux.com/blog/mobile-app-onboarding-best-practices/)

### Form Design
- [UI Design Process: Recipe Conversion App](https://medium.com/@DMBrigman/ui-design-process-recipe-conversion-app-e08bd4a920fd)
- [Designing Button States: Tutorial and Best Practices](https://blog.logrocket.com/ux-design/designing-button-states/)

### Radix UI
- [Introduction – Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction)
- [Composition – Radix Primitives](https://www.radix-ui.com/primitives/docs/guides/composition)
- [Building a Design System with Radix](https://blog.logrocket.com/building-design-system-radix/)

### Design System Inspiration
- [PostHog Design System](https://posthog.com/components)
- [An Engineer's Guide to Vibe Design](https://posthog.com/newsletter/vibe-designing)
- [Clay.com Minimal Design Patterns](https://clay.global/blog/ux-guide)

### Retro UI
- [React95 - Windows 95 UI Components](https://react95.io/)
- [Windows 95 UI Kit - Themesberg](https://themesberg.com/product/ui-kit/windows-95-ui-kit)
- [Windows 95 UI Kit - Figma](https://www.figma.com/community/file/1254078490904184073/windows-95-ui-kit)

### Food App Specific
- [Playful Food App Design Examples](https://www.designrush.com/best-designs/apps/tasty)
- [6 Essential UI/UX Design Principles for Food Delivery Apps 2025](https://weaversweb.com/6-essential-ui-ux-design-principles-for-food-delivery-apps-in-2025/)
- [Best Food & Beverage App Designs 2025](https://www.designrush.com/best-designs/apps/food-beverage)

---

## Appendices

### A. Recommended Design Resources

**Figma Community:**
- Meal Planner App UI Kit
- Windows 95 Design System
- Empty State Illustrations Freebies

**Icon Libraries:**
- Lucide Icons (clean, consistent, tree-shakeable)
- Heroicons (Tailwind's official icon set)
- Phosphor Icons (playful alternatives)

**Animation:**
- Framer Motion (React animations)
- LottieFiles (pre-made animations)
- React Spring (physics-based)

**Fonts:**
- Headings: Inter, Outfit, or Manrope (modern, friendly)
- Body: Inter or System UI (readability)
- Retro: MS Sans Serif, Tahoma, or Fixedsys

### B. Color Palette Recommendation

**Primary (Appetite Stimulation):**
- Orange-500: #f97316 (main CTAs)
- Orange-600: #ea580c (hover states)
- Red-500: #ef4444 (urgent actions)
- Yellow-400: #facc15 (highlights, badges)

**Secondary (Freshness):**
- Green-500: #22c55e (success, healthy badges)
- Green-600: #16a34a (hover on success)

**Neutrals:**
- Gray-50: #f9fafb (backgrounds)
- Gray-100: #f3f4f6 (card backgrounds)
- Gray-300: #d1d5db (borders)
- Gray-600: #4b5563 (secondary text)
- Gray-900: #111827 (primary text)

**Retro Mode:**
- System Gray: #c0c0c0
- System Blue: #0000ff
- System Window: #ffffff
- Border Highlight: #ffffff
- Border Shadow: #404040

### C. Accessibility Checklist

- [ ] All interactive elements have 48x48px minimum touch target
- [ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for UI)
- [ ] Focus visible styles on all interactive elements
- [ ] Keyboard navigation works for all features
- [ ] ARIA labels present on icon-only buttons
- [ ] Form errors announced to screen readers
- [ ] Animations respect `prefers-reduced-motion`
- [ ] All images have descriptive alt text

---

**Document Version:** 1.0
**Last Updated:** December 18, 2025
**Next Review:** After initial prototype user testing
